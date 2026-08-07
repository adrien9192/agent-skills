#!/usr/bin/env bash
# doctor check 14 — détecte les consignes qui ne peuvent pas mordre.
#
# (a) skill imposée dans apex/SKILL.md mais nommée dans aucun fichier de step :
#     sous chargement progressif, l'index est six steps derrière le moment visé.
# (b) skill imposée quelque part dans apex mais "off" dans skillOverrides :
#     un mandat qui pointe vers une skill retirée du catalogue.
#
# Lecture seule. Sortie vide (hors faux positifs connus) = tout est câblé.
set -uo pipefail

APEX="${APEX_DIR:-$HOME/.agents/skills/apex}"
HOOK="${SKILL_GATE:-$HOME/.claude/hooks/skill-gate.py}"
SETTINGS="${CLAUDE_SETTINGS:-$HOME/.claude/settings.json}"

[ -d "$APEX/steps" ] || { echo "ABSENT: $APEX/steps"; exit 1; }

echo "== (a) mandats orphelins =="
# shellcheck disable=SC2016  # les backticks sont le motif recherché, pas une substitution
for s in $(grep -oE '`[a-z][a-z0-9-]*(:[a-z0-9-]+)?`' "$APEX/SKILL.md" | tr -d '`' | sort -u); do
    grep -qrF -- "$s" "$APEX/steps/" && continue
    if grep -qF -- "$s" "$HOOK" 2>/dev/null; then
        echo "hook-covered: $s"
    else
        echo "ORPHAN: $s"
    fi
done

echo "== (b) mandats pointant vers une skill désactivée =="
APEX="$APEX" SETTINGS="$SETTINGS" python3 - <<'PY'
import json, os, re, pathlib, sys
apex = pathlib.Path(os.environ["APEX"])
try:
    ov = json.load(open(os.environ["SETTINGS"])).get("skillOverrides", {})
except Exception as e:
    sys.exit("ABSENT/ILLISIBLE: settings.json (%s)" % e)
names = set()
for f in [apex / "SKILL.md"] + sorted((apex / "steps").glob("*.md")):
    names |= set(re.findall(r"`([a-z][a-z0-9-]*(?::[a-z0-9-]+)?)`", f.read_text()))
bad = [n for n in sorted(names)
       if ov.get(n) == "off" or ov.get(n.rsplit(":", 1)[-1]) == "off"]
print("MANDATED BUT OFF:", bad or "none")
PY
