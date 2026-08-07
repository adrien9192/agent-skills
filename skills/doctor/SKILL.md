---
name: doctor
description: Audit the Claude Code stack — version, model/effort, hooks, MCP, plugins, LSP, RTK, context cost, duplicates, broken/unused, quality tools.
---

# doctor

Read-only health check of the local Claude Code + tooling setup. Output a table; change nothing without asking.

## Run
1. **Version, model & effort:** `claude --version`; read `~/.claude/settings.json` → `model`, `effortLevel`. No hardcoded expectation anywhere here. Model: compare the configured model to the CURRENT session's model (they should match) and flag if a newer top-tier Claude model exists than the one configured; flag a `[1m]`-style context suffix that contradicts `env.CLAUDE_CODE_DISABLE_1M_CONTEXT`. Effort: report the value, don't judge it — flag only if (a) `CLAUDE_CODE_EFFORT_LEVEL` is set in env (it silently overrides settings, `/effort` and frontmatter), or (b) no sweep result exists for the configured model (`skills/doctor/effort-sweep.sh`, results in `~/.claude/effort-sweep/`). Effort defaults do not transfer across models, and Opus 5 carries the previously set level over instead of resetting to its own default — an unswept value is a leftover, not a choice.
2. **No context-reducing proxy:** `env | grep ANTHROPIC_BASE_URL` must be empty for normal sessions (Headroom off). Warn if set.
3. **Plugins:** list `enabledPlugins` from settings; run `claude plugin list` and `claude plugin details <name>` for each. Note scope + rough context cost (skills × description length). Flag duplicates and broken/unused.
4. **Hooks:** enumerate hooks in settings.json; confirm `rtk hook claude` present on Bash PreToolUse.
5. **MCP:** list `mcpServers`; note any needing auth.
6. **LSP:** confirm language servers on PATH (`typescript-language-server --version`, `pyright --version`) and the matching `*-lsp@claude-plugins-official` plugins.
7. **RTK:** `rtk --version`, `rtk gain` (savings sane?), confirm `~/Library/Application Support/rtk/config.toml` exists with a sane `passthrough_max_chars`.
8. **Quality tools:** `lefthook gitleaks osv-scanner trivy actionlint shellcheck ccusage openspec promptfoo yq jq rg` all `--version` cleanly.
9. **Concurrent optimizers:** check headroom proxy env, context-mode, caveman/ponytail global hooks, claude-mem — none should compete with RTK / native auto-memory.
10. **Managed-block drift:** `grep -n "claude-power-user-template\|## Précédence" ~/.claude/CLAUDE.md`. The `## Précédence` section must exist and sit BEFORE the `BEGIN` marker — it is what makes the overrides above survive an installer re-run. Missing or below the marker = the overrides are no longer authoritative, restore it. Then diff the block's rules against the sections above it and report any line the installer restored that a section above already overrides (redundant, not dangerous — precedence handles it — but it should be cleaned).

11. **Grill wiring:** `grep -l "grill-me" ~/.agents/skills/apex/steps/step-02-plan.md ~/.agents/skills/apex/SKILL.md` and the devkit skills `debug`, `architecture-review`, `setup-project`, `advance-milestone`. All six must match. These files sit under `~/.agents`, which is not a git repo — whatever installed them can overwrite them silently, and a missing grill fails open (the pipeline just runs without ever challenging its own plan). Also confirm apex step-02 §8 states the grill runs in **both** modes: an `auto_mode = true → skip` line anywhere in §8-9 is the exact regression this wiring exists to prevent.

12. **Proof wiring:** `grep -c "EXIT GATE" ~/.agents/skills/apex/steps/step-04-validate.md ~/.agents/skills/apex/steps/step-08-run-tests.md ~/.agents/skills/apex/steps/step-10-verify.md` — each must be ≥1, and each block must name the `proof` skill. Same `~/.agents` fragility as check 11. Naming `proof` only in `apex/SKILL.md` is NOT enough and is the exact regression this check exists to catch: apex loads one step file at a time, so a rule stated only in the index is six steps behind by the time it should fire. Measured 2026-07-30: `proof` had 0 invocations across 3 259 sessions while `grill-me` — restated inside step-02 §8 — had 33.

13. **Skill-gate hook:** `~/.claude/hooks/skill-gate.py` present, and wired to BOTH `UserPromptSubmit` (`… skill-gate.py prompt`) and `Stop` (`… skill-gate.py stop`) in settings.json. Only one of the two = the gate is blind: the prompt hook records what was asked, the Stop hook is what actually blocks. Verify it still detects and still blocks:
    ```bash
    echo '{"session_id":"DOC","prompt":"utilise /apex et /grill-me, cf /tmp/x et /clear"}' | python3 ~/.claude/hooks/skill-gate.py prompt   # → apex, grill-me only
    echo '{"session_id":"DOC","transcript_path":"/dev/null"}' | python3 ~/.claude/hooks/skill-gate.py stop                                  # → {"decision":"block"…}
    rm -f /tmp/claude-skillgate-DOC.json
    ```
    A silent pass on the second command means the gate no longer bites.

14. **Orphan mandates & disabled mandates:** checks 11-13 each police one named skill; this one is the generic detector, so a *new* orphan is caught without anyone remembering to add a check. Two probes:

    ```bash
    bash skills/doctor/orphan-mandates.sh
    ```

    Reading the output:
    - **ORPHAN** = the mandate can never fire. Either restate it in the step file that should trigger it, or add a mechanical rule to the hook — the mandate is not real until one of the two exists.
    - **hook-covered** = deliberately absent from the step files because the trigger is rare and conditional (`.base`, `.canvas`). Rare conditional rules belong in a hook; putting them in a hot-path step file taxes every run for a case that fired once in 3 259 sessions.
    - **MANDATED BUT OFF** = a mandate pointing at a skill removed from the catalogue. It can never be honored. This is a real regression introduced by the 2026-07-30 skill cut (`mcp-builder`), which is why it is mechanized here.
    - Known false positives, both English words inside backticks, not skills: `sort` in probe (a) (from the note that no `sort` key exists in Bases) and `prompt` in probe (b) (a parameter at `steps/step-03-execute-teams.md:127`). Anything else in the output is real.
    - Baseline at 2026-07-30: `mcp-builder`, `obsidian-cli`, `obsidian-markdown` are **real orphans, knowingly left open**. None maps to a distinct file extension the hook could key on (`.md` would fire on every write), so no cheap mechanical trigger exists — the mandate fires only if the model happens to remember it, which is exactly the failure mode measured at 0/3 259. Treat them as a standing risk, not as passing. Any name in the output beyond these three plus the two false positives is a new regression.

## Output
A table: check | status (✓/⚠/✗) | detail. End with the top 3 issues to fix, if any.
