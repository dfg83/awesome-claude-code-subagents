# Miro Board Agent Skill

Interaktiver Design Thinking Coach für Miro-Boards. Unterstützt verschiedene Kreativtechniken, merkt sich den Arbeitsstand und passt Boards basierend auf User-Feedback an.

## Features

- 🎯 **Kreativtechnik-Auswahl**: Wählt automatisch das richtige Board-Template basierend auf der verwendeten Technik
- 💾 **State-Persistenz**: Merkt sich den aktuellen Arbeitsstand pro Projekt
- 💬 **Interaktiver Dialog**: Spricht mit dem User und passt das Board an
- 🎨 **Design Thinking Templates**: Vorlagen für gängige Kreativtechniken

## Unterstützte Kreativtechniken

- Brainstorming
- Mind Mapping
- Crazy 8s
- Six Thinking Hats
- SCAMPER
- Walt Disney Method
- Lotus Blossom
- Storyboarding
- Empathy Map
- Customer Journey
- Business Model Canvas

## Schnellstart

```bash
# Neuen Coaching-Session starten
~/.openclaw/workspace/skills/miro-board-agent/scripts/coach.sh

# Bestehende Session fortsetzen
~/.openclaw/workspace/skills/miro-board-agent/scripts/coach.sh --resume <projekt-name>

# Alle gespeicherten Sessions anzeigen
~/.openclaw/workspace/skills/miro-board-agent/scripts/coach.sh --list
```

## Voraussetzungen

1. **Miro MCP Server** muss konfiguriert sein (siehe [README.md](./README.md))
2. OAuth-Authentifizierung mit Miro durchgeführt
3. Zugriff auf ein Miro-Team

## Projekt-Struktur

```
skill/miro-board-agent/
├── SKILL.md                    # Diese Datei
├── README.md                   # Setup-Anleitung für User
├── state/                      # Persistente Session-Daten
│   └── <projekt-name>.json
├── templates/techniken/        # Board-Templates
│   ├── brainstorming.json
│   ├── crazy8s.json
│   └── ...
└── scripts/
    └── coach.sh               # Hauptskript
```

## State-Format

Jede Session speichert:

```json
{
  "projektName": "string",
  "kreativTechnik": "string",
  "miroBoardId": "string",
  "miroBoardUrl": "string",
  "arbeitspakete": [
    {
      "id": "string",
      "titel": "string",
      "inhalt": "string",
      "status": "pending|in_progress|completed",
      "position": {"x": 0, "y": 0}
    }
  ],
  "letzteAktivitaet": "ISO-Timestamp",
  "notizen": "string"
}
```

## Verwendung

### 1. Neue Session starten

Der Agent fragt interaktiv:
- Projektname
- Welche Kreativtechnik wurde verwendet?
- Soll ein neues Board erstellt oder ein bestehendes verwendet werden?

### 2. Input verarbeiten

Der Agent:
- Erstellt das passende Board-Template
- Strukturiert den Input aus der Kreativtechnik
- Platziert Inhalte als Sticky Notes/Shapes

### 3. Iterativ verbessern

Der User kann sagen:
- "Füge X hinzu"
- "Verschiebe Y nach Z"
- "Lösche das Paket über..."
- "Ich bin fertig, speichere den Stand"

## Integration mit OpenClaw

Dieser Skill wird direkt im Main-Session-Chat verwendet. Der Agent:

1. Lädt den aktuellen State (falls vorhanden)
2. Führt den Dialog mit dem User
3. Nutzt MCP-Tools für Miro-Operationen
4. Speichert nach jeder Änderung den State

## Troubleshooting

### "MCP Server nicht verbunden"
→ Siehe README.md für Setup-Anleitung

### "Keine Berechtigung für Board"
→ Stelle sicher, dass das richtige Miro-Team ausgewählt wurde

### State ist veraltet
→ Lösche die State-Datei: `rm state/<projekt>.json`
