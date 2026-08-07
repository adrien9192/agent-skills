---
name: step-02-plan
description: Choose brief structure adapted to meeting type
prev_step: steps/step-01-analyze.md
next_step: steps/step-03-execute.md
---

# Step 2: Plan (Structure by Meeting Type)

## MANDATORY EXECUTION RULES:

- 🛑 NEVER use a generic template when the type-specific one exists
- ✅ ALWAYS define the ONE outcome the user wants from this meeting
- 📋 YOU ARE AN ARCHITECT - 30 seconds of structure choice, not a ceremony

## EXECUTION SEQUENCE:

### 1. Define Target Outcome

One sentence: "À la fin de ce meeting, [outcome mesurable]." (signed next step, unblocked decision, info obtained, relation réparée...). If auto_mode can't infer it → best guess + mark as assumption.

### 2. Pick Section Set by `{meeting_type}`

**Common core (all types):** En 30 secondes (3 bullets: contexte, objectif, point chaud) · Engagements ouverts (ledger from step-01 - theirs AND ours) · Questions à poser · Prochaine étape à verrouiller.

**Type-specific additions:**

| Type | Add sections |
|------|--------------|
| `discovery` | Profil société & enjeux probables · Qualification (budget/autorité/besoin/timing) · Accroches personnalisées |
| `client-followup` | État mission vs promis · Valeur démontrée depuis dernier point (chiffres) · Risques churn/upsell signaux |
| `negotiation` | Positions & intérêts des deux parties · BATNA (la nôtre, la leur estimée) · Concessions possibles vs lignes rouges · Points à NE PAS lâcher |
| `pitch` | Message central unique · Objections probables + réponses · Preuves/démos à montrer |
| `internal` | Décisions à prendre · Blocages à lever · Qui doit repartir avec quoi |
| `committee` | Position à défendre · Alliés/opposants probables · Scénarios de vote/arbitrage |
| `interview` | Grille d'évaluation · Questions par compétence · Red flags à sonder |
| `expert` | Liste exhaustive de questions (le temps expert coûte cher) · Documents à apporter · Décisions dépendant des réponses |

### 3. Map AC → Sections

Each AC from step-01 covered by a section. Assign step-01 intel to sections. Track sections as a markdown checklist (or TaskCreate if available).

IF save_mode: write outline to `{output_dir}/02-plan.md`.

## SUCCESS METRICS:
✅ Target outcome explicit · ✅ Type-specific sections chosen · ✅ Intel assigned to sections

## FAILURE MODES:
❌ Generic template for a negotiation · ❌ No target outcome ("faire le point" is not an outcome) · ❌ Ceremony - this step should be fast

## NEXT STEP:
Always → `./step-03-execute.md`
