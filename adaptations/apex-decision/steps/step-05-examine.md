---
name: step-05-examine
description: Adversarial panel attacks the winning option from four angles
prev_step: steps/step-04-validate.md
next_step: steps/step-06-resolve.md
---

# Step 5: Examine (Adversarial Panel)

## MANDATORY EXECUTION RULES:

- 🛑 NEVER combine panel roles into one agent (full panel = separate agents, ONE parallel message)
- 🛑 NEVER defend the winner - collect the attacks
- ✅ ALWAYS classify findings by severity and validity
- 📋 YOU ARE THE PANEL CHAIR, not the winner's lawyer

## PANEL SIZE BY STAKES:

- `{stakes_level}` = MEDIUM → **light panel**: Agent 2 (Devil's Advocate) only
- `{stakes_level}` = HIGH → **full panel**: Agents 1-4 (+5 if compliance_mode)
- `{economy_mode}` → self-review using all four lenses below, sequentially, no agents

## THE PANEL (all `model: sonnet`, each receives matrix + risk profiles + winner):

**Agent 1: SKEPTIC** — agent type `Skeptic Investor` if available, else `general-purpose`:
```
You are a skeptical investor reviewing this decision analysis: {materials}
Attack the NUMBERS: which facts are weakest? Which score is most inflated?
Which assumption, if wrong, flips the ranking? Is the fact base sufficient
for stakes this high? For each finding: location, severity (CRITICAL/HIGH/
MEDIUM/LOW), description, what evidence would resolve it.
If solid: state "No skeptic findings."
```

**Agent 2: DEVIL'S ADVOCATE** — agent type `Devils Advocate` if available, else `general-purpose`:
```
Argue AGAINST the winner ({winner}) and FOR the strongest loser: {materials}
Build the best genuine case the analysis undervalues the runner-up or
overvalues the winner. Attack criteria weights, not just scores. What did
the framing miss? For each finding: location, severity, description,
suggested correction. If the winner genuinely holds: state "No devil's advocate findings."
```

**Agent 3: PRE-MORTEM**:
```
It is {+12 months}. The user chose {winner} and it FAILED badly: {materials}
Write the 3 most plausible failure narratives (how exactly it went wrong,
early warning signs that were visible today). Then: which of these does the
current risk section miss or understate? For each gap: severity, description,
mitigation or early-warning trigger to add.
```

**Agent 4: RED TEAM (framing attack)**:
```
Attack the DECISION STRUCTURE itself, not the scores: {materials}
- Is there a missing criterion that would change the ranking?
- Is there a missing OPTION superior to all analyzed ones?
- Is the real question different from the one analyzed?
- Is "decide later + gather X" strictly better than deciding now?
For each finding: severity, description, concrete fix.
If structure holds: state "No red team findings."
```

**Agent 5: COMPLIANCE (CONDITIONAL, only if `{compliance_mode}`)** — agent type `Compliance Advisor` if available:
```
Review this decision for regulatory/legal/tax exposure: {materials}
Flag any option or recommendation with legal risk, missing professional-advice
disclaimer, or regulatory constraint ignored. Findings: severity, description, fix.
```

## AFTER THE PANEL:

### Classify Findings
Severity: CRITICAL (flips or invalidates the decision) / HIGH (changes scores or risks) / MEDIUM / LOW.
Validity: Real / Noise / Uncertain.

### Present Findings Table
```markdown
| ID | Severity | Panelist | Target | Issue | Validity |
```

IF save_mode: append to `{output_dir}/05-examine.md`.

## SUCCESS METRICS:
✅ Panel size matched stakes · ✅ Full panel in ONE parallel message · ✅ Findings classified · ✅ Framing attacked, not just scores

## FAILURE MODES:
❌ One agent doing all roles · ❌ Softening attacks in the summary · ❌ Skipping pre-mortem on HIGH stakes · ❌ Panel on opus

## NEXT STEP:
Findings exist → `./step-06-resolve.md` · Zero Real findings → `./step-09-finish.md`
