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

When Marco provides a new sub-agent repository, always use this structure:

1. **Clone to:** `projects/<repo-name>/`
2. **Create Skill:** `skills/<repo-name>/`
3. **Required files:**
   - `SKILL.md` – Documentation
   - `registry/agents.json` – Indexed agent registry
   - `scripts/index.js` – Parser for agent definitions
   - `scripts/router.js` – Agent selection logic (if auto-selection desired)
   - `scripts/sync.sh` – Update script
4. **Auto-sync cronjob:** Daily at 03:00 CET (unless specified otherwise)

Follow the same pattern as `claude-agents` skill for consistency.

## Project Workflow Standard

**Arbeitsstand immer dokumentieren:**

Für jedes Projekt im `projects/` Ordner:
1. **Arbeitsstand speichern** in `projects/<name>/ARBEITSSTAND.md`
   - Was wurde erledigt?
   - Was fehlt noch?
   - Nächste Schritte?
2. **Im Git-Repo committen** – nie uncommitted lassen
3. **Bei längeren Pausen:** Stand updaten, damit Wiedereinstieg möglich ist

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
