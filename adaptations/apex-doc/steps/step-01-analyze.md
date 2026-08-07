---
name: step-01-analyze
description: Pure source gathering - collect data, context, and existing material for the document
next_step: steps/step-02-plan.md
---

# Step 1: Analyze (Source Gathering)

## MANDATORY EXECUTION RULES:

- 🛑 NEVER outline or draft - that's step 2/3
- 🛑 NEVER invent figures, dates, or facts - only collect what sources support
- ✅ ALWAYS record the source of every figure and claim (file:line, URL, or "user-provided")
- ✅ ALWAYS identify audience and purpose before finishing this step
- ✅ IF save_mode: append ALL findings to `{output_dir}/01-analyze.md` BEFORE proceeding
- 📋 YOU ARE A RESEARCHER, not a writer
- 💬 FOCUS on "What material exists?" NOT "What should the document say?"

## EXECUTION SEQUENCE:

### 1. Determine Audience & Purpose

From task description (or ask if genuinely ambiguous AND not auto_mode):
- `{audience}`: who reads this? (client, partner, bank, administration, self, public)
- Purpose: decide / inform / convince / document
- Stakes: high (money, legal, external) or low (internal note)

### 2. Identify Required Sources

THINK about what the document needs:
- **Internal data**: files, previous reports, CLAUDE.md project state, spreadsheets, exports
- **External facts**: market data, regulations, benchmarks, prices, dates
- **User knowledge**: facts only the user has → collect questions for ONE batch (ask now if not auto_mode; list as "assumptions to confirm" if auto_mode)

### 3. Gather Sources

**If `{economy_mode}` = true:** Direct tools only (Glob/Grep/Read, WebSearch only if essential).

**If `{economy_mode}` = false:** Launch 1-6 parallel agents in ONE message, scaled to complexity:

| Document type | Agents |
|---------------|--------|
| Short internal note | 1x file-explorer |
| Standard report | 2-3x (files + web research) |
| High-stakes analysis (invest, legal, market) | 4-6x (files + multiple web angles + data extraction) |

**Agent prompts (model routing MANDATORY):**

**File/data explorer** — `model: haiku`:
```
Find and extract material related to: {specific_area}
Report: file paths, key figures WITH exact values and location (file:line),
relevant excerpts, dates. DO NOT interpret or recommend.
```

**Web researcher** — `model: haiku`, agent type `websearch`:
```
Research: {specific_question}
Report: facts, figures, dates, each with source URL. Prefer primary sources
(official stats, regulator sites, company filings). Flag anything uncertain.
```

**Data extraction/reconciliation** — `model: sonnet` (only if numeric data is central):
```
Extract and reconcile figures from: {sources}
Report: table of figures with sources, discrepancies found, gaps.
```

### 4. Synthesize Findings + Save

Structure findings:

```markdown
## Source Inventory
| Source | Type | Key content | Reliability |
|--------|------|-------------|-------------|

## Key Figures
| Figure | Value | Source | Date |
|--------|-------|--------|------|

## Gaps & Assumptions
- Missing: [data not found - flag for user or mark as limitation]
- Assumption: [what we assume, to confirm]
```

**IF save_mode: write full synthesis to `{output_dir}/01-analyze.md` NOW - most commonly skipped step. DO NOT skip.**

### 5. Infer Acceptance Criteria

```markdown
## Acceptance Criteria
- [ ] AC1: Answers [core question] for {audience}
- [ ] AC2: All figures sourced and reconciled
- [ ] AC3: Risks section present for every recommendation
- [ ] AC4: [document-specific outcome]
```

### 6. Present Summary & Proceed

```
**Source Gathering Complete**
Sources: {count} | Key figures: {count} | Gaps: {count}
→ Proceeding to outline...
```

Do NOT ask for confirmation - proceed directly to step-02.

## SUCCESS METRICS:
✅ Every figure has a source · ✅ Audience & purpose explicit · ✅ Gaps flagged, not papered over · ✅ Right agent count for complexity · ✅ All agents in ONE parallel message · ✅ haiku for research agents

## FAILURE MODES:
❌ Inventing or estimating figures without flagging · ❌ Starting to outline/draft · ❌ Sequential agent launches · ❌ Research agents on sonnet/opus · ❌ Skipping file save when save_mode

## NEXT STEP:
Always proceed directly to `./step-02-plan.md`
