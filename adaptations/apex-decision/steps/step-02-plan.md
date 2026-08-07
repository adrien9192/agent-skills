---
name: step-02-plan
description: Design weighted criteria and kill criteria BEFORE any scoring
prev_step: steps/step-01-analyze.md
next_step: steps/step-03-execute.md
---

# Step 2: Plan (Criteria Design)

## MANDATORY EXECUTION RULES:

- 🛑 NEVER look at how options would score while designing criteria - criteria first, scoring blind
- 🛑 NEVER use more than 7 criteria (dilution) or fewer than 3 (false simplicity)
- ✅ ALWAYS weight criteria and justify each weight from the user's constraints
- ✅ ALWAYS define kill criteria (instant disqualifiers) separately from scored criteria
- 📋 YOU ARE A CRITERIA ARCHITECT - the matrix design IS the decision quality

## EXECUTION SEQUENCE:

### 1. ULTRA THINK: Derive Criteria

From step-01 framing (NOT from the options): what does a GOOD outcome look like? Derive 3-7 criteria. Each criterion:

```markdown
| Criterion | Weight (Σ=100) | How measured | Why this weight |
```

Rules:
- Weights from the user's actual constraints/priorities, not generic ("cost" isn't always #1)
- Measurable formulation: "coût total sur 24 mois" not "prix intéressant"
- Include one long-term criterion (situation in 2-3 years) - short-termism is a default bias
- If two criteria would obviously reward the same underlying property (e.g. "coût mensuel" and "budget annuel"), merge them - qualitative judgment, no computation needed

### 2. Kill Criteria (Dealbreakers)

Separate list - binary, non-negotiable:

```markdown
## Kill Criteria
- KC1: [e.g. exceeds hard budget X] → instant elimination
- KC2: [e.g. illegal / breaches existing contract]
```

An option failing a kill criterion is eliminated BEFORE scoring, with a note - not scored low.

### 3. Classify Reversibility

`{reversibility}` per Bezos doors:
- **Two-way door** (reversible): decide faster, lower evidence bar, note the undo path
- **One-way door** (irreversible): full rigor, and step-09 human confirmation gate applies

State which, and WHY.

### 4. Scoring Method

- Scale 1-5 per criterion (defined anchors: what a 1 means, what a 5 means - write them now, before scoring)
- Weighted total = Σ(score × weight)
- Tie threshold: totals within 5% = tie → tiebreaker is the highest-weight criterion

### 5. Questions (if NOT auto_mode)

Real uncertainties on weights/kill criteria → 1-3 targeted AskUserQuestion. NEVER "are these criteria good?".
If auto_mode: decide, log the judgment calls.

IF save_mode: write criteria design to `{output_dir}/02-plan.md` BEFORE proceeding.

## SUCCESS METRICS:
✅ Criteria derived from framing, blind to options · ✅ Weights justified · ✅ Anchors defined pre-scoring · ✅ Kill criteria separate · ✅ Reversibility classified

## FAILURE MODES:
❌ Criteria reverse-engineered from a favorite option · ❌ All weights equal (lazy) · ❌ Dealbreakers as low scores instead of elimination · ❌ Vague criteria ("qualité")

## NEXT STEP:
Always → `./step-03-execute.md`
