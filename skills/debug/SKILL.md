---
name: debug
description: Root-cause a bug — reproduce it, write/find a failing test, fix the cause not the symptom, run targeted then full checks.
---

# debug

Discipline first: also invoke `superpowers:systematic-debugging`. This skill is the DigitalAine checklist on top of it.

## Steps
1. **Reproduce** deterministically. No repro → no fix. Capture the exact error/stack (keep it verbatim).
2. **Write or find a failing test** that captures the symptom. If impossible, script the smallest repro command.
3. **Find the root cause.** `grep` every caller of the function named in the trace. The bug usually lives in a shared function, not the one path the report names.
4. **Grill the cause before fixing it** — one question, not a tree: *is this the root cause or a symptom of something upstream, and what proves it?* Answer it from the code and the repro, not from plausibility. If the answer moves the cause, go back to 3. (Full protocol: `grill-me`.)
5. **Fix the cause, once, where all callers route through** — not a guard in each caller. Smallest correct diff.
6. **Prove it:** the failing test now passes. Then run the targeted check, then the `quality` command.
7. **Classify** remaining failures: caused-by-my-change vs pre-existing. Only own the ones you caused.

## Do not
- Patch only the reported path and leave sibling callers broken.
- Suppress the symptom (try/catch swallow, widen a type, `|| ''`) without understanding the cause.
- Claim fixed without the regression test passing.

After a verified fix, consider `learn-error` if the lesson generalizes.
