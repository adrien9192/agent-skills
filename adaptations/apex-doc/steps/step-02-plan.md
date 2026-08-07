---
name: step-02-plan
description: Strategic outline - section-by-section document plan with AC mapping
prev_step: steps/step-01-analyze.md
next_step: steps/step-03-execute.md
---

# Step 2: Plan (Outline Design)

## MANDATORY EXECUTION RULES:

- 🛑 NEVER start drafting prose - that's step 3
- ✅ ALWAYS structure the plan by SECTION (the document equivalent of file-by-file)
- ✅ ALWAYS map every acceptance criterion to a section
- ✅ ALWAYS assign sources/figures from step-01 to the sections that use them
- ✅ IF save_mode: write full outline to `{output_dir}/02-plan.md` BEFORE showing summary
- 📋 YOU ARE AN ARCHITECT of the document, not its author

## EXECUTION SEQUENCE:

### 0. Escape Hatch: Undecided Structural Choice

If framing reveals the document's core is actually a CHOICE not yet made (which offer, which price, which strategy) → STOP outlining. Load `~/.claude/skills/apex-decision/SKILL.md`, carry over the step-01 material (sources, figures, audience), and run the decision pipeline instead - it produces the final document. Do NOT deliver a document that papers over an untaken decision.

### 1. Detect Document Type

`{doc_type}` - pick closest, it sets the section skeleton:

| Type | Signals | Type-specific sections (added to mandatory skeleton) |
|------|---------|------------------------------------------------------|
| `rapport` | rapport, bilan, état des lieux | Faits & chiffres · Analyse · Recommandations |
| `analyse` | analyse, étude, comparatif SANS choix à trancher | Méthodologie · Tableau comparatif scoré · Enseignements |
| `dossier` | dossier, note de stratégie, briefing, manuel, veille approfondie, état de l'art, deep dive — texte long destiné à survivre à une vérification hostile | Load `~/.claude/skills/dossier-de-recherche/SKILL.md` and `STRUCTURE.md`: they supply the section skeleton (4 familles calibrées) and the acceptance criteria (contrat de claim, contrat de verdict, chapitre caveats, bloc de péremption). Examine step targets verdicts without a falsification condition and figures without a measurement window. |
| `memo` | memo, note interne, synthèse | Contexte 5 lignes · Points clés · Ce qu'on attend du lecteur |
| `proposition-commerciale` | proposition, devis, offre, proposal | Compréhension du besoin · Offre & livrables · Prix & conditions · ROI/valeur chiffrée · Prochaines étapes datées — NEVER trivial, full examine always |
| `article` | article, post, blog | Angle unique · Structure narrative · CTA |
| `doc-technique` | documentation, guide, runbook | Prérequis · Étapes reproductibles · Troubleshooting |

### 2. ULTRA THINK: Design the Document

Mental simulation before writing the outline:
- What decision or understanding must the reader walk away with?
- What is the strongest logical order? (conclusion-first for executives; chronological for narratives; criteria-based for comparisons)
- Where do figures, tables, and visuals belong?

### 3. Choose Document Path

`{doc_path}` = final deliverable location. Default: `./{doc_name}.md` in cwd (or user-specified path). If save_mode, drafts also live in `{output_dir}/`.

### 4. Create Section-by-Section Outline

**Mandatory skeleton (user's global standards) + the `{doc_type}` type-specific sections from §1:**

```markdown
## Outline: {doc_name}

### Section: Executive Summary
- 3 bullets MAX: conclusion, key figure, key risk
- Written LAST, placed FIRST

### Section: [Title]
- Purpose: [what this section proves/shows]
- Content: [key points, 1 line each]
- Data used: [figures from step-01 inventory, with source]
- Format: [prose / table / checklist / scored comparison]

### Section: Risques & Limitations   ← MANDATORY if any recommendation exists
- Risk per recommendation + mitigation
- Data gaps and assumptions from step-01

### Section: Prochaines Actions      ← if purpose = decide
- Numbered checklist: action, owner, deadline
```

**Format rules:** analyses → comparative table with scores · decisions → advantages/disadvantages/risks matrix · plans → numbered checklist with owners and deadlines.

### 5. Map Acceptance Criteria

```markdown
## AC Mapping
- [ ] AC1 → covered by Section X
- [ ] AC2 → covered by Sections Y, Z
```
Every AC must map to at least one section. Unmapped AC = incomplete outline.

### 6. Identify Uncertainties, Ask Smart Questions

Rate confidence (High/Medium/Low) on: audience fit, scope, tone, format choice, data sufficiency.

**If auto_mode:** decide everything yourself, log decisions.
**If NOT auto_mode AND real uncertainties exist:** ask 1-4 TARGETED questions via AskUserQuestion (scope, tone, format, missing data). NEVER ask "is this outline good?".

### 7. Create Task List

Create one task per section via TaskCreate if available, else a markdown checklist in the outline (subject: "Draft section: X", description: content + data to use). Set dependencies if a section feeds another (e.g. comparison table before conclusion).

### 8. Present Plan Summary & Approve

Show: section count, format decisions, AC coverage, open risks.

**If auto_mode:** proceed directly.
**If NOT auto_mode:** ask approval via AskUserQuestion (Approve / Adjust sections / Change format).

## SUCCESS METRICS:
✅ Section-by-section outline with data assigned · ✅ Every AC mapped · ✅ Exec summary + Risks sections planned · ✅ TaskList created · ✅ Targeted questions only

## FAILURE MODES:
❌ Drafting prose (that's step 3!) · ❌ Outline by theme without data assignment · ❌ No Risks section despite recommendations · ❌ Generic "is this good?" questions · ❌ Skipping file save when save_mode

## NEXT STEP:
After approval (or auto_mode) → Load `./step-03-execute.md`
