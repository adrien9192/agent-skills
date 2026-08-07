#!/usr/bin/env bash
# effort-sweep.sh — measure cost / latency / output per effort level, on your own prompts.
#
# Why: effort defaults do not transfer across models, and Opus 5 keeps whatever level
# was set before instead of resetting to its own default. A carried-over `xhigh` is a
# leftover, not a decision. This makes the decision measurable.
#
# Usage:
#   ./effort-sweep.sh                          # default prompt set, claude-opus-5
#   MODEL=claude-sonnet-5 ./effort-sweep.sh
#   LEVELS="medium high" ./effort-sweep.sh
#   ./effort-sweep.sh my-prompts.txt           # one prompt per line, blank/# ignored
#
# Cost: one headless session per (level × prompt). Each pays ~25k cache-creation
# tokens of system prompt + CLAUDE.md, so budget ~$0.15-0.30 per run before the
# prompt's own cost. Default set = 4 levels × 3 prompts = 12 runs.
#
# Reads results back: cat ~/.claude/effort-sweep/<model>/summary.md
set -euo pipefail

MODEL="${MODEL:-claude-opus-5}"
LEVELS="${LEVELS:-low medium high xhigh}"   # `max` is session-only, not a settings.json value
OUT="${OUT:-$HOME/.claude/effort-sweep/$MODEL}"
CSV="$OUT/runs.csv"

command -v jq >/dev/null || { echo "need jq" >&2; exit 1; }

# Default prompts: one per tier of real work. Replace with your own — that is the point,
# a sweep on someone else's prompts tells you nothing about your workload.
default_prompts() {
  cat <<'EOF'
Extrais les nombres de ce texte et donne leur somme, rien d'autre : "3 factures de 1240 EUR, 2 de 890 EUR, une de 15 EUR."
Cette fonction JS est appelee sur chaque frappe clavier dans un champ de recherche : `const f=(q,items)=>items.filter(i=>i.name.toLowerCase().includes(q.toLowerCase()))`. Liste les problemes reels, du plus grave au moins grave. Pas de preambule.
Une SAS francaise facture un client espagnol B2B avec numero de TVA intracom valide, prestation de conseil a distance. Qui autoliquide, quelle mention obligatoire sur la facture, et quelle declaration cote francais ? Reponse en 5 lignes max.
EOF
}

mkdir -p "$OUT"
# read into an array without mapfile — macOS ships bash 3.2
PROMPTS=()
while IFS= read -r line; do PROMPTS+=("$line"); done < <(
  if [ $# -ge 1 ]; then grep -vE '^[[:space:]]*(#|$)' "$1"; else default_prompts; fi
)

echo "level,prompt_id,cost_usd,duration_ms,ttft_ms,output_tokens,cache_read,cache_creation" > "$CSV"

for level in $LEVELS; do
  i=0
  for p in "${PROMPTS[@]}"; do
    i=$((i+1))
    printf '%s / prompt %d ... ' "$level" "$i" >&2
    # cd to a neutral dir: keeps the loaded CLAUDE.md constant across runs so the
    # only variable is effort. Same reason the model is pinned.
    json=$(cd "$OUT" && claude -p --effort "$level" --model "$MODEL" --output-format json "$p")
    echo "$json" | jq -r --arg l "$level" --arg i "$i" \
      '[$l,$i,.total_cost_usd,.duration_ms,.ttft_ms,.usage.output_tokens,.usage.cache_read_input_tokens,.usage.cache_creation_input_tokens]|@csv' >> "$CSV"
    echo "$json" | jq -r '.result' > "$OUT/answer-$level-$i.txt"
    printf 'ok\n' >&2
  done
done

{
  echo "# Effort sweep — $MODEL"
  echo
  echo "Prompts: ${#PROMPTS[@]} · levels: $LEVELS · results: \`$OUT\`"
  echo
  echo "| level | cost \$ | duration ms | ttft ms | output tok |"
  echo "|-------|--------|-------------|---------|------------|"
  for level in $LEVELS; do
    awk -F, -v l="\"$level\"" 'BEGIN{c=0;d=0;t=0;o=0;n=0}
      $1==l {gsub(/"/,"",$3);gsub(/"/,"",$4);gsub(/"/,"",$5);gsub(/"/,"",$6);
             c+=$3;d+=$4;t+=$5;o+=$6;n++}
      END{if(n)printf "| %s | %.4f | %d | %d | %d |\n", substr(l,2,length(l)-2), c, d/n, t/n, o}' "$CSV"
  done
  echo
  echo "Cost is summed across prompts; duration and ttft are per-prompt averages."
  echo "**Cost and latency are the easy half.** Read \`answer-<level>-<n>.txt\` side by side:"
  echo "the lowest level whose answers you would have shipped is your setting."
  echo
  echo "Apply it: \`/effort <level>\` (persists for low|medium|high|xhigh), or set"
  echo "\`effortLevel\` in ~/.claude/settings.json. Per-skill and per-subagent overrides"
  echo "go in YAML frontmatter (\`effort:\`). \`CLAUDE_CODE_EFFORT_LEVEL\` in env beats all of them."
} > "$OUT/summary.md"

cat "$OUT/summary.md"
