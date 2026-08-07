---
name: step-05-examine
description: Hostile-participant simulation + gap check, fixes applied directly
prev_step: steps/step-04-validate.md
next_step: steps/step-09-finish.md
---

# Step 5: Examine (Hostile Review) — light by design

## MANDATORY EXECUTION RULES:

- ✅ ALWAYS run both reviewers in ONE parallel message (2 agents - a brief doesn't need 4)
- ✅ ALWAYS apply Real fixes directly (no separate resolve step)
- 🛑 NEVER let a fix introduce an unsourced fact
- 📋 YOU ARE STRESS-TESTING THE USER'S PREPARATION, not the prose

## EXECUTION SEQUENCE:

### 1. Launch Reviewers

**If `{economy_mode}` or fast mode:** self-review with both lenses, sequential.

**Else, 2 parallel agents, `model: sonnet`:**

**Agent 1: HOSTILE PARTICIPANT** — plays the other side of the table:
```
You are {participants}' most difficult version in this {meeting_type} meeting.
You receive the user's brief: {doc_path}
- Which 3 questions/objections would you raise that the brief does not prepare for?
- Which commitment would you call out ("vous deviez nous envoyer X")? Is it in the ledger?
- Where is the brief's intel outdated or wrong from your side of the relationship?
- {negotiation/pitch: what would you push back on hardest, and what concession would you extract?}
For each: severity (CRITICAL/HIGH/MEDIUM/LOW), what to add to the brief.
If the brief holds: "No hostile findings."
```

**Agent 2: GAP CHECK** — completeness audit:
```
Audit this meeting brief for preparation gaps: {doc_path}
Against source synthesis: {output_dir}/01-analyze.md (or inline data)
- Open commitment in the ledger missing from the brief?
- Source swept in step-01 whose key intel never surfaced?
- Section promised by the outline that's thin or missing?
- Logistics gaps: documents to bring, numbers to know by heart?
For each: severity, description, concrete addition.
If complete: "No gap findings."
```

### 2. Apply Fixes

Real findings → fix `{doc_path}` directly (add prep for objection, complete ledger, refresh stale fact - sourced only). Noise → log-dismiss with one line. Re-check the 2-page cap after additions - cut lower-value content to stay within.

### 3. Log

`Findings: {n} | Fixed: {n} | Dismissed: {n}` — IF save_mode: append to `{output_dir}/05-examine.md`.

## SUCCESS METRICS:
✅ Both reviewers, one message · ✅ Objections now have prepared answers · ✅ Page cap held after fixes

## FAILURE MODES:
❌ 4-agent ceremony on a brief · ❌ Fix bloats brief past 2 pages · ❌ Hostile findings softened

## NEXT STEP:
Always → `./step-09-finish.md`
