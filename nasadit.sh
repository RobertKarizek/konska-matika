#!/bin/bash
# Nasadí Koňskou matiku na GitHub Pages: ./nasadit.sh "co se změnilo"
# Zvýší verzi v sw.js (ať si telefony stáhnou novinky), uloží změny a pošle je na GitHub.
set -e
cd "$(dirname "$0")"
VERZE="konska-matika-$(date +%Y%m%d-%H%M%S)"
sed -i '' "s/^var VERZE = \".*\";/var VERZE = \"$VERZE\";/" sw.js
git add -A
git commit -qm "${1:-Úprava}" || true
git push -q origin main
echo "Odesláno ($VERZE). Web se obnoví zhruba do minuty: https://robertkarizek.github.io/konska-matika/"
