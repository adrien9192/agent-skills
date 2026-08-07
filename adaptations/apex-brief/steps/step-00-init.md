---
name: step-00-init
description: Parse meeting info, detect meeting type, initialize state
next_step: steps/step-01-analyze.md
---

# Step 0: Initialization

## MANDATORY EXECUTION RULES:

- ✅ ALWAYS extract who/when/what before anything else; ask ONLY if the meeting is unidentifiable
- ✅ ALWAYS check time-to-meeting and downshift if <2h
- 📋 YOU ARE AN INITIALIZER
- ✅ COMPACT summary (one table), then proceed immediately

## Default Configuration

```yaml
auto_mode: true         # -A to disable
examine_mode: true      # -X to disable
save_mode: true         # -S to disable
deep_mode: false        # -d: deep web research on participants/company
economy_mode: false     # -e
pdf_mode: false         # -pdf
interactive_mode: false # -i
doc_language: "fr"
```

## EXECUTION SEQUENCE:

### 1. Parse Flags and Meeting Info

Lowercase ON / UPPERCASE OFF. `-r` → resume. Remainder → meeting description. Extract:

```
{participants}      = names/roles mentioned ("Karim", "l'équipe produit", "le DAF")
{company}           = counterparty organization (if any)
{meeting_datetime}  = when (parse relative: "demain 14h" → absolute date)
{meeting_subject}   = what it's about
{project_context}   = which user project/mission this relates to (infer from description; refine in step-01)
{doc_name}          = short slug ("call-karim-techcorp") · {task_id} = NN-{doc_name}
```

Missing WHO or WHAT and truly unguessable → ask ONE question (even in auto_mode - a brief for an unidentified meeting is garbage). Missing WHEN → assume soon, note it. Weekday named without date ("vendredi") → if today IS that weekday, assume NEXT week unless "aujourd'hui" is stated; always note the assumed absolute date in the brief.

### 1b. Detect Mode (pre / post)

`{brief_mode}` = **post** if: meeting is in the past, or "débrief", "compte-rendu", "CR", "qu'est-ce qui a été décidé". Else **pre**.
Post mode → skip type detection and time check; after setup (§4), route DIRECTLY to `steps/step-06-debrief.md`.

### 2. Detect Meeting Type (pre mode only)

`{meeting_type}` - pick closest:

| Type | Signals |
|------|---------|
| `discovery` | premier rdv, prospect, intro |
| `client-followup` | suivi, point client, mission en cours, CSM |
| `negotiation` | contrat, prix, renouvellement, closing, partenariat |
| `pitch` | présentation, démo, vendre, convaincre |
| `internal` | équipe, point interne, staff |
| `committee` | comité, board, steering, arbitrage |
| `interview` | entretien, recrutement, candidat |
| `expert` | consultation avocat/comptable/notaire/banquier |

Ambiguous → closest match + note.

### 3. Time Check

Meeting <2h away → force fast mode: max 2 agents in step-01, brief capped at 1 page, skip deep_mode. State this in the summary.

### 4. Resume (ONLY if -r) / Setup Output (if save_mode)

Resume: `-r` without argument → one incomplete task = resume directly, several = list+ask. `-r <id>` → grep `.claude/output/apex-brief/`, restore from 00-context.md, load next incomplete step. Setup: `mkdir -p .claude/output/apex-brief/{task_id}`, create `00-context.md` (meeting info, mode, flags, progress table).

### 5. Summary and Proceed

```
✓ APEX-BRIEF: {meeting_subject} — {participants} ({meeting_datetime})
| type | {meeting_type} | stakes-time | normal/fast | flags | ... |
→ Sweeping sources...
```

## SUCCESS METRICS:
✅ Who/when/what extracted · ✅ Type detected · ✅ Time check done · ✅ Compact, immediate

## FAILURE MODES:
❌ Briefing an unidentified meeting · ❌ Full pipeline when meeting starts in 30 min · ❌ Verbose parsing

## NEXT STEP:
`{brief_mode}` = post → `./step-06-debrief.md` · else → `./step-01-analyze.md`
