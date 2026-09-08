---
name: archify
description: Create and validate standalone architecture, workflow, sequence, data-flow, lifecycle and Before/Delta/After diagrams with Archify 2.16.0.
disableModelInvocation: true
disable-model-invocation: true
license: MIT
---

# Archify

This is an on-demand diagram capability, not a coding workflow.

1. Resolve `$HOME/.local/share/archify/2.16.0` and read its `SKILL.md`. All upstream relative paths refer to that directory, not the user's project. Under OMP use `read`; under Claude/Codex use the native file tool. The official 2.16.0 runtime is unchanged.
2. Follow its typed-source, showcase validation and atomic delivery contract. Inspect the actual repository when the request says "this repo". Use `compare architecture before.json after.json delta.html --json` for Before/Delta/After.
3. Run its `bin/archify.mjs` with Node from any cwd using the resolved absolute path. Set `ARCHIFY_UPDATE_CHECK_DISABLED=1` for deterministic/offline runs. Keep all outputs in the user's project or requested delivery directory, never inside the runtime.
4. Visual-check is separate from validation. Follow the machine's existing browser policy; the upstream checker may spawn a temporary Chromium, so do not run it under a no-new-browser policy without an explicit clean-environment request. Reuse the existing CDP/browser surface to inspect the delivered HTML at 1440×900, 1600×1000, 1920×1080 and 2048×1320 instead, preserving the same containment and screenshot criteria. Report this as an equivalent browser check, not an upstream checker pass. Never close a personal browser.

Leave preview/watch modes stopped unless the user requests them. Upstream diagram instructions apply only while producing this diagram; they do not change harness roles, delegation or global permissions.
