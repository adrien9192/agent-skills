---
name: step-06-debrief
description: Post-meeting debrief - transcript to decisions, commitments, actions, CR
prev_step: steps/step-00-init.md (post mode)
next_step: steps/step-09-finish.md
---

# Step 6: Debrief (Post-Meeting) — post mode only

## MANDATORY EXECUTION RULES:

- 🛑 NEVER process a meeting without ECHOING which one first: "Débrief de: {title} — {date} — {participants}". Wrong meeting identified = polluted ledger reused in every future brief.
- 🛑 NEVER invent what was said - transcript/notes absent → say so, build the CR from what the user tells you instead
- 🛑 NEVER auto-send the CR to anyone
- ✅ ALWAYS separate DECIDED vs DISCUSSED vs PARKED - conflating them is the #1 CR failure
- 📋 YOU ARE A SCRIBE AND EXTRACTOR, not an interpreter

## EXECUTION SEQUENCE:

### 1. Identify THE Meeting

tldv available → `search-meetings` by participants/company/date. Multiple candidates → list titles+dates, ask (even in auto_mode - wrong meeting is worse than one question). Single candidate → **echo title+date+participants and proceed**.
No tldv/no recording → ask the user for their notes or a raw dump; the CR is built from that, labeled "source: notes utilisateur".

### 2. Extract (from transcript + meeting notes)

```markdown
## Décisions actées          ← only what was explicitly agreed
| Décision | Qui a validé | Verbatim approx. |

## Engagements pris          ← updates the account ledger
| Engagement | Qui | Deadline dite | Source (minute/timestamp si dispo) |

## Discuté sans conclusion   ← PARKED, explicitly not decided
## Points de friction / signaux    ← objections, hésitations, non-dits notables
## Chiffres mentionnés       ← amounts, dates, volumes quoted in-meeting
```

### 3. Update the Account Ledger

If a previous brief/debrief exists for this account (`ls .claude/output/apex-brief/ | grep -i {company/participant}`): merge new commitments into its ledger — dedup by meeting (same meeting re-debriefed → replace its rows, never duplicate). Mark previous commitments now fulfilled ✓.

### 4. Write the CR → `{doc_path}`

1 page max: En 30 secondes (3 bullets: décision clé, engagement clé, prochain jalon) · Décisions · Engagements (avec relances : QUI doit faire QUOI pour QUAND) · Parked · Prochaine échéance proposée. French default. Every extracted item traceable to transcript/notes.

### 5. Follow-up Actions

List the user's own commitments as a ready checklist. Asana connected → PROPOSE task creation (list what would be created); create only on user confirmation - never silently.

IF save_mode: write to `{output_dir}/06-debrief.md`.

## SUCCESS METRICS:
✅ Meeting echoed before processing · ✅ Decided/discussed/parked separated · ✅ Ledger merged with dedup · ✅ CR 1 page, traceable

## FAILURE MODES:
❌ Wrong meeting silently processed · ❌ "Discussed" upgraded to "decided" · ❌ Invented quotes · ❌ Auto-created tasks or auto-sent CR

## NEXT STEP:
Always → `./step-09-finish.md`
