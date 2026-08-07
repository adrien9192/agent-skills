---
name: setup-project
description: Detect a repo's stack and wire Claude config, Lefthook hooks, a quality command, and CI — merging with, never replacing, existing tools.
---

# setup-project

Bring a repo up to the DigitalAine baseline. **Merge, never overwrite.** If a config already exists, extend it.

## 1. Detect (read, don't assume)
- Package manager: lockfile wins — `pnpm-lock.yaml`→pnpm, `bun.lockb`→bun, `yarn.lock`→yarn, `package-lock.json`→npm, `uv.lock`/`poetry.lock`→uv/poetry.
- Framework/stack: read `package.json` deps (next, react, vite, express, nest), `pyproject.toml`, `go.mod`, `Cargo.toml`.
- Monorepo: `pnpm-workspace.yaml`, `workspaces` field, `turbo.json`, or multiple app dirs.
- Read the **real** scripts (`package.json.scripts`, `Makefile`, `justfile`). Never invent script names.

## 1bis. Grill the detection before writing anything
Everything below writes into someone's repo. Grill first, 3-5 questions, each settled by reading the repo — not by assumption: *which of these configs already exists and what would I be flattening? does this repo actually run the scripts I'm about to chain? is a hook here going to fight an existing one?* Record `# | question | answer | evidence | plan impact`, and let a real answer change what you write. Escalate only what is irreversible, a preference, or a spend. Full protocol: the `grill-me` skill.

## 2. Claude config
- Create/merge `CLAUDE.md` (concise: architecture, key paths, exact commands, conventions, business constraints, verification criteria). Do NOT copy the global CLAUDE.md.
- Add `.claude/rules/*.md` scoped by path only where useful (frontend/backend/db/tests/infra/security/migrations). Don't load all rules for all files.

## 3. Lefthook (`lefthook.yml`, merge)
- pre-commit: format+lint **changed files only**; `gitleaks protect --staged`. No full test suite.
- pre-push: typecheck + unit/fast tests. No full Playwright unless the repo explicitly needs it.
- Run `lefthook install` after writing.

## 4. `quality` command
- Reuse existing scripts. Chain, when present: lint → typecheck → tests → build. Don't duplicate an equivalent command.

## 5. CI (only if a GitHub remote exists)
- Merge a `.github/workflows/quality.yml`: lint, typecheck, tests, build, gitleaks, osv-scanner, trivy (if Docker/IaC), actionlint. Pin actions to a commit SHA.

## 6. Verify
- `lefthook install` exits 0; run the `quality` command; report pass / pre-existing-failure / caused-by-config separately. Commit nothing.
