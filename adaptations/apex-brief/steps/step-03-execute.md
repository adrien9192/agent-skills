---
name: step-03-execute
description: Draft the brief - 1-2 pages, scannable, every fact dated
prev_step: steps/step-02-plan.md
next_step: steps/step-04-validate.md
---

# Step 3: Execute (Drafting)

## MANDATORY EXECUTION RULES:

- 🛑 NEVER exceed 2 pages (1 page if fast mode) - cut detail, keep decisions
- 🛑 NEVER include an undated or unsourced fact
- 🛑 NEVER pad: no throat-clearing, no "il conviendra de" - the user reads this in a taxi
- ✅ ALWAYS write "En 30 secondes" LAST
- 📋 YOU ARE WRITING FOR SOMEONE ABOUT TO WALK INTO A ROOM

## WRITING STANDARDS:

- Language `{doc_language}` (default French) · scannable: tables, bold names, short bullets
- Facts: "[fait] (source, date)" - e.g. "budget validé 15k€ (email Karim, 12/07)"
- Uncertain intel marked: "(non confirmé)" - in a meeting, a wrong certainty is worse than a known unknown
- Questions à poser: verbatim, ready to ask out loud
- Prochaine étape: pre-formulated proposal ("Je propose qu'on...") the user can say as-is

## EXECUTION SEQUENCE:

### 1. Draft Sections (checklist order)

Per section: mark in_progress → pull assigned intel from step-01 → draft into `{doc_path}` (default `./{doc_name}.md`) → mark done. Intel gap in a section → "⚠ Non couvert: [what] (source absente)" - visible, not silently thin.

### 2. Write "En 30 secondes" LAST

3 bullets: contexte (1 line), objectif du meeting (the target outcome), point chaud (the one thing not to forget). A user reading ONLY this must survive the meeting.

### 3. Save

IF save_mode: log deviations/notes to `{output_dir}/03-execute.md`.

## SUCCESS METRICS:
✅ ≤2 pages · ✅ Every fact dated+sourced · ✅ Questions verbatim-ready · ✅ 30-seconds section carries the meeting

## FAILURE MODES:
❌ 4-page essay · ❌ Undated facts · ❌ Vague questions ("parler du budget") · ❌ Gaps hidden instead of flagged

## NEXT STEP:
Always → `./step-04-validate.md`
