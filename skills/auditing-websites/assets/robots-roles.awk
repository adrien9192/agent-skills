# robots.txt -> one "<user-agent>\t<directive>" line per pair, so the GEO axis can
# classify by ROLE (AUDIT-METHOD §5) instead of guessing from user-agent names.
#
# Why not `grep -A3`: RFC 9309 groups are
#     group = startgroupline *(startgroupline / emptyline) *(rule / emptyline)
# so consecutive user-agent lines — blank lines included — share the rules that
# follow. A five-agent training group puts its `Disallow:` five lines below the
# first agent, and a fixed context window silently drops it. Measured on a grouped
# file: `grep -iEA3 'user-agent:.*gptbot'` returned four user-agent lines and no
# directive at all.
#
# The same ABNF says a group may legally carry ZERO rules, and that a user-agent
# line arriving before any rule JOINS the current group rather than opening a new
# one. Flushing on every user-agent line would report the first agent of
#     User-agent: OAI-SearchBot
#     <blank>
#     User-agent: GPTBot
#     Disallow: /
# as unconfigured when it is in fact disallowed — a false negative on the single
# row that carries a P1. Hence: reset only once a rule has been seen.
#
# Usage: curl -s "$DOMAIN/robots.txt" | awk -f assets/robots-roles.awk

{ sub(/#.*/, ""); l = tolower($0); gsub(/^[ \t]+|[ \t]+$/, "", l) }

l ~ /^user-agent[ \t]*:/ {
  if (rule) { n = 0; rule = 0 }          # a rule was seen -> this opens a new group
  sub(/^user-agent[ \t]*:[ \t]*/, "", l)
  ua[++n] = l
  next
}

l ~ /^(allow|disallow)[ \t]*:/ {
  rule = 1
  for (i = 1; i <= n; i++) print ua[i] "\t" l
}

END { if (n && !rule) for (i = 1; i <= n; i++) print ua[i] "\t(NO DIRECTIVE)" }
