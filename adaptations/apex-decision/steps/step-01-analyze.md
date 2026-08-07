---
name: step-01-analyze
description: Frame the real decision, enumerate options, gather facts
next_step: steps/step-02-plan.md
---

# Step 1: Analyze (Framing & Facts)

## MANDATORY EXECUTION RULES:

- 🛑 NEVER score or compare options here - that's step 3
- 🛑 NEVER accept the decision as framed - question it first
- 🛑 NEVER invent figures - every fact gets a source (user-provided / file / URL / "estimation, à confirmer")
- ✅ ALWAYS include status quo AND at least one option the user didn't mention
- 📋 YOU ARE A FRAMER AND RESEARCHER, not a judge

## EXECUTION SEQUENCE:

### 1. Frame the REAL Decision

The stated question is often not the real one ("quelle banque choisir?" may really be "ai-je besoin de changer de banque?"). Determine:

- **Real question**: what outcome is actually sought? Reformulate `{decision_question}` if needed - log the reframing.
- **Decider & affected**: who decides, who lives with it?
- **Deadline**: real date or artificial urgency? (artificial urgency = flag it)
- **Constraints**: hard limits (budget, legal, family, time) vs preferences

### 2. Enumerate Options

`{options}` must include:
1. Every option the user named
2. **Status quo** (do nothing / keep current) - always
3. At least one option the user did NOT mention (hybrid, defer-and-learn, smaller version, exit)

3-6 options total. More → merge similar ones; fewer than 3 → think harder.

### 3. Gather Facts per Option

**If `{economy_mode}`:** direct tools + own knowledge, flag "à vérifier" on anything uncertain.

**Else:** launch 1-5 parallel agents in ONE message, `model: haiku`, scaled to stakes (MEDIUM: 1-2, HIGH: 3-5):

```
Research facts about option: {option}
Report ONLY verifiable facts with sources: costs, delays, conditions,
constraints, known failure modes, what people who chose this report.
NO opinions, NO recommendation.
```

If `{factcheck_mode}`: prioritize primary sources (official sites, regulators, published prices).

**Facts only the user has** (their finances, preferences, situation): if auto_mode → list as explicit assumptions; else → ask in ONE batch.

### 4. Synthesize + Save

```markdown
## Decision Framing
Real question: ... | Decider: ... | Deadline: ... | Hard constraints: ...

## Options
| # | Option | One-line description | Origin (user/added) |

## Fact Base
| Fact | Value | Source | Confidence |

## Assumptions to Confirm
- ...
```

IF save_mode: write to `{output_dir}/01-analyze.md` BEFORE proceeding.

### 5. Acceptance Criteria

- [ ] AC1: Real decision question answered with a clear recommendation
- [ ] AC2: Status quo scored like any option
- [ ] AC3: Every recommendation carries risks + exit conditions
- [ ] AC4: All facts sourced or flagged as assumptions

## SUCCESS METRICS:
✅ Reframing considered · ✅ Status quo + one unrequested option present · ✅ Facts sourced · ✅ haiku agents, one parallel message

## FAILURE MODES:
❌ Accepting a false binary ("X ou Y" when Z exists) · ❌ Skipping status quo · ❌ Opinions collected as facts · ❌ Starting to score

## NEXT STEP:
Always → `./step-02-plan.md`
