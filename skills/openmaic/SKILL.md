---
name: openmaic
description: Create interactive courses, slides, quizzes, educational simulations and project-based learning; export slides as PPTX with local OpenMAIC 1.0.1.
disableModelInvocation: true
disable-model-invocation: true
license: MIT
---

# OpenMAIC

A specialized classroom application, not a second general coding harness. Invoke only for a requested educational deliverable. OMP/Astra remains the orchestrator; existing helper/reviewer and approval policies remain unchanged. Do not load the upstream confirmation-heavy installation SOP into an unrelated task. Installation is already complete.

## Lifecycle and provider

- Runtime: `$HOME/.local/share/openmaic/1.0.1`; UI: `http://127.0.0.1:3376`.
- Use `$HOME/.local/bin/openmaic start`, verify `/api/health`, then use the existing browser policy. `openmaic stop` when finished unless the user is actively using the classroom. `openmaic logs` and `openmaic status` use Portly.
- The launcher reads the existing OpenRouter API key from OMP's credential database in read-only mode and passes it only in the child environment. No duplicated `.env`/browser key. OAuth subscriptions are not API keys. Default classroom model: `google/gemini-2.5-flash-lite`, selected for the existing credit balance; an explicit `OPENMAIC_MODEL` overrides it only for this app. Generation still requires available OpenRouter credit.
- No local models, Docker, extra harness, permanent MCP, media provider, transcription or background agent runtime. Course generation uses the remote LLM; media flags below stay false. Do not download models or install an image/video render service.

## Generate and deliver

1. Use the supplied document directly. For PDF, POST multipart `pdf` to `/api/parse-pdf` (local `unpdf` parser); its `data` becomes `pdfContent` below. Read `$HOME/.local/share/openmaic/1.0.1/skills/openmaic/references/generate-flow.md` only when the exact API contract is needed, not the upstream installation/confirmation SOP.
2. POST JSON to `/api/generate-classroom`: `{ "requirement": "<audience, objective, language, requested slides/quiz/simulation/PBL>", "pdfContent": {"text":"<source text>","images":[]}, "enableWebSearch":false, "enableImageGeneration":false, "enableVideoGeneration":false, "enableTTS":false }`. Omit `pdfContent` if there is no document. Ask for each required scene type explicitly in `requirement`; no `sceneTypes` API field exists.
3. Poll the returned `pollUrl` until `succeeded` or `failed`; a 202 only acknowledges a job. On failure inspect the error, do not claim a course exists.
4. Open the successful `result.url`. Verify the requested scenes and learner interactions, including quiz feedback, simulation controls and PBL task state when requested. Export PPTX through the classroom's existing Share/Export control; export is client-side, not an API route. Save a classroom ZIP too when continued editing/interactivity matters: PPTX exports slides, not runnable quizzes or simulations.
5. Deliver exported files in the user's requested project/delivery directory. Verify downloaded PPTX is a valid ZIP with `ppt/presentation.xml` and actual slide content. Preserve course data; stop the server, do not remove `data/classrooms`, `data/classroom-jobs` or browser storage.

The app's durable Pro agent workbench requires separate Postgres configuration and is not enabled. The classic generator covers slides, quiz, interactive HTML and PBL without it.
