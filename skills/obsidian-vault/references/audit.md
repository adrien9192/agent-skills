# Evidence-based memory audit

Audit a named project, client or bounded subject. If none is named, use the current project.
An audit is read-only except for its requested report/journal; do not silently repair notes,
reconfigure tools, refresh every date, or create schedules. Use a larger scope only when asked.

## Four dimensions, no arbitrary score

| Dimension | Concrete check |
|---|---|
| Working context | Role, objective, priorities, permission boundaries, decision owners and sources are discoverable |
| Access | Claimed tools exist; authorization and last read-only proof are distinguished from installation |
| Reusable knowledge | The needed decisions and source-backed lessons can be found without reconstructing them |
| Maintenance | Changed decisions replace active advice; review dates and pending owners are useful |

The absence of a daemon, schedule or autonomous action is not a defect. Do not invent a /100
score, coverage percentage or verified status from the agent's impression.

## Test what the memory answers

1. Read the hub and its directly relevant links. Choose three actual work questions from the
   request/context: a current decision, a constraint or exception, and a next action/owner.
   User-supplied questions take precedence. Do not select only easy facts to make the audit green.
2. Search/read the existing notes as a fresh worker would. For each question record the answer,
   source/path/date, and one of: **retrieved**, **missing**, **contradictory**, **needs recheck**.
   Keep “the note says X” distinct from “X was verified against its authoritative source”.
3. For “missing”, first prove the same lookup can find a known positive note. Try the relevant
   synonym/source or direct hub link before claiming absence. Do not turn a broken search into
   a missing-memory finding.
4. Check changed decisions, stale review dates, duplicate claims, orphan links and sensitive
   information only in this scope. Old does not mean wrong. An unresolved owner is unknown,
   not automatically the user. Distinguish a suggestion from a confirmed defect.
5. When available, run the vault's existing `scripts/vault-health.sh`. It checks structure, not
   truth. Report its real exit code and pre-existing/out-of-scope findings. If unavailable or too
   broad for a supplied fixture, state it was not run; do not fabricate a green audit.

## Deliver an actionable finding

For each confirmed issue show: exact note/source, observed mismatch or failed question, effect
on work, and the smallest correction. Prioritize incorrect active advice, then blocked decisions,
then maintenance friction. Do not rank by number of files or add a refactor backlog.

End with the three question results, what was/not checked, and ONE next useful action. If none
is justified, say none. A request to audit does not authorize changing global rules, installing
connectors, starting services or sending anything. When fixes are also explicitly requested,
apply only the confirmed corrections, preserve prior evidence and replay the failed questions.
