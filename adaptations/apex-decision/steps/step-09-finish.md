---
name: step-09-finish
description: Deliver recommendation with action plan, exit conditions, re-examination triggers
prev_step: ROUTED
next_step: COMPLETE
---

# Step 9: Finish (Recommendation & Delivery)

## MANDATORY EXECUTION RULES:

- 🛑 HIGH stakes: NEVER end without explicit human confirmation - even with auto_mode ON
- 🛑 NEVER present the recommendation as a done deal - the human decides
- ✅ ALWAYS include exit conditions and re-examination triggers
- ✅ ALWAYS state confidence level and remaining limitations honestly

## EXECUTION SEQUENCE:

### 1. Write the Decision Document → `{doc_path}` (default `./{doc_name}.md`)

```markdown
# Décision: {decision_question}

## Recommandation (exec summary - 3 bullets max)
- **Recommandation**: {winner} — [one-line why]
- **Chiffre clé**: [the number that carries the decision]
- **Risque principal**: [top risk + mitigation]

## Matrice finale
[final matrix with totals]

## Pourquoi pas les autres
[1-2 lines per rejected option - the real reason, not padding]

## Risques & Limitations
[risks of the winner + converted findings + assumptions never confirmed]
[if regulated domain: one-line "aide à la décision, pas un conseil professionnel"]

## Plan d'action
1. [numbered, concrete first steps - owner + deadline]

## Conditions de sortie
- Si [X] se produit → [undo path / plan B]
[one-way door: state plainly that there is NO undo - what to verify BEFORE committing]

## Triggers de réexamen
- Revoir cette décision si: [fact change that invalidates the analysis] ou au plus tard le [date]

## Confiance: {HIGH/MEDIUM/LOW} — [one line why]
```

### 2. Human Confirmation Gate (HIGH stakes - MANDATORY)

Present via AskUserQuestion: [Je valide {winner} / Je choisis une autre option / J'ai besoin de vérifier des points d'abord]. This gate CANNOT be skipped by auto_mode. MEDIUM/two-way: deliver directly.

### 3. Export & Save

pdf_mode → `pdf` skill, else pandoc, else note unavailable. save_mode → mark steps complete in `00-context.md`, copy final to `{output_dir}/final.md`.

### 4. Deliver

Send `{doc_path}` + compact summary table (winner, confidence, findings fixed, limitations count).

## SUCCESS METRICS:
✅ Exit conditions + re-exam triggers present · ✅ HIGH gate enforced · ✅ Honest confidence · ✅ Losers' rejection reasons stated

## FAILURE MODES:
❌ Auto-validating a one-way door decision · ❌ Overclaiming certainty · ❌ Action plan missing owners/deadlines · ❌ No plan B for reversible choices

## WORKFLOW COMPLETE.
