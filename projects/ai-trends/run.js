#!/usr/bin/env node
/**
 * AI Trends Daily Summary
 * Fetches AI news from 20 sources, summarizes with AI, posts to Notion
 * 
 * Runs daily at 8:00 AM CET via OpenClaw cron
 */

import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync, writeFileSync, unlinkSync } from "fs";
import { spawn } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../../.env.notion") });

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const AI_TRENDS_PAGE_ID = "32036888-7c48-8184-a47d-e9ad2c89f9f6";

// Gateway Token aus OpenClaw Config lesen
function getGatewayToken() {
  try {
    const configPath = join(process.env.HOME || "/home/Alfred", ".openclaw", "openclaw.json");
    const config = JSON.parse(readFileSync(configPath, "utf-8"));
    return config.gateway?.auth?.token || config.gateway?.authToken || config.gateway?.token;
  } catch (e) {
    console.error("⚠️ Konnte Gateway Token nicht lesen:", e.message);
    return null;
  }
}

const GATEWAY_TOKEN = getGatewayToken();

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

// Get AI summary using openclaw CLI with run command
async function summarizeWithAI(rawContent) {
  const prompt = `You are an AI news analyst. Analyze the following raw content from AI news sources and create a compact summary.

Structure per category:
- Up to 10 bullet points with the most important news/developments
- Focus on concrete news, releases, research results
- No marketing fluff
- If a source provides no usable content, skip it
- IMPORTANT: Preserve the ORIGINAL LANGUAGE of each source - do not translate

IMPORTANT: Return ONLY pure JSON, no Markdown code blocks, no explanations, just the JSON object.

FORMAT:
{
  "headline": "short headline of the day (max 80 chars, in English)",
  "categories": {
    "🔬 Research & Labs": ["bullet1", "bullet2", "...up to 10"],
    "📰 News & Journalismus": ["bullet1", "bullet2", "...up to 10"],
    "🧠 Newsletter & Kuratiert": ["bullet1", "bullet2", "...up to 10"],
    "🛠 Community & Tools": ["bullet1", "bullet2", "...up to 10"]
  }
}

RAW CONTENT:
${rawContent.slice(0, 60000)}`;

  // Write prompt to temp file
  const tempFile = join(__dirname, `.prompt-${Date.now()}.txt`);
  writeFileSync(tempFile, prompt, "utf-8");

  if (!GATEWAY_TOKEN) {
    throw new Error("Gateway Token nicht gefunden. Ist OpenClaw konfiguriert?");
  }

  return new Promise((resolve, reject) => {
    // Create a simple Node.js script that reads the prompt and outputs AI response
    const aiScript = `
const fs = require('fs');
const prompt = fs.readFileSync('${tempFile}', 'utf-8');

async function getAIResponse() {
  const response = await fetch('http://127.0.0.1:18789/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ${GATEWAY_TOKEN}'
    },
    body: JSON.stringify({
      model: 'moonshot/kimi-k2.5',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    console.error('API Error:', await response.text());
    process.exit(1);
  }

  const data = await response.json();
  console.log(data.choices[0].message.content);
}

getAIResponse().catch(e => {
  console.error(e);
  process.exit(1);
});
`;
    
    const scriptFile = join(__dirname, `.ai-script-${Date.now()}.cjs`);
    writeFileSync(scriptFile, aiScript, "utf-8");

    const child = spawn("node", [scriptFile], {
      cwd: __dirname,
      timeout: 120000,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      // Cleanup temp files
      try {
        unlinkSync(tempFile);
        unlinkSync(scriptFile);
      } catch (e) {}

      if (code !== 0) {
        reject(new Error(`AI request failed: ${stderr || stdout}`));
        return;
      }

      try {
        // Try to extract JSON from the response
        const jsonMatch = stdout.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          reject(new Error("Kein JSON in AI-Antwort: " + stdout));
          return;
        }
        resolve(JSON.parse(jsonMatch[0]));
      } catch (e) {
        reject(new Error("JSON Parse Fehler: " + e.message));
      }
    });

    child.on("error", (err) => {
      // Cleanup temp files
      try {
        unlinkSync(tempFile);
        unlinkSync(scriptFile);
      } catch (e) {}
      reject(new Error("Failed to spawn: " + err.message));
    });
  });
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

  console.log("🧠 Summarizing with AI (default model)...");
  const summary = await summarizeWithAI(rawContent);

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
