---
name: step-04-validate
description: Self-check - recompute totals, audit for bias, verify AC
prev_step: steps/step-03-execute.md
next_step: steps/step-05-examine.md
---

# Step 4: Validate (Self-Check & Bias Audit)

## MANDATORY EXECUTION RULES:

- 🛑 NEVER claim checks pass without actually recomputing
- ✅ ALWAYS run all three suites
- 📋 YOU ARE A VALIDATOR, not an advocate for the winner

## VALIDATION SUITE:

### 4.1 "Typecheck" = Math — MUST PASS
- [ ] Recompute every weighted total by hand - matrix math correct
- [ ] Weights sum to 100
- [ ] Every cell has its fact reference; every gap is flagged, not hidden

### 4.2 "Lint" = Bias Audit — MUST PASS
Check the analysis (not the user) for:
- [ ] **Anchoring**: does the first-mentioned option win? Re-justify if so
- [ ] **Sunk cost**: does any score reward past investment instead of future value?
- [ ] **Confirmation**: were facts gathered evenly across options, or mostly for the favorite?
- [ ] **Availability**: are risks scored on drama rather than probability?
- [ ] **Optimism on gaps**: unknown scored >3 anywhere?
- [ ] **False urgency**: is the deadline real (step-01)?

Each triggered bias → correct the affected scores, log the correction.

### 4.3 "Tests" = Acceptance Criteria — MUST PASS
Each AC from step-01: demonstrate HOW it's satisfied, with section reference. Undemonstrable AC = fix the analysis.

## ROUTING:

```
IF {examine_mode} → step-05-examine.md
   (MEDIUM stakes: light panel · HIGH stakes: full panel - see step-05)
ELSE IF NOT auto_mode → ask: [Run adversarial panel / Deliver as-is]
ELSE → step-09-finish.md
```

IF save_mode: log results to `{output_dir}/04-validate.md`.

## SUCCESS METRICS:
✅ Totals actually recomputed · ✅ Bias checklist run honestly · ✅ Corrections logged

## FAILURE MODES:
❌ Rubber-stamping the winner · ❌ Bias audit as checkbox theater · ❌ Proceeding with failing math

## NEXT STEP:
Per routing above.
