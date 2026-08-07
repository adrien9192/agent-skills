---
name: step-04-validate
description: Self-check - facts vs sources, commitments reconciled, format
prev_step: steps/step-03-execute.md
next_step: steps/step-05-examine.md
---

# Step 4: Validate (Self-Check)

## MANDATORY EXECUTION RULES:

- 🛑 NEVER claim a check passed without re-reading the brief against step-01 data
- ✅ ALWAYS run all three suites
- 📋 YOU ARE A VALIDATOR

## VALIDATION SUITE:

### 4.1 "Typecheck" = Facts vs Sources — MUST PASS
- [ ] Every fact in the brief matches step-01 synthesis exactly (names, amounts, dates)
- [ ] Every fact carries (source, date); uncertain ones carry "(non confirmé)"
- [ ] No fact appears that has no source in step-01 → delete or mark assumption

### 4.2 "Lint" = Format & Absorbability — MUST PASS
- [ ] ≤2 pages (1 if fast mode) · "En 30 secondes" = exactly 3 bullets
- [ ] All planned sections present · gaps flagged with ⚠, not silently missing
- [ ] Questions are verbatim-ready · next step is pre-formulated
- [ ] Language consistent, scannable layout

### 4.3 "Tests" = Acceptance Criteria — MUST PASS
- [ ] AC1: commitments ledger complete - both sides' open items in the brief
- [ ] AC2-4 from step-01: demonstrate each with section reference

Failures → fix now, re-check.

## ROUTING:

```
IF {examine_mode} → step-05-examine.md
ELSE → step-09-finish.md
```

IF save_mode: log to `{output_dir}/04-validate.md`.

## SUCCESS METRICS:
✅ Brief re-read against source data · ✅ All suites pass before routing

## FAILURE MODES:
❌ Checkbox theater · ❌ Delivering with orphan facts

## NEXT STEP:
Per routing above.
