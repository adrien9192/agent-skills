---
name: apex-decision
description: Use when the user faces ANY decision or choice between options - "devrais-je", "should I", "X ou Y", "quelle option", "est-ce que ça vaut le coup", "go/no-go", "worth it?", comparing offers, purchases, investments, strategies, tools, vendors, hires, pricing, career moves, relocations, contracts, or any tradeoff requiring a recommendation. Takes precedence over apex-doc when a request mixes document + choice: this skill produces the final document too.
argument-hint: "[-f] [-c] [-e] [-pdf] [-i] [-r <task-id>] <decision description>"
---

<objective>
Execute systematic decision-making workflows using the APEX methodology (Analyze-Plan-Execute-eXamine) adapted for decisions of ANY kind - business, personal, technical, financial - with weighted criteria defined before evaluation and an adversarial panel attacking the winning option.
</objective>

<quick_start>

```bash
/apex-decision changer de banque pro ou rester           # Full autonomous pipeline (default)
/apex-decision -f embaucher un freelance ou une agence   # + web fact-check of key claims
/apex-decision -c choisir statut juridique nouvelle activité  # + compliance review
/apex-decision -X -e vélo ou métro pour aller au bureau  # Cheap mode (no panel, no subagents)
/apex-decision -r 01-changer-banque                      # Resume previous decision
```

**Defaults: auto + examine + save are ON.** The skill also triggers WITHOUT the /apex-decision command whenever the user asks for help deciding something.

</quick_start>

<flags>
**Enable (lowercase ON) / Disable (UPPERCASE OFF):**

| ON | OFF | Long | Description |
|----|-----|------|-------------|
| `-a` | `-A` | `--auto` | Skip confirmations (default ON) |
| `-x` | `-X` | `--examine` | Adversarial panel on winning option (default ON) |
| `-s` | `-S` | `--save` | Save outputs to `.claude/output/apex-decision/` (default ON) |
| `-f` | `-F` | `--factcheck` | Verify key claims/figures against the web |
| `-c` | `-C` | `--compliance` | Add compliance/legal review (opt-in only, never auto) |
| `-e` | `-E` | `--economy` | No subagents, save tokens |
| `-pdf` | | `--pdf` | Export decision document to PDF |
| `-i` | | `--interactive` | Configure flags via menu |
| `-r` | | `--resume` | Resume from previous task ID |

</flags>

<stakes_calibration>
**MANDATORY before running the pipeline.** The workflow scales to what the decision is worth - a full adversarial pipeline on a trivial choice is malpractice, and a shortcut on an irreversible one is worse.

| Level | Signals | Pipeline |
|-------|---------|----------|
| **LOW** | Reversible in <1 day, negligible cost, no third party bound | NO pipeline. Answer inline: 2-3 line recommendation + one risk. Do not create files or launch agents. |
| **MEDIUM** | Reversible with effort, moderate cost/time, affects others | Steps 00→04 + light examine (1 devil's advocate agent; economy_mode → self-review instead, see step-05) → 09 |
| **HIGH** | Irreversible or contractual, significant money/time/reputation, legal exposure, affects family or business survival | Full pipeline, full panel, and FINAL RECOMMENDATION ALWAYS REQUIRES HUMAN CONFIRMATION - even with auto_mode ON |
| **UNCERTAIN** | Can't tell | Treat as MEDIUM, say so |

Classify in step-00, state the level in the init table, route accordingly.
</stakes_calibration>

<workflow>
1. **Init** → Parse flags, calibrate stakes, setup state
2. **Analyze** → Frame the real decision, enumerate options (incl. status quo + do-nothing), gather facts
3. **Plan** → Weighted criteria + kill criteria BEFORE any scoring (anti-bias), reversibility classification
4. **Execute** → Scored matrix, per-option risk profile, sensitivity analysis, opportunity cost
5. **Validate** → Self-check: sources, uniform scoring, bias checklist
6. **Examine** → Adversarial panel attacks the winner (Skeptic + Devil's Advocate + Pre-mortem + Red-team)
7. **Resolve** → Re-score after attacks; winner may change
8. **Finish** → Recommendation + confidence + action plan + exit conditions + re-examination triggers
</workflow>

<step_files>

| Step | File | Purpose |
|------|------|---------|
| 00 | `steps/step-00-init.md` | Parse flags, calibrate stakes, initialize state |
| 01 | `steps/step-01-analyze.md` | Decision framing and fact gathering |
| 02 | `steps/step-02-plan.md` | Criteria design before evaluation |
| 03 | `steps/step-03-execute.md` | Scoring and analysis |
| 04 | `steps/step-04-validate.md` | Self-check and bias audit |
| 05 | `steps/step-05-examine.md` | Adversarial panel |
| 06 | `steps/step-06-resolve.md` | Post-attack re-scoring |
| 09 | `steps/step-09-finish.md` | Recommendation and delivery |

</step_files>

<state_variables>

| Variable | Type | Set by |
|----------|------|--------|
| `{decision_question}` | string | step-00 (refined in step-01) |
| `{doc_name}` / `{task_id}` | string | step-00 |
| `{stakes_level}` | LOW/MEDIUM/HIGH | step-00 |
| `{options}` | list | step-01 |
| `{criteria}` | weighted list | step-02 |
| `{kill_criteria}` | list | step-02 |
| `{reversibility}` | one-way/two-way | step-02 |
| `{winner}` | string | step-03 (may change in step-06) |
| `{doc_language}` | string | step-00 (default: French) |
| `{auto_mode}` `{examine_mode}` `{save_mode}` `{factcheck_mode}` `{compliance_mode}` `{economy_mode}` `{pdf_mode}` | boolean | step-00 |
| `{output_dir}` | string | step-00 |

</state_variables>

<execution_rules>
- **Load one step at a time** (progressive loading)
- **ULTRA THINK** at criteria design (step-02) and re-scoring (step-06)
- **Persist state variables** across all steps
- **Follow next_step directive** at end of each step
- **Model routing (MANDATORY):** research agents → `haiku`; panel/analysis agents → `sonnet`; NEVER spawn subagents on opus
- **Domain-agnostic:** works for any decision - never assume a business context, a budget, or a domain; derive everything from the user's actual situation
- **The skill RECOMMENDS, the human DECIDES:** never present a recommendation as a done deal; HIGH stakes always end on explicit human confirmation
- **Regulated domains (medical, legal, tax):** the output is decision support, not professional advice - say so once in the Limitations section, then still do the best possible analysis
- **Criteria before scoring, always** - scoring first then fitting criteria is the #1 decision failure mode
- **Status quo is always an option** and gets scored like the others
- **Default document language: French** unless task/user indicates otherwise
</execution_rules>

<entry_point>
**FIRST ACTION:** Load `steps/step-00-init.md`
</entry_point>
