# MEMORY.md - Long-Term Memory

## AI Trends Daily Report

**Eingerichtet:** 11.03.2026

### Notion Struktur
- **Hauptseite "AI Trends"** unter OpenClaw
  - Page ID: `32036888-7c48-8184-a47d-e9ad2c89f9f6`
  - URL: https://notion.so/320368887c488184a47de9ad2c89f9f6
- Täglich eine Unterseite: `AI Trends — DD.MM.YYYY` (Icon: 🗞️)

### Cron Job
- **Job ID:** `534fd1c9-f311-4754-8d4f-6d4685c64186`
- **Zeitplan:** Täglich 08:00 Uhr CET (`0 8 * * *`, tz: Europe/Berlin)
- **Agent:** main | **Session:** isolated
- **Timeout:** 600s | **Thinking:** medium
- **Benachrichtigung:** Telegram (announce bei Fertigstellung)

### Quellen (20 gesamt)
- 🔬 Research & Labs: arXiv cs.AI, OpenAI Blog, DeepMind Research, Anthropic News, Meta AI Research
- 📰 News: The Verge AI, TechCrunch AI, VentureBeat AI, Wired AI, MIT Tech Review, AI Times, AI-News.com
- 🧠 Newsletter: Import AI (Substack), The Sequence, Morning Brew Emerging Tech, TLDR AI
- 🛠 Community: HuggingFace Blog, Papers With Code, Towards Data Science, Hacker News

### Output-Format pro Seite
- Callout (blue_background): Schlagzeile des Tages
- Divider
- H2 pro Kategorie + bis zu **10 Bullet Points** mit:
  - Deutschsprachiger Zusammenfassung
  - Direktem Artikel-Link: ` → Artikel` (Notion rich_text link)
- Divider
- Footer italic grau: "Automatisch generiert von Alfred am DD.MM.YYYY — 20 Quellen gescannt"

### Verwaltung
```bash
openclaw cron list
openclaw cron run 534fd1c9-f311-4754-8d4f-6d4685c64186   # manueller Test
openclaw cron edit 534fd1c9-f311-4754-8d4f-6d4685c64186  # anpassen
openclaw cron disable/enable 534fd1c9-f311-4754-8d4f-6d4685c64186
```

### Projekt-Files
- Script (Node.js Fallback): `projects/ai-trends/run.js`
- Doku: `projects/ai-trends/ARBEITSSTAND.md`

---

## Notion Page Structure

**OpenClaw (Main Page)**
- Page ID: `30c36888-7c48-8005-9ef0-df351874ea38`
- URL: https://www.notion.so/OpenClaw-30c368887c4880059ef0df351874ea38
- Use for: All manually created articles

**AI Trends (Sub-page under OpenClaw)**
- Page ID: `32036888-7c48-8184-a47d-e9ad2c89f9f6`
- Use for: Daily automated reports ONLY

---

## Notion Preferences

**Article Creation Rule:**
When Marco says "create an article":
1. Write the **complete article content** — full text, all sections, all images/graphics included
2. Use the **original language of the source** — never translate
3. Add it as a new page under **OpenClaw** (Page ID: `30c36888-7c48-8005-9ef0-df351874ea38`)

⚠️ **VERIFY:** Always double-check the parent page ID before creating. AI Trends ID starts with `320...`, OpenClaw ID starts with `30c...`.

Only create a shorter/summarized version if Marco explicitly asks for it.

Notion integration token stored in `.env.notion`.

## Claude Agents Integration

**Skill Location:** `~/.openclaw/workspace/skills/claude-agents/`

**How it works:**
When Marco describes a task (e.g., "review this TypeScript code", "optimize Kubernetes deployment"), I automatically:
1. Use the router to find the best matching agent from 130+ specialized agents
2. Spawn a sub-agent with that specialist's system prompt
3. Let the specialist work in isolation
4. Report back the results

**Registry:** `~/.openclaw/workspace/skills/claude-agents/registry/agents.json`
**Source:** `~/.openclaw/workspace/projects/awesome-claude-code-subagents/`

**Auto-Sync:** Daily at 03:00 CET via cronjob (job ID: ef45eb64-7d3c-4e8c-9d3f-d75fe5ea471a)

**Available Categories:**
- Language Specialists (26 agents): TypeScript, Python, Go, Rust, Java, etc.
- Infrastructure (16 agents): Kubernetes, Docker, Terraform, Cloud
- Quality & Security (14 agents): Code review, Security audit, QA
- Data & AI (12 agents): Data engineering, ML, Analytics
- Core Development (10 agents): Frontend, Backend, Fullstack, API design
- And 5 more categories...

**Manual override:** If Marco says "use the X agent", I use that specific agent instead of auto-selecting.

## Sub-Agent Repository Standard

**Preferred Design Pattern:** `claude-agents` — klar, strukturiert, Hybrid (Skill + Sub-Agent Spawn)

When Marco provides a new sub-agent repository, always use this structure:

1. **Clone to:** `projects/<repo-name>/`
2. **All project files stay in projects/** – Do NOT create separate skills/ folder unless explicitly asked
3. **Required files in projects/<repo-name>/:**
   - `SKILL.md` – Documentation
   - `ARBEITSSTAND.md` – Current work status
   - `README.md` – User-facing documentation
   - `registry/agents.json` – Indexed agent registry
   - `scripts/index.js` – Parser for agent definitions
   - `scripts/router.js` – Agent selection logic (if auto-selection desired)
   - `scripts/sync.sh` – Update script
4. **Auto-sync cronjob:** Daily at 03:00 CET (unless specified otherwise)

**Important:** The `skills/` folder is for shared/reusable skills only. Project-specific code belongs in `projects/`.

## Project Workflow Standard

**Arbeitsstand immer dokumentieren:**

Für jedes Projekt im `projects/` Ordner:
1. **ALLES im Projektordner erstellen** – Code, Skills, Scripts, Assets
   - Nicht automatisch in `skills/` anlegen
   - `skills/` ist nur für geteilte/wiederverwendbare Skills
2. **Arbeitsstand speichern** in `projects/<name>/ARBEITSSTAND.md`
   - Was wurde erledigt?
   - Was fehlt noch?
   - Nächste Schritte?
3. **Im Git-Repo committen** – nie uncommitted lassen
4. **Bei längeren Pausen:** Stand updaten, damit Wiedereinstieg möglich ist

Dies gilt für ALLE zukünftigen Projekte – keine Ausnahmen.

## Memory Management System

**Skill:** `memory-manager` (clawhub.ai/marmikcfc/memory-manager)  
**Location:** `~/.openclaw/workspace/skills/memory-manager/`

**Three-tier memory architecture:**
- **Episodic** (`memory/episodic/`) – Zeitbasierte Ereignisse, tägliche Logs
- **Semantic** (`memory/semantic/`) – Fakten, Konzepte, Wissen
- **Procedural** (`memory/procedural/`) – Workflows, Prozesse, How-Tos

**Automated maintenance (via HEARTBEAT.md):**
- Every 2h: Compression detection
- If warning/critical: Auto-snapshot
- Daily 23:00: Memory organization

**Usage:**
```bash
~/.openclaw/workspace/skills/memory-manager/detect.sh    # Check usage
~/.openclaw/workspace/skills/memory-manager/organize.sh  # Organize memories
~/.openclaw/workspace/skills/memory-manager/search.sh episodic "keyword"
```

## Voice Message Auto-Transcription

**Rule:** When Marco sends a voice message (audio/ogg), automatically transcribe it using Whisper.

**Process:**
1. Detect incoming audio attachment
2. Run: `~/.local/bin/transcribe <filepath>`
3. Reply with the transcribed text + "_Transkription:_" prefix

**Model:** tiny (fast, good for short voice messages)
**Language:** German (de) unless detected otherwise