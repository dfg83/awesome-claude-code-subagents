# Miro Board Agent - Setup-Anleitung

Diese Anleitung hilft dir, den Miro MCP Server einzurichten, damit der Design Thinking Coach funktioniert.

---

## Was ist der Miro MCP Server?

Der Miro MCP Server ermöglicht es KI-Agenten (wie diesem Coach), direkt mit Miro-Boards zu interagieren – Boards zu erstellen, Sticky Notes hinzuzufügen, Diagramme zu generieren und Inhalte zu lesen.

**Offizielle Doku:** https://developers.miro.com/docs/miro-mcp

---

## Voraussetzungen

- Miro-Account (kostenlos oder bezahlt)
- Für **Enterprise-Accounts**: Admin muss MCP erst für die Organisation aktivieren
- Ein MCP-fähiger Client (OpenClaw unterstützt MCP)

---

## Schritt-für-Schritt Setup

### 1. Miro MCP Server aktivieren (nur Enterprise)

Falls du einen Miro Enterprise Plan hast:
- Admin-Guide: https://help.miro.com/hc/en-us/articles/31625761037202-Miro-MCP-Server-admin-guide
- Dein Admin muss MCP für die Organisation freischalten

### 2. Konfiguration in OpenClaw

Füge die folgende Konfiguration zu deinem OpenClaw MCP-Setup hinzu:

```json
{
  "mcpServers": {
    "miro-mcp": {
      "url": "https://mcp.miro.com/",
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

**Wo einfügen?**
- In deiner OpenClaw-Konfiguration unter dem MCP-Servers-Bereich
- Oder bei CLI-Clients: in der `mcp.json` oder ähnlichen Config-Datei

### 3. Mit Miro verbinden (OAuth-Flow)

Nach dem Einfügen der Konfiguration:

1. **"Connect" klicken** – Startet den OAuth-Flow
2. **Team auswählen** – Wähle das Miro-Team, in dem die Boards erstellt werden sollen
   - ⚠️ **Wichtig:** Der MCP Server ist team-spezifisch! Wählst du das falsche Team, funktioniert der Zugriff nicht.
3. **"Add" klicken** – Autorisiert den Zugriff
4. **"Continue"** – Du wirst zurück zu OpenClaw geleitet

### 4. Verbindung prüfen

Nach erfolgreicher Verbindung solltest du:
- Tools vom Miro MCP Server sehen (z.B. `create_board`, `add_sticky_note`)
- Prompts/Templates verfügbar haben

---

## Troubleshooting

### "Access error" oder "No permission"
→ Neu authentifizieren und **das korrekte Team** auswählen (siehe Schritt 3)

### "Remote connection not supported"
→ Einige Tools unterstützen keine Remote-MCP-Verbindungen. OpenClaw unterstützt dies.

### Verbindung wird nicht hergestellt
- Prüfe, ob du die neueste OpenClaw-Version hast
- Stelle sicher, dass dein Netzwerk `https://mcp.miro.com/` erreichen kann
- Versuche den MCP Inspector: https://modelcontextprotocol.io/docs/tools/inspector

---

## Sicherheit

- **OAuth 2.1** – Moderne, sichere Authentifizierung
- **Team-spezifisch** – Der Zugriff gilt nur für das ausgewählte Team
- **Standard Rate-Limits** – API-Limits schützen vor Überlastung
- **Berechtigungs-basiert** – Nur was du in Miro sehen darfst, sieht auch der Agent

---

## Unterstützte MCP-Clients

Der Miro MCP Server funktioniert mit:
- ✅ OpenClaw (dieser Agent)
- ✅ Claude Code
- ✅ Cursor
- ✅ VSCode + GitHub Copilot
- ✅ Replit, Lovable, Windsurf
- ✅ Gemini CLI, OpenAI Codex
- ✅ und vielen mehr...

---

## Nächste Schritte

Sobald das Setup läuft:

```bash
# Starte den Design Thinking Coach
~/.openclaw/workspace/skills/miro-board-agent/scripts/coach.sh
```

Der Coach führt dich dann durch:
1. Projekt anlegen
2. Kreativtechnik wählen
3. Board erstellen/bearbeiten
4. Arbeitsstand speichern

---

**Fragen oder Probleme?**
- Miro MCP Doku: https://developers.miro.com/docs/miro-mcp
- Feedback-Formular: https://q2oeb0jrhgi.typeform.com/to/YATmJPVx
