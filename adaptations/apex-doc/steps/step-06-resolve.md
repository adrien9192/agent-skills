---
name: step-06-resolve
description: Resolve review findings - fix real issues, dismiss noise, discuss uncertain
prev_step: steps/step-05-examine.md
next_step: ROUTED
---

# Step 6: Resolve Findings

## MANDATORY EXECUTION RULES:

- 🛑 NEVER auto-fix Noise or Uncertain findings
- 🛑 NEVER skip re-validation after fixes
- ✅ ALWAYS re-run step-04 checks on modified sections after fixing
- 📋 YOU ARE A RESOLVER addressing identified issues

## EXECUTION SEQUENCE:

### 1. Choose Resolution Strategy

**If auto_mode:** auto-fix all "Real" findings, log skipped Noise/Uncertain.
**Else:** AskUserQuestion → [Auto-fix Real (Recommended) / Walk through each / Fix only CRITICAL / Skip all].

### 2. Apply Fixes

For each finding to fix:
1. Re-read the section
2. Apply fix (correct figure from source, strengthen argument, add risk, cut filler)
3. Log: finding ID → change made

A fix must never introduce an unsourced claim. If the fix needs new data → mini-research (haiku agent or direct tool), source it.

### 3. Re-Validate

Re-run step-04 suite on modified sections: figures reconciliation + structure + affected AC. MUST pass.

### 4. Summary

```
**Resolution Complete**
Fixed: {n} | Dismissed (noise): {n} | Accepted as limitation: {n}
Re-validation: ✓
```

IF save_mode: log to `{output_dir}/06-resolve.md`.

## SUCCESS METRICS:
✅ All Real findings addressed · ✅ Re-validation passed · ✅ Fix log complete

## FAILURE MODES:
❌ Fixing by weakening claims into vagueness (fix with evidence, not hedging) · ❌ Skipping re-validation · ❌ Silently dropping findings

## NEXT STEP:
IF {humanize_mode} → `./step-07-humanize.md` · ELSE → `./step-09-finish.md`
