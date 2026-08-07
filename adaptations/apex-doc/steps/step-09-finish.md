---
name: step-09-finish
description: Deliver the document - final read, export, summary
prev_step: ROUTED
next_step: COMPLETE
---

# Step 9: Finish (Delivery)

## MANDATORY EXECUTION RULES:

- ✅ ALWAYS do one final full read of `{doc_path}` before delivering
- ✅ ALWAYS send the file to the user (SendUserFile if available)
- 🛑 NEVER send/publish to external services (email, Slack, CRM) without explicit user request

## EXECUTION SEQUENCE:

### 1. Final Read

Full pass of `{doc_path}`: exec summary carries the decision, no leftover markers (`[DONNÉE MANQUANTE]`, TODO), no broken tables, consistent language.

### 2. Export (if pdf_mode)

Invoke the `pdf` skill if available; else `pandoc {doc_path} -o {doc_name}.pdf` if pandoc installed; else note PDF unavailable and deliver markdown.

### 3. Update Save Output (if save_mode)

Mark all steps complete in `{output_dir}/00-context.md`. Copy final document to `{output_dir}/final.md`.

### 4. Deliver

Send `{doc_path}` (and PDF if created) to the user, then show:

```
**APEX-DOC Complete: {doc_name}**

| | |
|---|---|
| Document | {doc_path} ({word_count} words) |
| Sections | {n} |
| Figures sourced | {n}/{n} |
| Review findings fixed | {n} (if examine ran) |
| Limitations declared | {n} |

Risques restants: [only if any - honest list]
```

## SUCCESS METRICS:
✅ File delivered · ✅ No leftover markers · ✅ Honest final summary including remaining limitations

## FAILURE MODES:
❌ Delivering with unresolved markers · ❌ Overclaiming ("perfect, exhaustive") · ❌ Auto-sending to external services

## WORKFLOW COMPLETE.
