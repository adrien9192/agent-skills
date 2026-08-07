---
name: step-07-humanize
description: Anti-AI style pass - remove machine-sounding patterns while preserving facts
prev_step: steps/step-06-resolve.md
next_step: steps/step-09-finish.md
---

# Step 7: Humanize (Style Pass)

## MANDATORY EXECUTION RULES:

- 🛑 NEVER change a figure, source, or factual claim during this pass
- 🛑 NEVER restructure sections - style only
- ✅ ALWAYS prefer the `humanizer` or `de-ai-ify` skill if available (invoke via Skill tool)
- 📋 YOU ARE AN EDITOR polishing voice, not content

## EXECUTION SEQUENCE:

### 1. Delegate if Possible

If `humanizer` or `de-ai-ify` skill is available → invoke it on `{doc_path}`, then go to step 3.

### 2. Manual Pass (fallback)

Rewrite in place, hunting:
- AI tells: "En conclusion", "Il est important de noter", "n'hésitez pas", "dans un monde en...", triads everywhere, em-dash overuse
- Symmetric paragraph rhythm (vary sentence length)
- Hedging stacks ("pourrait potentiellement éventuellement")
- Empty intensifiers ("très", "vraiment", "extrêmement" without data)
- Bullet lists that should be one sentence

### 3. Diff Check

Compare figures before/after: identical. If any changed → restore from pre-pass version.

## SUCCESS METRICS:
✅ Zero factual drift · ✅ Reads like a competent human operator wrote it

## FAILURE MODES:
❌ Facts altered during rewrite · ❌ Style pass adds length · ❌ Restructuring

## NEXT STEP:
Always proceed to `./step-09-finish.md`
