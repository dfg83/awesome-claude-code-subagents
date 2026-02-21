# Miro Board Agent - Projektübersicht

Interaktiver Design Thinking Coach, der Kreativtechniken in Miro-Boards überführt.

## 🎯 Funktionsumfang

### Kernfunktionen
- **Kreativtechnik-Auswahl**: Automatische Template-Auswahl basierend auf der verwendeten Technik
- **State-Persistenz**: Speichert den Arbeitsstand pro Projekt (JSON-basiert)
- **Interaktiver Dialog**: Coach spricht mit User, sammelt Input, passt Board an
- **Miro-Integration**: Nutzt den offiziellen Miro MCP Server

### Unterstützte Kreativtechniken (9 Templates)

| Technik | Beschreibung |
|---------|-------------|
| Brainstorming | Freies Ideen-Sammeln |
| Crazy 8s | 8 Ideen in 8 Minuten |
| Six Thinking Hats | 6 Perspektiven (de Bono) |
| Empathy Map | Kundenperspektive verstehen |
| SCAMPER | 7 Fragen zur Ideenentwicklung |
| Mind Mapping | Visuelle Ideen-Organisation |
| Customer Journey | Touchpoint-Visualisierung |
| Business Model Canvas | Geschäftsmodell-Entwicklung |
| Walt Disney Method | Träumer/Realist/Kritiker |

## 📁 Projektstruktur

```
miro-board-agent/
├── README.md              # User-Setup-Anleitung (MCP)
├── SKILL.md               # Dokumentation für dich
├── package.json           # Node.js Metadata
├── state/                 # Persistente Session-Daten
│   ├── example.json       # Beispiel-State
│   └── <projekt>.json     # Session-Daten
├── templates/techniken/   # Board-Templates
│   ├── brainstorming.json
│   ├── crazy8s.json
│   ├── six-thinking-hats.json
│   ├── empathy-map.json
│   ├── scamper.json
│   ├── mind-mapping.json
│   ├── customer-journey.json
│   ├── business-model-canvas.json
│   └── walt-disney.json
└── scripts/
    ├── coach.sh           # CLI-Entrypoint
    └── coach.js           # Agent-Interface (Node.js)
```

## 🚀 Verwendung

### Für den User (Setup)
1. Miro MCP Server konfigurieren (siehe README.md)
2. OAuth-Flow durchführen
3. Skill verwenden: `"Starte Miro Coach"`

### Für dich (als Agent)
```javascript
// State laden
const state = loadState('projekt-name');

// Template laden
const template = loadTemplate('brainstorming');

// State speichern
saveState('projekt-name', newState);
```

## 💡 Workflow

1. **User sagt**: "Starte Miro Coach"
2. **Ich frage**:
   - Projektnamen?
   - Welche Kreativtechnik wurde verwendet?
   - Neues Board oder bestehendes?
3. **Template laden** → Board-Struktur vorbereiten
4. **MCP nutzen** → Board in Miro erstellen
5. **Input sammeln** → User gibt Ergebnisse der Kreativtechnik
6. **Board befüllen** → Sticky Notes, Shapes, Texte platzieren
7. **Iterieren** → "Passt das so?", Anpassungen vornehmen
8. **State speichern** → JSON persistieren für nächstes Mal

## 🔧 Technische Details

### State-Format
```json
{
  "projektName": "string",
  "kreativTechnik": "string",
  "miroBoardId": "string",
  "miroBoardUrl": "string",
  "thema": "string",
  "arbeitspakete": [...],
  "letzteAktivitaet": "ISO-Timestamp",
  "notizen": "string"
}
```

### MCP Integration
- Server: `https://mcp.miro.com/`
- Auth: OAuth 2.1
- Tools: Board erstellen, Items hinzufügen, lesen

## 📚 Referenzen

- Miro MCP Docs: https://developers.miro.com/docs/miro-mcp
- Setup Guide: https://developers.miro.com/docs/connecting-to-miro-mcp
