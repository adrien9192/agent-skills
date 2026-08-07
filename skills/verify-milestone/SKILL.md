---
name: verify-milestone
description: Goal-backward check that a milestone's promised outcomes actually exist in the codebase and pass — not just that tasks were ticked.
---

# verify-milestone

Ticked tasks lie. Verify the outcome.

## Steps
1. **Read the milestone's goal and acceptance criteria** (roadmap / OpenSpec / PRD).
2. For **each criterion**, find the evidence in the codebase: the feature exists, the code path is reachable, the test covers it, the build includes it.
3. **Run the proof:** the relevant tests + build + a smoke test of the user-visible behavior the milestone promised.
4. **Score per criterion:** met (with evidence: file:line, test name, output) / partial / missing.
5. **Verdict:** milestone done only if every acceptance criterion is met with evidence. List gaps otherwise.

Never pass a milestone on green unit tests alone if it promised observable behavior — drive that behavior.
