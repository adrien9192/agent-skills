---
name: step-00-init
description: Initialize APEX-DOC workflow - parse flags, detect continuation, setup state
next_step: steps/step-01-analyze.md
---

# Step 0: Initialization

## MANDATORY EXECUTION RULES:

- 🛑 NEVER skip flag parsing
- ✅ ALWAYS parse ALL flags before any other action
- ✅ ONLY check for resume if `{resume_task}` is set
- 📋 YOU ARE AN INITIALIZER, not a writer
- 🚫 FORBIDDEN to load step-01 until init is complete
- ✅ ALWAYS show COMPACT summary (one table) and proceed immediately

## Default Configuration

**Flags always override defaults.**

```yaml
auto_mode: true         # -A to disable: Skip confirmations (default ON - user wants zero friction)
examine_mode: true      # -X to disable: Adversarial review (default ON)
save_mode: true         # -S to disable: Save outputs to .claude/output/apex-doc/ (default ON)
factcheck_mode: false   # -f: Verify claims against sources
humanize_mode: false    # -h: Anti-AI style pass
compliance_mode: false  # -c: Compliance review (opt-in only, never auto-enabled)
economy_mode: false     # -e: No subagents
pdf_mode: false         # -pdf: Export PDF
interactive_mode: false # -i: Configure flags interactively
doc_language: "fr"      # Override via task description ("in English" → en)

# Default = autonomous full pipeline. Flags only needed to DISABLE (-A -X -S)
# or add extras (-f -h -c -pdf).
# Quick cheap note: -X -e (skip review, no subagents)
```

## EXECUTION SEQUENCE:

### 0. Triviality Gate (MANDATORY FIRST)

Apply `<triviality_gate>` from SKILL.md: trivial request → inline answer (with one-pass figure check if numbers present), STOP - no pipeline, no files. Proposition commerciale / external engagement = never trivial. Explicit /apex-doc invocation = never trivial (they asked for the machine).

### 1. Parse Flags and Input

Lowercase flag = ON, UPPERCASE = OFF (e.g. `-x` on, `-X` off). See SKILL.md flag table.

```
-r or --resume   → {resume_task} = <next argument>
Remainder        → {task_description}
{doc_name}       = short kebab-case slug: keep 3-6 meaningful words from the description, drop punctuation and filler ("note comparant 2 options de facturation freelance" → "note-facturation-freelance")
{task_id}        = NN-{doc_name} (next available number in .claude/output/apex-doc/)
```

**Language detection:** If task description contains "in English" / "en anglais" → `{doc_language}` = "en". Default: "fr".

### 2. Check Resume Mode (ONLY if -r present)

1. `-r` WITHOUT argument → `ls .claude/output/apex-doc/`: exactly one incomplete task → resume it directly; several → list, ask which.
2. `-r <id>`: `ls .claude/output/apex-doc/ | grep "^{resume_task}"`
3. Exact match → read `00-context.md`, restore state, find last completed step, load next incomplete step. **STOP** - no fresh init.
4. Partial match: single → use it; multiple → list, ask user. No match → list available, ask.

### 3. Setup Output (if save_mode)

```bash
mkdir -p .claude/output/apex-doc/{task_id}
```

Create `{output_dir}/00-context.md` with: task, timestamp, flag table, progress table (steps 01-09, status: pending). Each subsequent step appends its output to `{output_dir}/NN-<step>.md` and updates the progress table in `00-context.md`.

### 4. Interactive Mode (if -i)

Ask via AskUserQuestion: which flags to enable (multiSelect: examine, save, factcheck, humanize, compliance, pdf). Then continue.

### 5. Initialize and Proceed

Show COMPACT initialization summary:

```
✓ APEX-DOC: {task_description}

| Variable | Value |
|----------|-------|
| {task_id} | 01-kebab-name |
| {auto_mode} … {pdf_mode} | true/false each |
| {doc_language} | fr/en |

→ Analyzing...
```

One table, NO verbose parsing logs, then IMMEDIATELY load step-01.

## SUCCESS METRICS:
✅ All flags parsed (enable AND disable) · ✅ Compact output · ✅ Proceeded immediately · ✅ Output folder created with 00-context.md (if save_mode)

## FAILURE MODES:
❌ Verbose parsing logs · ❌ Blocking with unnecessary confirmations · ❌ Starting research (that's step-01)

## NEXT STEP:
Always proceed directly to `./step-01-analyze.md`
