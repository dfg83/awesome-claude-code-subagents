#!/bin/bash
#
# Miro Board Coach - Interaktiver Design Thinking Assistant
# Hauptskript für den Dialog mit dem User
#

set -e

SKILL_DIR="$HOME/.openclaw/workspace/skills/miro-board-agent"
STATE_DIR="$SKILL_DIR/state"
TEMPLATE_DIR="$SKILL_DIR/templates/techniken"

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Hilfsfunktionen
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

show_help() {
    cat << EOF
Miro Board Coach - Design Thinking Assistant

Verwendung:
  coach.sh [OPTIONEN]

Optionen:
  --list              Alle gespeicherten Sessions anzeigen
  --resume <name>     Bestehende Session fortsetzen
  --delete <name>     Session löschen
  --templates         Verfügbare Kreativtechniken anzeigen
  -h, --help          Diese Hilfe anzeigen

Beispiele:
  coach.sh                    # Neue Session starten
  coach.sh --list             # Gespeicherte Sessions anzeigen
  coach.sh --resume projekt1  # Session "projekt1" fortsetzen

EOF
}

list_sessions() {
    log_info "Gespeicherte Sessions:"
    if [ ! -d "$STATE_DIR" ] || [ -z "$(ls -A "$STATE_DIR" 2>/dev/null)" ]; then
        echo "   Keine Sessions gefunden."
        return
    fi
    
    for file in "$STATE_DIR"/*.json; do
        [ -f "$file" ] || continue
        name=$(basename "$file" .json)
        
        # Datum der letzten Änderung
        last_modified=$(stat -c %y "$file" 2>/dev/null | cut -d' ' -f1)
        
        # Technik aus der Datei lesen (wenn möglich)
        technik=$(cat "$file" 2>/dev/null | grep -o '"kreativTechnik":"[^"]*"' | cut -d'"' -f4)
        
        echo "   📁 $name"
        echo "      Technik: ${technik:-unbekannt}"
        echo "      Zuletzt: $last_modified"
        echo ""
    done
}

list_templates() {
    log_info "Verfügbare Kreativtechniken:"
    for file in "$TEMPLATE_DIR"/*.json; do
        [ -f "$file" ] || continue
        name=$(basename "$file" .json)
        
        # Beschreibung aus JSON extrahieren
        beschreibung=$(cat "$file" | grep -o '"beschreibung":"[^"]*"' | cut -d'"' -f4)
        display_name=$(cat "$file" | grep -o '"name":"[^"]*"' | head -1 | cut -d'"' -f4)
        
        echo "   🎯 $display_name ($name)"
        echo "      $beschreibung"
        echo ""
    done
}

delete_session() {
    local name=$1
    local file="$STATE_DIR/$name.json"
    
    if [ ! -f "$file" ]; then
        log_error "Session '$name' nicht gefunden."
        return 1
    fi
    
    read -p "Session '$name' wirklich löschen? (j/N): " confirm
    if [[ $confirm =~ ^[Jj]$ ]]; then
        rm "$file"
        log_success "Session '$name' gelöscht."
    else
        log_info "Löschung abgebrochen."
    fi
}

# State Management
save_state() {
    local projekt_name=$1
    local state_file="$STATE_DIR/$projekt_name.json"
    
    # JSON State wird vom Agent über stdin erwartet
    cat > "$state_file"
    log_success "State gespeichert: $state_file"
}

load_state() {
    local projekt_name=$1
    local state_file="$STATE_DIR/$projekt_name.json"
    
    if [ -f "$state_file" ]; then
        cat "$state_file"
        return 0
    fi
    return 1
}

# Hauptprogramm
main() {
    # Verzeichnisse sicherstellen
    mkdir -p "$STATE_DIR"
    
    # Argumente parsen
    case "${1:-}" in
        --list)
            list_sessions
            exit 0
            ;;
        --templates)
            list_templates
            exit 0
            ;;
        --resume)
            if [ -z "${2:-}" ]; then
                log_error "Bitte einen Projektnamen angeben."
                exit 1
            fi
            load_state "$2" && {
                log_success "Session '$2' geladen."
                log_info "Übergabe an Agent..."
            } || {
                log_error "Session '$2' nicht gefunden."
                exit 1
            }
            exit 0
            ;;
        --delete)
            if [ -z "${2:-}" ]; then
                log_error "Bitte einen Projektnamen angeben."
                exit 1
            fi
            delete_session "$2"
            exit 0
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
    esac
    
    # Neue Session starten
    log_info "Starte neue Design Thinking Session..."
    log_info "Verzeichnis: $SKILL_DIR"
    
    # Dies ist ein Wrapper - der eigentliche Dialog läuft über den Agent
    # Dieses Skript dient als Entry Point und State-Management
    
    cat << EOF

🎨 Miro Board Coach
==================

Dieser Skill wird direkt im Chat verwendet. So gehst du vor:

1. Sag mir: "Starte eine Miro Coaching Session"
2. Ich frage dich nach:
   - Projektnamen
   - Welche Kreativtechnik du verwendet hast
   - Ob ein neues Board erstellt werden soll

3. Dann arbeiten wir interaktiv:
   - Ich erstelle das passende Template
   - Du gibst mir den Input aus der Kreativtechnik
   - Ich strukturiere es im Miro Board
   - Wir iterieren bis es passt

Verfügbare Techniken:
EOF
    
    list_templates
    
    echo ""
    log_info "Bereit! Sage einfach: \"Starte Miro Coach\""
}

main "$@"
