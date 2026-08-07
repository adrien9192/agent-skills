---
name: step-06-resolve
description: Re-score after panel attacks - the winner may legitimately change
prev_step: steps/step-05-examine.md
next_step: steps/step-09-finish.md
---

# Step 6: Resolve (Post-Attack Re-Scoring)

## MANDATORY EXECUTION RULES:

- 🛑 NEVER protect the original winner - a changed winner is a SUCCESS of the process
- 🛑 NEVER change a score without citing the finding that justifies it
- ✅ ALWAYS re-run sensitivity if any score or weight changed
- 📋 YOU ARE AN ARBITER weighing attacks, not defending a verdict

## EXECUTION SEQUENCE:

### 1. Rule on Each Real Finding

Per finding: **Accept** (adjust score/weight/risk, cite finding ID) / **Reject** (justify with a fact, not preference) / **Convert** (can't resolve → becomes explicit limitation or verification action in step-09).

CRITICAL findings cannot be Rejected on judgment alone - rejection requires a countervailing fact.

**Late-discovered criterion or option (red-team findings):** default = do NOT retro-fit it into the matrix (unscored late additions corrupt the frozen grid) - Convert it to an explicit limitation + verification action in step-09. EXCEPTION: if the finding is CRITICAL (plausibly flips the decision), loop back to step-02, add it properly (weight/anchors/facts), and re-score the full matrix.

### 2. Rebuild the Matrix (if any change)

Updated matrix, updated totals, re-run sensitivity (step-03 §4). Winner changed → say so prominently, explain which finding did it. `{winner}` = final.

### 3. Confidence Rating

```
HIGH   — robust winner, attacks absorbed, facts solid
MEDIUM — winner holds but FRAGILE sensitivity or open assumptions
LOW    — winner by thin margin with unresolved CRITICAL/HIGH findings
         → recommendation becomes "verify X before deciding"
```

### 4. Log

```
Findings: {n} | Accepted: {n} | Rejected: {n} | Converted: {n}
Winner: {winner} ({unchanged / CHANGED from X}) | Confidence: {level}
```

IF save_mode: write to `{output_dir}/06-resolve.md`.

## SUCCESS METRICS:
✅ Every Real finding ruled on with justification · ✅ Sensitivity re-run after changes · ✅ Honest confidence level

## FAILURE MODES:
❌ Rejecting attacks by preference · ❌ Winner-protection bias · ❌ Confidence HIGH despite open CRITICAL findings

## NEXT STEP:
Always → `./step-09-finish.md`
