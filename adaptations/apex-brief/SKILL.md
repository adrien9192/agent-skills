---
name: apex-brief
description: Use when the user mentions an upcoming meeting, call, rendez-vous, or asks to prepare for one - "prépare mon meeting", "j'ai un call avec", "rdv demain avec", "brief pour ma réunion", "prepare my meeting", "point client", "comité", "entretien" - OR when they mention a meeting that already happened and want it processed - "débrief", "compte-rendu", "CR du call", "qu'est-ce qui a été dit/décidé avec X". Pre-meeting → brief; post-meeting → structured debrief with decisions, commitments, and follow-up actions.
argument-hint: "[-d] [-x/-X] [-e] [-pdf] [-r <task-id>] <meeting description: who, when, what about>"
---

<objective>
Produce an exhaustive, fact-checked meeting brief using the APEX methodology - multi-source intelligence gathering (past meetings, emails, CRM, tasks, project files, web), a brief structured by meeting type, and a hostile-participant review before delivery.
</objective>

<quick_start>

```bash
/apex-brief call demain 14h avec Karim de TechCorp, suivi mission CSM   # Full pipeline (default)
/apex-brief -d premier rdv avec prospect Neobank                        # + deep web research on people/company
/apex-brief -X -e point interne rapide équipe                           # Cheap mode: no review, no subagents
/apex-brief -r 01-call-techcorp                                         # Resume
```

**Defaults: auto + examine + save are ON.** The skill also triggers WITHOUT the /apex-brief command when the user mentions preparing for a meeting.

</quick_start>

<flags>

| ON | OFF | Long | Description |
|----|-----|------|-------------|
| `-a` | `-A` | `--auto` | Skip confirmations (default ON) |
| `-x` | `-X` | `--examine` | Hostile-participant + gap review (default ON) |
| `-s` | `-S` | `--save` | Save to `.claude/output/apex-brief/` (default ON) |
| `-d` | `-D` | `--deep` | Deep web research on participants and company (AUTO-enabled on unknown accounts - no history anywhere; `-D` forces off) |
| `-e` | `-E` | `--economy` | No subagents |
| `-pdf` | | `--pdf` | Export brief to PDF |
| `-i` | | `--interactive` | Configure flags via menu |
| `-r` | | `--resume` | Resume from previous task ID |

</flags>

<workflow>
**PRE-meeting (default):**
1. **Init** → Parse meeting info (who, when, what), detect meeting type + mode
2. **Analyze** → Parallel multi-source sweep: past meetings (tldv), emails (Gmail), CRM, tasks (Asana), project files, web
3. **Plan** → Brief structure adapted to meeting type
4. **Execute** → Draft the brief (1-2 pages max)
5. **Validate** → Every fact sourced and dated, open actions reconciled
6. **Examine** → Hostile-participant simulation + gap check; fixes applied directly
7. **Finish** → Deliver brief

**POST-meeting (`{brief_mode}` = post):**
1. **Init** → Identify WHICH meeting (echo title+date before anything else)
2. **Debrief** → `steps/step-06-debrief.md`: transcript → decisions, commitments, actions → CR
3. **Finish** → Deliver CR (never auto-sent)
</workflow>

<step_files>

| Step | File | Purpose |
|------|------|---------|
| 00 | `steps/step-00-init.md` | Parse meeting info, detect type, init state |
| 01 | `steps/step-01-analyze.md` | Multi-source intelligence sweep |
| 02 | `steps/step-02-plan.md` | Structure by meeting type |
| 03 | `steps/step-03-execute.md` | Draft the brief |
| 04 | `steps/step-04-validate.md` | Fact and action reconciliation |
| 05 | `steps/step-05-examine.md` | Hostile review + fixes |
| 06 | `steps/step-06-debrief.md` | Post-meeting debrief (post mode only) |
| 09 | `steps/step-09-finish.md` | Delivery |

</step_files>

<state_variables>

| Variable | Type | Set by |
|----------|------|--------|
| `{meeting_subject}` `{participants}` `{meeting_datetime}` `{company}` | strings | step-00 |
| `{meeting_type}` | enum | step-00 (see step-02 taxonomy) |
| `{brief_mode}` | pre / post | step-00 (past-tense meeting or "débrief"/"CR" → post) |
| `{project_context}` | string | step-00/01 (which of the user's projects this relates to) |
| `{available_sources}` | list | step-01 (MCP tools actually connected) |
| `{doc_name}` / `{task_id}` / `{output_dir}` / `{doc_path}` | strings | step-00 |
| `{doc_language}` | string | step-00 (default: French) |
| `{auto_mode}` `{examine_mode}` `{save_mode}` `{deep_mode}` `{economy_mode}` `{pdf_mode}` | boolean | step-00 |

</state_variables>

<execution_rules>
- **Load one step at a time**; persist state; follow next_step directives
- **Time-boxed reality:** a brief for tomorrow beats a perfect brief for yesterday - if the meeting is <2h away, force economy-equivalent speed (fewer agents, shorter brief) and say so
- **Graceful degradation (CRITICAL):** connected sources vary by session. Detect what is actually available (tldv, Gmail, CRM, Asana MCP tools - load via ToolSearch); use what exists, list what's missing under "Sources non consultées". NEVER fail or stall because a source is absent, NEVER invent what a missing source would have said.
- **Model routing (MANDATORY):** source-sweep agents → `haiku`; review agents → `sonnet`; never opus subagents
- **Facts are dated:** every claim in the brief carries its source AND date ("email du 12/07", "meeting tldv du 03/06") - stale intel mislabeled as current kills credibility in a meeting
- **Read-only:** this skill NEVER sends emails, messages, or CRM updates - it prepares; the user acts
- **1-2 pages max.** A brief the user can't absorb in 5 minutes is a failed brief
- **Default language: French** unless indicated otherwise
</execution_rules>

<entry_point>
**FIRST ACTION:** Load `steps/step-00-init.md`
</entry_point>
