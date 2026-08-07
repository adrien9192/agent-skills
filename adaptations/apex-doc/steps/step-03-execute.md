---
name: step-03-execute
description: Todo-driven drafting - write the document section by section
prev_step: steps/step-02-plan.md
next_step: steps/step-04-validate.md
---

# Step 3: Execute (Drafting)

## MANDATORY EXECUTION RULES:

- 🛑 NEVER deviate from the approved outline without logging the deviation
- 🛑 NEVER write a figure without carrying its source from step-01
- 🛑 NEVER write filler ("il est important de noter", "dans un monde en constante évolution") - every sentence carries information
- ✅ ALWAYS work task by task: mark in_progress → draft → mark completed
- ✅ ALWAYS write the Executive Summary LAST
- 📋 YOU ARE THE AUTHOR executing an approved plan

## WRITING STANDARDS (user's global preferences):

- Language: `{doc_language}` (default French)
- Tone: direct, professional, pragmatic. NEVER condescending or over-pedagogical.
- Precise and actionable - no vague or generic statements
- Figures over adjectives ("marge 12%" not "bonne marge")
- Tables for comparisons, checklists for actions, prose for reasoning
- Short sentences. Active voice. One idea per paragraph.
- Claims follow evidence: state the fact, then the source, then the implication
- Every recommendation is immediately followed by its risks

## EXECUTION SEQUENCE:

### 1. Draft Section by Section

For each task from step-02, in dependency order:
1. Mark in_progress (TaskUpdate if available, else tick the markdown checklist)
2. Pull assigned data from step-01 inventory
3. Draft the section into `{doc_path}` following its planned format
4. Mark completed

If a section reveals a data gap: flag it inline as `[DONNÉE MANQUANTE: description]`, note it for step-04, continue. Do NOT invent.

### 2. Write Executive Summary (LAST)

3 bullets max: conclusion, key figure, key risk. A reader who stops here must still leave with the right decision.

### 3. Assemble & Save

- Verify `{doc_path}` contains all planned sections in order
- IF save_mode: log drafting notes and deviations to `{output_dir}/03-execute.md`

## SUCCESS METRICS:
✅ All section tasks completed · ✅ Exec summary written last, 3 bullets · ✅ Every figure sourced · ✅ Gaps flagged, not filled with inventions · ✅ Formats match outline

## FAILURE MODES:
❌ Filler prose or AI-sounding boilerplate · ❌ Unsourced figures · ❌ Silent deviations from outline · ❌ Exec summary written first · ❌ Recommendations without risks

## NEXT STEP:
Always proceed directly to `./step-04-validate.md`
