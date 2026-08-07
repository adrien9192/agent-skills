---
name: step-03-execute
description: Score the matrix, profile risks per option, run sensitivity analysis
prev_step: steps/step-02-plan.md
next_step: steps/step-04-validate.md
---

# Step 3: Execute (Scoring & Analysis)

## MANDATORY EXECUTION RULES:

- 🛑 NEVER adjust a weight or anchor during scoring - they froze in step-02
- 🛑 NEVER score from vibes - every score cites a fact from the step-01 fact base
- ✅ ALWAYS score ALL surviving options on ALL criteria, same rigor for the boring ones
- 📋 YOU ARE AN EVALUATOR applying a frozen grid

## EXECUTION SEQUENCE:

### 1. Apply Kill Criteria

Eliminate failing options first. Log: option → which KC → evidence.

### 2. Score the Matrix

```markdown
## Decision Matrix
| Criterion (weight) | Option A | Option B | Status quo |
|---|---|---|---|
| Coût 24 mois (30) | 4 — [fact ref] | 2 — [fact ref] | 5 — [fact ref] |
| ... | ... | ... | ... |
| **Weighted total** | **X.X** | **X.X** | **X.X** |
```

Every cell: score + the fact justifying it. Missing fact → score the conservative middle (3) and flag the gap. Same cap applies to WEAK facts: a score above 3 requires a dated, sourced, reliable fact - anecdotal/unverified/single-weak-source evidence caps the score at 3 with a flag.

### 3. Per-Option Risk Profile

For the top 2-3 options:

```markdown
### Option A
- Avantages: [top 3, factual]
- Inconvénients: [top 3, factual]
- Risques: [risk → probability (H/M/L) → impact → mitigation]
- Second-order effects: [what this triggers in 6-24 months]
- Opportunity cost: [what choosing this forecloses]
```

### 4. Sensitivity Analysis

Stress the ranking:
- Swap the top-2 criteria weights → does the winner change?
- Downgrade the winner's best score by 1 (assume optimism) → still wins?
- Result: **ROBUST** (winner survives both) or **FRAGILE** (name the pivot criterion)

FRAGILE is not a failure - it tells the user exactly what to verify before committing.

### 5. Provisional Winner

`{winner}` = highest weighted total (or tiebreaker). State: winner, margin, ROBUST/FRAGILE, top risk.

IF save_mode: write matrix + profiles + sensitivity to `{output_dir}/03-execute.md`.

## SUCCESS METRICS:
✅ Every score fact-referenced · ✅ Status quo scored seriously · ✅ Sensitivity run · ✅ Grid untouched during scoring

## FAILURE MODES:
❌ Halo effect (favorite scores high everywhere) · ❌ Weights tweaked mid-scoring · ❌ Skipping sensitivity because winner "is obvious" · ❌ Gaps scored optimistically instead of 3+flag

## NEXT STEP:
Always → `./step-04-validate.md`
