---
name: step-05-examine
description: Adversarial document review - fact-check, logic, clarity, devil's advocate
prev_step: steps/step-04-validate.md
next_step: steps/step-06-resolve.md
---

# Step 5: Examine (Adversarial Review)

## MANDATORY EXECUTION RULES:

- 🛑 NEVER launch only 1 review agent - Fact + Logic + Clarity + Devil's Advocate are SEPARATE agents
- 🛑 NEVER skip the Devil's Advocate review - it is the final gate
- 🛑 NEVER dismiss findings without justification
- ✅ ALWAYS launch all agents in ONE message, in parallel
- ✅ ALWAYS classify findings by severity and validity
- 📋 YOU ARE A SKEPTICAL REVIEWER, not a defender of the draft
- 💬 FOCUS on "Where is this document wrong, weak, or dangerous?"

## EXECUTION SEQUENCE:

### 1. Conduct Review

**If `{economy_mode}` = true:** self-review with the four checklists below, sequentially, adversarial mindset.

**If `{economy_mode}` = false:** launch 4+ parallel sub-agents in a SINGLE message. All reviewers on `model: sonnet`. Each receives the full document `{doc_path}` and reviews ONE dimension:

---

**Agent 1: FACT-CHECK reviewer**
```
You are a FACT-CHECK reviewer. Review ONLY factual accuracy of: {doc_path}
- Every figure: is it sourced? plausible? internally consistent?
- Every named fact (dates, laws, prices, names): verifiable?
- {if factcheck_mode: verify top claims against the web; report URL evidence}
For each finding: location, severity (CRITICAL/HIGH/MEDIUM/LOW), description, suggested fix.
If none: state "No factual issues found."
```

**Agent 2: LOGIC reviewer**
```
You are a LOGIC reviewer. Review ONLY reasoning of: {doc_path}
- Conclusions actually supported by the evidence presented?
- Internal contradictions between sections?
- Hidden assumptions, survivorship bias, correlation-as-causation?
- Missing alternatives that invalidate the recommendation?
For each finding: location, severity, description, suggested fix.
If none: state "No logic issues found."
```

**Agent 3: CLARITY & AUDIENCE reviewer**
```
You are a CLARITY reviewer. Review ONLY readability of: {doc_path} for audience: {audience}
- Can the reader decide/act after the exec summary alone?
- Jargon unexplained for this audience? Sections too long? Buried lede?
- Tables/checklists used where prose drags?
- Actionability: does each recommendation say WHO does WHAT by WHEN?
For each finding: location, severity, description, suggested fix.
If none: state "No clarity issues found."
```

**Agent 4: DEVIL'S ADVOCATE (MANDATORY final gate)** — use agent type `Devils Advocate` if available, else `general-purpose`:
```
Take the OPPOSING position to this document's conclusions: {doc_path}
- Attack the strongest recommendation: what would a hostile, competent reader say?
- What risk is understated? What number would they challenge first?
- What would make this document embarrassing in 6 months?
- Is there a simpler conclusion the author avoided?
Be direct and demanding. For each finding: location, severity, description, concrete strengthening suggestion.
If the document survives: state "No devil's advocate findings."
```

**Agent 5: COMPLIANCE reviewer (CONDITIONAL)** — launch alongside if `{compliance_mode}` = true. Use agent type `Compliance Advisor` if available, else `general-purpose`:
```
Review {doc_path} for regulatory/tax/legal exposure (French, Spanish, EU law).
- Claims implying tax or legal advice: accurate? hedged? compliant?
- Any recommendation that ignores a regulatory constraint?
- Missing disclaimers for financial content?
For each finding: location, severity, description, suggested fix.
If none: state "No compliance issues found."
```

🛑 REMINDER: 4+ sub-agent launches in a SINGLE response. 1-3 agents = doing it WRONG.

### 2. Classify Findings

**Severity:** CRITICAL (factually wrong, legal exposure) / HIGH (weakens conclusion) / MEDIUM / LOW.
**Validity:** Real / Noise / Uncertain.

### 3. Present Findings Table

```markdown
| ID | Severity | Category | Location | Issue | Validity |
|----|----------|----------|----------|-------|----------|
| F1 | CRITICAL | Fact | §3 | Margin figure contradicts source | Real |
```

### 4. Get Approval

**If auto_mode:** proceed automatically.
**Else:** AskUserQuestion → [Resolve findings (Recommended) / Skip resolution / Discuss findings].

IF save_mode: append findings to `{output_dir}/05-examine.md`.

## SUCCESS METRICS:
✅ 4+ separate agents, one parallel message · ✅ Devil's Advocate ran · ✅ Compliance ran when applicable · ✅ Every finding classified

## FAILURE MODES:
❌ Single combined review agent · ❌ Skipping Devil's Advocate · ❌ Auto-dismissing findings · ❌ Sequential launches · ❌ Reviewers on opus

## NEXT STEP:
"Resolve findings" → `./step-06-resolve.md` · "Skip" → step-07 (if humanize_mode) else step-09.
