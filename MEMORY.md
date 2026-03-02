# MEMORY.md - Long-Term Memory

## Notion Preferences

**Article Creation Rule:**
When Marco says "create an article":
1. Write the article content
2. Add it as a new page under the **OpenClaw** page in Notion

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

---

## Browser Usage Policy (Marco's Preference)

**Workflow:**
1. Bei Browser-Anfragen **immer zuerst isolierten Modus probieren** (`profile="openclaw"`)
2. Bei Fehler → **Feedback geben** was schiefging
3. Dann Fallback auf Web-Fetch oder Chrome-Extension
4. **Ziel:** Isolierten Browser stabil zum Laufen bekommen

**Aktueller Status (2026-02-26):**
- Chromium installiert ✅
- Gateway-Service Timeout ❌
- Fehler: `Can't reach the OpenClaw browser control service (timed out after 15000ms)`
- Ursache: OpenClaw Gateway, nicht Chromium

**TODO:** 
- Bei Heartbeats oder manuellen Checks: Isolierten Browser-Status verfolgen
- Bei OpenClaw-Updates: Browser-Funktionalität testen
- Langfristig: Issue bei OpenClaw aufmachen oder Workaround finden
