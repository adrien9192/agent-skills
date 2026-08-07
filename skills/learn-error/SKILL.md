---
name: learn-error
description: Record a lesson only after a bug is reproduced AND its fix is proven by a test. Stores date, project, commit, cause, fix, prevention.
---

# learn-error

A durable lesson is expensive context. Earn it.

## Gate (all required before writing)
- The bug was **reproduced**.
- The **root cause** is identified (not a guess).
- A **test or check proves** the fix (it failed before, passes after).

If any is missing, do not record. A hypothesis is not a lesson.

## Record format
Append one entry to `.claude/lessons/lessons.md` in the **current project** (create if absent):

```
## YYYY-MM-DD — <short title>
- project: <name>
- commit: <sha or "uncommitted">
- context: <where/when it happened>
- symptom: <observable failure>
- root cause: <the real reason>
- fix: <what changed>
- regression test: <path::name or command>
- prevention: <rule/lint/type/check that stops recurrence>
- scope: project | reusable-across-projects
- confidence: high | medium
```

## Scope & promotion
- Default: keep it in the project (`scope: project`).
- Promote to `adrien-devkit` (a shared lesson doc or a skill note) ONLY if it genuinely applies to ≥2 projects.

## Never store
Unverified hypotheses, raw log dumps, API keys/tokens, `.env` contents, or client-sensitive data.
