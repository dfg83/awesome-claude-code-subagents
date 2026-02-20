#!/bin/bash
# Auto-sync script for projects folder
# Run this after creating new projects or making changes

cd "$(dirname "$0")" || exit 1

# Check if there are any changes
if git diff --quiet && git diff --staged --quiet; then
    echo "No changes to sync."
    exit 0
fi

# Auto-commit with timestamp
git add -A
git commit -m "Auto-sync: $(date '+%Y-%m-%d %H:%M:%S')"

# Push to GitHub
git push origin master

echo "✅ Synced to GitHub at $(date)"
