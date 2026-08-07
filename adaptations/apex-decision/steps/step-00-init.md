---
name: step-00-init
description: Initialize APEX-DECISION - parse flags, calibrate stakes, setup state
next_step: steps/step-01-analyze.md
---

# Step 0: Initialization & Stakes Calibration

## MANDATORY EXECUTION RULES:

- 🛑 NEVER run the full pipeline on a LOW-stakes decision - answer inline and stop
- ✅ ALWAYS calibrate stakes BEFORE anything else
- ✅ ALWAYS parse ALL flags
- 📋 YOU ARE AN INITIALIZER, not an analyst
- ✅ ALWAYS show COMPACT summary (one table) and proceed immediately

## Default Configuration

```yaml
auto_mode: true         # -A to disable (default ON - zero friction)
examine_mode: true      # -X to disable (default ON)
save_mode: true         # -S to disable (default ON)
factcheck_mode: false   # -f: Verify claims against the web
compliance_mode: false  # -c: Compliance/legal review (opt-in only, never auto)
economy_mode: false     # -e: No subagents
pdf_mode: false         # -pdf
interactive_mode: false # -i
doc_language: "fr"      # "in English" / "en anglais" in task → en

# Default = autonomous full pipeline (scaled by stakes).
# Quick cheap decision: -X -e
```

## EXECUTION SEQUENCE:

### 1. Parse Flags and Input

Lowercase = ON, UPPERCASE = OFF (see SKILL.md table).

```
-r → {resume_task} = <next argument>
Remainder → {decision_question}
{doc_name} = short kebab slug, 3-6 meaningful words ("changer de banque pro ou rester" → "changer-banque-pro")
{task_id}  = NN-{doc_name} (next number in .claude/output/apex-decision/)
```

### 2. Calibrate Stakes (MANDATORY GATE)

Apply the `<stakes_calibration>` table from SKILL.md:

- **LOW** (reversible <1 day, negligible cost, nobody else bound):
  → STOP the workflow. Give a 2-3 line recommendation + one risk, inline. No files, no agents, no steps. DONE.
- **MEDIUM** → pipeline with light examine (1 devil's advocate agent in step-05)
- **HIGH** (irreversible/contractual/big money/legal/family-impacting):
  → full pipeline + full panel + human confirmation at the end EVEN IF auto_mode
- Ambiguous → MEDIUM, and note the ambiguity

`{stakes_level}` = result. When the user explicitly invoked /apex-decision, minimum level = MEDIUM (they asked for the machine).

### 3. Resume Mode (ONLY if -r present)

`-r` without argument → `ls .claude/output/apex-decision/`: one incomplete task → resume directly; several → list, ask. `-r <id>` → grep match: restore state from 00-context.md, load next incomplete step, STOP fresh init. Partial/no match: list, ask.

### 4. Setup Output (if save_mode)

`mkdir -p .claude/output/apex-decision/{task_id}` → create `00-context.md` (task, timestamp, flags, stakes level, progress table). Steps append to `{output_dir}/NN-<step>.md`.

### 5. Initialize and Proceed

```
✓ APEX-DECISION: {decision_question}

| Variable | Value |
|----------|-------|
| {task_id} | ... |
| {stakes_level} | LOW/MEDIUM/HIGH |
| flags | ... |

→ Framing the decision...
```

One table, no verbose logs, then IMMEDIATELY load step-01.

## SUCCESS METRICS:
✅ Stakes calibrated first · ✅ LOW answered inline without pipeline · ✅ Compact output · ✅ Proceeded immediately

## FAILURE MODES:
❌ Full pipeline on "quel resto ce soir" · ❌ Treating HIGH as MEDIUM to save tokens · ❌ Verbose parsing logs

## NEXT STEP:
LOW → done (inline answer given). Otherwise → `./step-01-analyze.md`
