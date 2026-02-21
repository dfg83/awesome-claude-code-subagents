#!/usr/bin/env node
/**
 * Miro Board Coach - Agent Interface
 * 
 * Dieses Script wird vom Agent aufgerufen und verwaltet:
 * - State Laden/Speichern
 * - Template-Auswahl
 * - Interaktions-Logik
 */

const fs = require('fs');
const path = require('path');

const SKILL_DIR = path.join(process.env.HOME, '.openclaw/workspace/skills/miro-board-agent');
const STATE_DIR = path.join(SKILL_DIR, 'state');
const TEMPLATE_DIR = path.join(SKILL_DIR, 'templates/techniken');

// Hilfsfunktionen
function loadTemplate(technikName) {
    const templatePath = path.join(TEMPLATE_DIR, `${technikName}.json`);
    if (!fs.existsSync(templatePath)) {
        return null;
    }
    return JSON.parse(fs.readFileSync(templatePath, 'utf8'));
}

function loadState(projektName) {
    const statePath = path.join(STATE_DIR, `${projektName}.json`);
    if (!fs.existsSync(statePath)) {
        return null;
    }
    return JSON.parse(fs.readFileSync(statePath, 'utf8'));
}

function saveState(projektName, state) {
    if (!fs.existsSync(STATE_DIR)) {
        fs.mkdirSync(STATE_DIR, { recursive: true });
    }
    const statePath = path.join(STATE_DIR, `${projektName}.json`);
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
    return statePath;
}

function listTemplates() {
    if (!fs.existsSync(TEMPLATE_DIR)) {
        return [];
    }
    return fs.readdirSync(TEMPLATE_DIR)
        .filter(f => f.endsWith('.json'))
        .map(f => {
            const content = JSON.parse(fs.readFileSync(path.join(TEMPLATE_DIR, f), 'utf8'));
            return {
                id: f.replace('.json', ''),
                name: content.name,
                description: content.beschreibung
            };
        });
}

function listSessions() {
    if (!fs.existsSync(STATE_DIR)) {
        return [];
    }
    return fs.readdirSync(STATE_DIR)
        .filter(f => f.endsWith('.json') && f !== 'example.json')
        .map(f => {
            const content = JSON.parse(fs.readFileSync(path.join(STATE_DIR, f), 'utf8'));
            const stats = fs.statSync(path.join(STATE_DIR, f));
            return {
                name: f.replace('.json', ''),
                technik: content.kreativTechnik,
                lastModified: stats.mtime
            };
        });
}

// CLI Interface
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
    case 'templates':
        console.log(JSON.stringify(listTemplates(), null, 2));
        break;
    
    case 'sessions':
        console.log(JSON.stringify(listSessions(), null, 2));
        break;
    
    case 'load':
        const projekt = args[1];
        if (!projekt) {
            console.error('Bitte Projektnamen angeben');
            process.exit(1);
        }
        const state = loadState(projekt);
        if (state) {
            console.log(JSON.stringify(state, null, 2));
        } else {
            console.error(`Session '${projekt}' nicht gefunden`);
            process.exit(1);
        }
        break;
    
    case 'template':
        const technik = args[1];
        if (!technik) {
            console.error('Bitte Technik-Namen angeben');
            process.exit(1);
        }
        const template = loadTemplate(technik);
        if (template) {
            console.log(JSON.stringify(template, null, 2));
        } else {
            console.error(`Template '${technik}' nicht gefunden`);
            process.exit(1);
        }
        break;
    
    case 'save':
        const saveProjekt = args[1];
        if (!saveProjekt) {
            console.error('Bitte Projektnamen angeben');
            process.exit(1);
        }
        // Lese State aus stdin
        let inputData = '';
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', chunk => inputData += chunk);
        process.stdin.on('end', () => {
            try {
                const newState = JSON.parse(inputData);
                const savedPath = saveState(saveProjekt, newState);
                console.log(JSON.stringify({ success: true, path: savedPath }));
            } catch (e) {
                console.error('Fehler beim Parsen:', e.message);
                process.exit(1);
            }
        });
        break;
    
    default:
        console.log(`
Miro Board Coach - Agent Interface

Verwendung:
  node coach.js <command> [args]

Commands:
  templates              Liste alle verfügbaren Kreativtechniken
  sessions               Liste alle gespeicherten Sessions
  load <projekt>         Lade eine Session
  template <technik>     Lade ein Template
  save <projekt>         Speichere State (via stdin)

Beispiele:
  node coach.js templates
  node coach.js load mein-projekt
  echo '{...}' | node coach.js save mein-projekt
        `);
}
