#!/usr/bin/env node
/**
 * AI Trends Daily Summary
 * Fetches AI news from 20 sources, summarizes with Claude, posts to Notion
 * 
 * Runs daily at 8:00 AM CET via OpenClaw cron
 */

import Anthropic from "@anthropic-ai/sdk";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../../.env.notion") });
dotenv.config({ path: join(__dirname, "../../.env") });

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const AI_TRENDS_PAGE_ID = "32036888-7c48-8184-a47d-e9ad2c89f9f6";

const SOURCES = {
  "🔬 Research & Labs": [
    { name: "arXiv cs.AI",         url: "https://arxiv.org/list/cs.AI/recent" },
    { name: "OpenAI Blog",         url: "https://openai.com/blog" },
    { name: "DeepMind Research",   url: "https://deepmind.google/research" },
    { name: "Anthropic News",      url: "https://www.anthropic.com/news" },
    { name: "Meta AI Research",    url: "https://ai.meta.com/research/" },
  ],
  "📰 News & Journalismus": [
    { name: "The Verge AI",        url: "https://www.theverge.com/ai-artificial-intelligence" },
    { name: "TechCrunch AI",       url: "https://techcrunch.com/artificial-intelligence/" },
    { name: "VentureBeat AI",      url: "https://venturebeat.com/ai/" },
    { name: "Wired AI",            url: "https://www.wired.com/tag/artificial-intelligence/" },
    { name: "MIT Tech Review",     url: "https://www.technologyreview.com" },
    { name: "AI Times",            url: "https://www.aitimes.com" },
    { name: "AI News",             url: "https://www.artificialintelligence-news.com" },
  ],
  "🧠 Newsletter & Kuratiert": [
    { name: "Import AI",           url: "https://importai.substack.com" },
    { name: "The Sequence",        url: "https://thesequence.substack.com" },
    { name: "Morning Brew Tech",   url: "https://www.morningbrew.com/emerging-tech" },
    { name: "TLDR AI",             url: "https://tldr.tech/ai" },
  ],
  "🛠 Community & Tools": [
    { name: "HuggingFace Blog",    url: "https://huggingface.co/blog" },
    { name: "Papers With Code",    url: "https://paperswithcode.com" },
    { name: "Towards Data Science",url: "https://towardsdatascience.com" },
    { name: "Hacker News",         url: "https://news.ycombinator.com" },
  ],
};

// Simple fetch with timeout
async function fetchPage(url, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Alfred-AI-Bot/1.0)" },
    });
    const text = await res.text();
    // Strip HTML tags, collapse whitespace, limit length
    const clean = text
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&[a-z]+;/gi, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 8000);
    return clean;
  } catch (e) {
    return `[Fehler beim Laden: ${e.message}]`;
  } finally {
    clearTimeout(timer);
  }
}

async function summarizeWithClaude(rawContent) {
  const client = new Anthropic();

  const prompt = `Du bist ein KI-Nachrichten-Analyst. Analysiere die folgenden Rohinhalte von KI-News-Quellen und erstelle eine kompakte, deutschsprachige Zusammenfassung.

Struktur pro Kategorie:
- Maximal 3-5 Bullet Points mit den wichtigsten Nachrichten/Entwicklungen
- Fokus auf konkrete Neuigkeiten, Releases, Forschungsergebnisse
- Keine Marketing-Floskeln
- Falls eine Quelle keine verwertbaren Inhalte liefert, weglassen

FORMAT: Gib JSON zurück mit dieser Struktur:
{
  "headline": "kurze Schlagzeile des Tages (max 80 Zeichen)",
  "categories": {
    "🔬 Research & Labs": ["bullet1", "bullet2", ...],
    "📰 News & Journalismus": ["bullet1", "bullet2", ...],
    "🧠 Newsletter & Kuratiert": ["bullet1", "bullet2", ...],
    "🛠 Community & Tools": ["bullet1", "bullet2", ...]
  }
}

ROHINHALTE:
${rawContent}`;

  const message = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].text;
  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Kein JSON in Claude-Antwort");
  return JSON.parse(jsonMatch[0]);
}

function buildNotionBlocks(summary, date) {
  const blocks = [];

  // Header / Headline
  blocks.push({
    object: "block",
    type: "callout",
    callout: {
      icon: { emoji: "📰" },
      rich_text: [{ text: { content: summary.headline } }],
      color: "blue_background",
    },
  });

  blocks.push({ object: "block", type: "divider", divider: {} });

  // Each category
  for (const [category, bullets] of Object.entries(summary.categories)) {
    if (!bullets || bullets.length === 0) continue;

    blocks.push({
      object: "block",
      type: "heading_2",
      heading_2: {
        rich_text: [{ text: { content: category } }],
      },
    });

    for (const bullet of bullets) {
      blocks.push({
        object: "block",
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{ text: { content: bullet } }],
        },
      });
    }
  }

  blocks.push({ object: "block", type: "divider", divider: {} });

  // Footer
  blocks.push({
    object: "block",
    type: "paragraph",
    paragraph: {
      rich_text: [
        {
          text: { content: `Automatisch generiert von Alfred am ${date} — 20 Quellen gescannt` },
          annotations: { italic: true, color: "gray" },
        },
      ],
    },
  });

  return blocks;
}

async function createNotionPage(date, summary) {
  const blocks = buildNotionBlocks(summary, date);

  const response = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${NOTION_TOKEN}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      parent: { page_id: AI_TRENDS_PAGE_ID },
      icon: { emoji: "🗞️" },
      properties: {
        title: {
          title: [{ text: { content: `AI Trends — ${date}` } }],
        },
      },
      children: blocks,
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(`Notion API Fehler: ${JSON.stringify(data)}`);
  return data;
}

async function main() {
  const today = new Date().toLocaleDateString("de-DE", {
    timeZone: "Europe/Berlin",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  console.log(`🚀 AI Trends Daily — ${today}`);
  console.log("📡 Fetching sources...");

  // Fetch all sources in parallel
  const allContent = [];
  for (const [category, sources] of Object.entries(SOURCES)) {
    console.log(`  ${category}...`);
    const results = await Promise.all(
      sources.map(async (s) => {
        const content = await fetchPage(s.url);
        return `=== ${s.name} (${s.url}) ===\n${content}`;
      })
    );
    allContent.push(`### ${category}\n${results.join("\n\n")}`);
  }

  const rawContent = allContent.join("\n\n---\n\n").slice(0, 80000);

  console.log("🧠 Summarizing with Claude...");
  const summary = await summarizeWithClaude(rawContent);

  console.log(`📝 Creating Notion page: "AI Trends — ${today}"`);
  const page = await createNotionPage(today, summary);

  console.log(`✅ Done! Page: https://notion.so/${page.id.replace(/-/g, "")}`);
  console.log(`📰 Headline: ${summary.headline}`);

  return { today, headline: summary.headline, pageUrl: `https://notion.so/${page.id.replace(/-/g, "")}` };
}

main().catch((e) => {
  console.error("❌ Fehler:", e.message);
  process.exit(1);
});
