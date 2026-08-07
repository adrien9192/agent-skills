---
name: advance-milestone
description: Move a project to its next milestone — confirm the current one is truly done, update state/roadmap, then scope and plan the next.
---

# advance-milestone

## Steps
1. **Confirm current milestone done** — invoke `verify-milestone` (goal-backward, not task-ticking). If it fails, stop and finish the milestone first.
2. **Capture what shipped** — a short summary: delivered features, key commits, deltas from the plan.
3. **Update state** — the project's state/roadmap file (or OpenSpec if initialized): mark the milestone complete, record the summary and the date.
4. **Scope the next milestone** — goal in one sentence, acceptance criteria, the task breakdown, and known risks. If the project uses OpenSpec, create/update the spec; otherwise write it into the roadmap.
5. **Grill the scope before committing it** — 3-5 questions against the draft, answered from the codebase and the previous milestone's outcome: *is this the next thing, or the next obvious thing? which criterion can't be proven by anything in this repo? what did the last milestone teach that this one ignores?* One must be adversarial: *should this milestone exist at all?* Record `# | question | answer | evidence | scope impact` alongside the milestone, and revise the scope before writing it as final. Escalate only direction/preference calls and spend — the rest you settle. Full protocol: the `grill-me` skill.
6. **Handoff** — leave the repo clean (no half-edits), state file current, next steps explicit.

Commit only if the user asks.
