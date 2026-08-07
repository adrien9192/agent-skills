---
name: step-01-analyze
description: Multi-source intelligence sweep - past meetings, emails, CRM, tasks, files, web
next_step: steps/step-02-plan.md
---

# Step 1: Analyze (Intelligence Sweep)

## MANDATORY EXECUTION RULES:

- 🛑 NEVER invent what a missing source would contain
- 🛑 NEVER write the brief here - collect only
- ✅ ALWAYS detect available sources FIRST, sweep only what exists
- ✅ ALWAYS date every fact ("email du 12/07", "meeting du 03/06")
- 📋 YOU ARE AN INTELLIGENCE OFFICER, not a writer

## EXECUTION SEQUENCE:

### 1. Detect Available Sources

Load candidate tools via ONE ToolSearch call (comma-separated select). Candidates:

| Source | Tools (prefix) | Yields |
|--------|----------------|--------|
| Past meetings | `mcp__claude_ai_tldv__search-meetings`, `get-meeting-transcript`, `get-meeting-notes` | History with these participants, commitments made |
| Emails | `mcp__claude_ai_Gmail__search_threads`, `get_thread` | Latest exchanges, open threads, tone |
| CRM | `mcp__claude_ai_<votre_CRM>__*` | Deal/account state |
| Tasks | `mcp__claude_ai_Asana__search_tasks`, `get_tasks` | Open actions, owners, deadlines |
| Project files | Glob/Grep/Read (local) | Contracts, notes, CLAUDE.md project state |
| Web | WebSearch (or `websearch` agent) | Company news, context (deep_mode: + participants' background) |

`{available_sources}` = what actually responded. Missing/unauthenticated → record under "Sources non consultées". NEVER stall on a dead source.

### 1b. Delta-Sweep Check (recurring accounts)

`ls .claude/output/apex-brief/ | grep -i {company or main participant}` → previous brief/debrief exists:
- Reuse its Commitments Ledger as the base (mark rows to re-verify)
- Sweep only SINCE its date ("depuis le {date}") instead of full history - recurring CSM accounts must not pay a full sweep every time
- Note in the brief: "Base: brief du {date}, delta depuis"

Also check `ls .claude/output/apex-decision/` for a past decision on this account/topic: if its "Triggers de réexamen" or "Conditions de sortie" match current facts → surface a ⚠ reminder in the brief ("décision du {date}: trigger de réexamen atteint").

### 1c. Auto-Deep on Unknown Accounts

`{deep_mode}` auto-enables (no flag needed) when the account is UNKNOWN: no tldv history, no Gmail thread, no CRM record, no previous brief. Known account → deep only if `-d` explicitly. First contact = external intel is all you have; recurring client = don't re-pay for research you own.

### 2. Sweep (parallel)

**If `{economy_mode}` or fast mode:** direct calls, top-2 sources only (usually meetings + emails).

**Else:** ONE parallel batch - direct MCP calls for structured sources + `model: haiku` agents for open-ended digging:

- tldv: meetings with `{participants}`/`{company}` (last 6 months) → decisions, commitments WHO/WHAT/WHEN, unresolved points, objections raised
- Gmail: threads with participants (last 3 months) → open questions, promises, friction, last contact date
- CRM: account state, deal stage, amounts
- Asana: open tasks related to `{project_context}` → owner + status + deadline
- Files: local project dir → contract terms, previous deliverables, known issues
- Web (`-d` deep_mode): company recent news, funding, product launches; participants' role/background. Public professional info only - no personal digging.

### 3. Synthesize + Save

```markdown
## Relationship State
Last contact: [date, channel] | Temperature: [factual assessment]

## Commitments Ledger        ← the heart of the brief
| Commitment | Who | Made when (source) | Status |
<!-- format example, NEVER copy as data: | "Envoyer la proposition" | User | email 12/07 | ⚠ OPEN | -->
<!-- no sources swept → single row: "⚠ Ledger vide — aucune source consultée, ne pas assumer zéro engagement" -->

## Participant Profiles
| Name | Role | History | Sensitivities (factual, from sources) |

## Open Threads & Frictions
- [unresolved point, source+date]

## Company/Context Intel (if external)
- [fact, source, date]

## Sources non consultées
- [source]: [why] → brief is blind on [what]
```

IF save_mode: write to `{output_dir}/01-analyze.md` BEFORE proceeding.

### 4. Acceptance Criteria

- [ ] AC1: User walks in knowing every open commitment (theirs AND theirs)
- [ ] AC2: Every brief fact dated and sourced
- [ ] AC3: Brief fits meeting type and is absorbable in 5 minutes
- [ ] AC4: Missing sources declared, not papered over

## SUCCESS METRICS:
✅ ONE ToolSearch batch · ✅ Only real sources swept · ✅ Commitments ledger built · ✅ Everything dated

## FAILURE MODES:
❌ Inventing CRM/meeting content · ❌ Stalling on unauthenticated MCP · ❌ Undated facts · ❌ Personal (non-professional) digging on participants

## NEXT STEP:
Always → `./step-02-plan.md`
