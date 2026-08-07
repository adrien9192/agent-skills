---
name: step-09-finish
description: Deliver the brief
prev_step: ROUTED
next_step: COMPLETE
---

# Step 9: Finish (Delivery)

## MANDATORY EXECUTION RULES:

- ✅ ALWAYS final full read: 30-seconds section carries the meeting, no ⚠ left unexplained, no leftover markers
- 🛑 NEVER send anything to participants (email/Slack/CRM) - the brief is for the user only

## EXECUTION SEQUENCE:

### 1. Final Read
Full pass of `{doc_path}`: 3-bullet top section, dated facts, verbatim questions, pre-formulated next step, page cap respected.

### 2. Export (if pdf_mode)
`pdf` skill → pandoc → else deliver markdown, note PDF unavailable.

### 3. Save (if save_mode)
Mark steps complete in `{output_dir}/00-context.md`, copy final to `{output_dir}/final.md`.

### 4. Deliver

Send `{doc_path}` (SendUserFile if available) +:

```
**APEX-BRIEF prêt: {meeting_subject}** ({meeting_datetime})
| Type | {meeting_type} | Pages | {n} |
| Sources consultées | {list} | Non consultées | {list or "—"} |
| Engagements ouverts | {n} (dont {n} à vous) | Objections préparées | {n} |
Angles morts: [only if sources were missing - honest one-liner]
```

## SUCCESS METRICS:
✅ Delivered before the meeting · ✅ Blind spots stated · ✅ Nothing sent externally

## FAILURE MODES:
❌ Overclaiming coverage when sources were missing · ❌ Delivering after meeting start

## WORKFLOW COMPLETE.
