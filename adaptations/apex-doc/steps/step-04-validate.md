---
name: step-04-validate
description: Self-check - reconcile figures, verify AC, audit structure and format
prev_step: steps/step-03-execute.md
next_step: steps/step-05-examine.md
---

# Step 4: Validate (Self-Check)

## MANDATORY EXECUTION RULES:

- 🛑 NEVER claim checks pass when they don't
- 🛑 NEVER proceed with unresolved `[DONNÉE MANQUANTE]` markers without user decision
- ✅ ALWAYS run ALL three check suites below
- ✅ ALWAYS fix failures before proceeding
- 📋 YOU ARE A VALIDATOR, not an author

## VALIDATION SUITE (document equivalent of typecheck/lint/tests):

### 4.1 "Typecheck" = Figures Reconciliation — MUST PASS

Re-read `{doc_path}` and verify:
- [ ] Every figure matches the step-01 source inventory exactly
- [ ] Totals, percentages, and derived numbers recompute correctly (do the math)
- [ ] Same figure quoted twice = same value both times
- [ ] Dates, currencies, units consistent (€/$, TTC/HT, k€ vs €)

Any mismatch → fix from source, re-check.

### 4.2 "Lint" = Structure & Format — MUST PASS

- [ ] All planned sections present, in planned order
- [ ] Executive summary: 3 bullets max, decision-carrying
- [ ] Risks section present for every recommendation
- [ ] Comparisons in tables, actions in numbered checklists
- [ ] Language = `{doc_language}` throughout, no mixed-language leaks
- [ ] No filler sentences, no AI boilerplate
- [ ] Headers hierarchy clean (single H1, logical H2/H3)

### 4.3 "Tests" = Acceptance Criteria — MUST PASS

For each AC from step-01: state HOW the document satisfies it, with section reference. An AC you cannot demonstrate = failing test → fix the document.

### 4.4 Unresolved Gaps

List remaining `[DONNÉE MANQUANTE]` markers.
- **If auto_mode:** convert each to an explicit "Limitations" entry in the Risks section
- **If NOT auto_mode:** ask user to provide the data or approve the limitation

## PRESENT RESULTS:

```
**Validation Complete**
Figures reconciled: ✓ {X} figures | Structure: ✓ | AC: ✓ {X}/{X}
Gaps converted to limitations: {count}
```

## ROUTING:

```
IF {examine_mode} = true  → Load step-05-examine.md
ELSE IF {humanize_mode}   → Load step-07-humanize.md
ELSE IF {auto_mode} = false → Ask via AskUserQuestion:
   [Run adversarial review / Humanize / Deliver as-is]
ELSE → Load step-09-finish.md
```

## SUCCESS METRICS:
✅ Math actually recomputed, not assumed · ✅ Every AC demonstrably met · ✅ All gaps resolved or converted to limitations

## FAILURE MODES:
❌ Claiming reconciliation without recomputing · ❌ Proceeding with failing checks · ❌ Deleting gap markers instead of resolving them

## NEXT STEP:
Per routing above.
