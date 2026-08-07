---
name: apex-doc
description: Use when writing reports, business analyses, audits, comparative studies, executive summaries, memos, commercial proposals, or any structured document that benefits from systematic research, planning, and adversarial review. Triggers - "rédige un rapport", "write a report", "analyse", "executive summary", "audit", "memo", "synthèse", "proposition commerciale", "proposal". NOT for choosing between options - if the request centers on a decision to make, use apex-decision instead (it produces the final document too).
argument-hint: "[-a] [-x] [-s] [-f] [-h] [-c] [-e] [-i] [-r <task-id>] <document description>"
---

<objective>
Execute systematic document-writing workflows using the APEX methodology (Analyze-Plan-Execute-eXamine) adapted for reports and documents, with progressive step loading.
</objective>

<quick_start>

```bash
/apex-doc rapport mensuel trading XAU/USD          # Full autonomous pipeline (default: -a -x -s)
/apex-doc -f -c comparatif fiscal FR vs ES         # + fact-check + compliance
/apex-doc -h article blog growth                   # + humanize pass
/apex-doc -r 01-rapport-trading                    # Resume previous task
/apex-doc -X -e note interne courte                # Cheap mode: no review, no subagents
```

**Defaults: auto + examine + save are ON.** No flags needed for the standard full workflow. The skill also triggers WITHOUT the /apex-doc command when the user asks for a report/analysis/document.

</quick_start>

<flags>
**Enable (lowercase ON) / Disable (UPPERCASE OFF):**

| ON | OFF | Long | Description |
|----|-----|------|-------------|
| `-a` | `-A` | `--auto` | Skip confirmations, auto-approve |
| `-x` | `-X` | `--examine` | Adversarial document review (fact + logic + clarity + devil's advocate) |
| `-s` | `-S` | `--save` | Save step outputs to `.claude/output/apex-doc/` |
| `-f` | `-F` | `--factcheck` | Verify claims/figures against sources (web + files) |
| `-h` | `-H` | `--humanize` | Anti-AI style pass before delivery |
| `-c` | `-C` | `--compliance` | Add Compliance Advisor review (opt-in only) |
| `-e` | `-E` | `--economy` | No subagents, save tokens |
| `-pdf` | | `--pdf` | Export final document to PDF |
| `-i` | | `--interactive` | Configure flags via menu |
| `-r` | | `--resume` | Resume from previous task ID |

**Parsing:** Defaults from `steps/step-00-init.md`, flags override, remainder = `{task_description}`, ID = `NN-kebab-case`.
</flags>

<triviality_gate>
**MANDATORY before running the pipeline.** Trivial request (short email, reformulation, note <1 page, internal one-off with no external stakes) → answer directly inline, NO pipeline, NO files, NO agents. ONE exception survives the bypass: if the trivial text contains figures, do a one-pass figure check (consistent, sourced or marked "à vérifier") - never send an unchecked number. NEVER trivial regardless of length: proposition commerciale, anything a client/bank/administration will read as an engagement.
</triviality_gate>

<workflow>
1. **Init** → Parse flags, setup state
2. **Analyze** → Source & data gathering (1-6 parallel agents)
3. **Plan** → Section-by-section outline + acceptance criteria mapping
4. **Execute** → Draft section by section
5. **Validate** → Self-check: figures reconciled, sources cited, structure matches plan
6. **Examine** → Adversarial review (if -x): Fact-check + Logic + Clarity + Devil's Advocate in parallel (+ Compliance if applicable)
7. **Resolve** → Fix findings (if examine found issues)
8. **Humanize** → Anti-AI style pass (if -h)
9. **Finish** → Deliver document, export PDF (if -pdf)
</workflow>

<step_files>

| Step | File | Purpose |
|------|------|---------|
| 00 | `steps/step-00-init.md` | Parse flags, initialize state |
| 01 | `steps/step-01-analyze.md` | Source and data gathering |
| 02 | `steps/step-02-plan.md` | Section-by-section outline |
| 03 | `steps/step-03-execute.md` | Todo-driven drafting |
| 04 | `steps/step-04-validate.md` | Self-check and reconciliation |
| 05 | `steps/step-05-examine.md` | Adversarial document review |
| 06 | `steps/step-06-resolve.md` | Finding resolution |
| 07 | `steps/step-07-humanize.md` | Anti-AI style pass |
| 09 | `steps/step-09-finish.md` | Delivery and export |

</step_files>

<state_variables>

| Variable | Type | Set by |
|----------|------|--------|
| `{task_description}` | string | step-00 |
| `{doc_name}` | string | step-00 |
| `{task_id}` | string | step-00 |
| `{doc_path}` | string | step-02 |
| `{audience}` | string | step-01 |
| `{doc_language}` | string | step-00 (default: French) |
| `{acceptance_criteria}` | list | step-01 |
| `{auto_mode}` | boolean | step-00 |
| `{examine_mode}` | boolean | step-00 |
| `{save_mode}` | boolean | step-00 |
| `{factcheck_mode}` | boolean | step-00 |
| `{humanize_mode}` | boolean | step-00 |
| `{compliance_mode}` | boolean | step-00 |
| `{economy_mode}` | boolean | step-00 |
| `{pdf_mode}` | boolean | step-00 |
| `{output_dir}` | string | step-00 |

</state_variables>

<execution_rules>
- **Load one step at a time** (progressive loading)
- **ULTRA THINK** before major decisions (outline design, findings resolution)
- **Persist state variables** across all steps
- **Follow next_step directive** at end of each step
- **Save outputs** if `{save_mode}` = true (each step appends to its file)
- **Use parallel agents** for independent research (step-01) and review (step-05)
- **Model routing (MANDATORY):** research/retrieval agents → `haiku`; analysis/review/writing agents → `sonnet`; NEVER spawn subagents on opus
- **Document quality bar (user's global standards):**
  - Executive summary: 3 bullets max, then details
  - Structured deliverables: tables, checklists, scored comparisons
  - Every figure sourced and reconciled; no unverifiable claims
  - Every recommendation lists its risks
  - No vague or generic statements; precise and actionable
- **Default document language: French** unless task description or user says otherwise
</execution_rules>

<entry_point>
**FIRST ACTION:** Load `steps/step-00-init.md`
</entry_point>
