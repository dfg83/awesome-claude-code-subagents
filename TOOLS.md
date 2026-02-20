# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

## GitHub Integration

**Repo:** `dfg83/ProjectsOverall` → https://github.com/dfg83/ProjectsOverall  
**Local path:** `/home/Alfred/.openclaw/workspace/`

### How to sync

- **Manual:** Run `./sync.sh` from the workspace folder after making changes
- **Automatic:** A cron job runs every hour to auto-commit and push any changes
- **Token location:** `~/.openclaw/.github_token` (secure, not committed)

---

Add whatever helps you do your job. This is your cheat sheet.
