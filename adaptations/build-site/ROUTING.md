# Capability routing — build-site

`build-site` owns four independent decisions. Resolve all four; never let one stand in for another:

1. **framework** — `STACKS.md`;
2. **source** — Figma, live website, written brief, or a deliberate mix;
3. **surface** — public marketing, authenticated product, or hybrid;
4. **capabilities and risk** — only the gates evidenced by the requested behavior.

Read this file after `STACKS.md` and before writing `docs/site-plan.md`.

## Gate record

Add one row per applicable or explicitly rejected gate to `docs/site-plan.md`:

| Gate | Evidence that triggers it | Owner | Required output / probe | Status |
|---|---|---|---|---|
| `<name>` | `<route, requirement, integration, risk>` | `<one skill>` | `<artefact or observable check>` | `required`, `not applicable`, or `blocked` |

`not applicable` needs a reason. `blocked` names the missing fact, credential, source or tool. A gate is never silently skipped because a specialist is unavailable.

## Ownership rules

- `build-site` alone owns framework, source precedence, route ownership, execution order and deployment target.
- A downstream skill MUST NOT reconsider those decisions.
- Assign one owner per deliverable. Other skills may review it; they do not independently rewrite it.
- Use the narrowest specialist that owns the observable requirement. Do not invoke a skill merely because its subject is related.
- The bundled marketing path is required. A missing bundled dependency is a broken installation.
- Skills marked **if available** below enhance the current OMP catalogue. If one is absent, use the named bundled fallback when one exists; otherwise keep the gate `blocked` rather than improvising auth, payments or security.

## 1. Source gate

| Evidence | Owner and mode | Output |
|---|---|---|
| Approved Figma | `implement-figma`, full workflow | frame/route inventory, tokens, durable assets, responsive and motion evidence |
| Live website is the visual source | `implement-website`, full workflow | computed-style, interaction, asset and responsive inventory |
| Written brief only | no extraction specialist | route/surface contract from approved facts; then continue to the surface gate |
| Figma + live website | `implement-figma` owns visual truth; `implement-website` runs a **bounded migration pass** for current URLs, approved copy, redirects, assets and behavior absent from Figma | one reconciled inventory; never two competing component maps |
| Several live references | `implement-website` inventories each named reference, then records which reference owns each visual/interaction decision | one source-of-truth table |

Priority remains: explicit instruction → repository invariants → existing stack → approved Figma → approved written content → live migration evidence → specialist defaults.

## 2. Surface gate

### Public marketing routes

Invoke `building-premium-sites`. It owns intake, factual gates, public copy, marketing design system, SEO/GEO, CRO, lead generation, analytics semantics, accessibility requirements and its pre-launch audit. Do not separately rerun all its sub-skills unless this matrix assigns a narrower owner for a concrete exception.

If route hierarchy, navigation or internal linking is unresolved or being restructured, invoke `site-architecture` **if available** before the component plan. Its output is the route map; it does not choose the framework.

### Authenticated product routes

Marketing editorial and SEO rules do not own product UI.

- New product UI: invoke `frontend-design-direction` and then `frontend-design` **if available**. The first owns the visual direction; the second owns implementation. Bundled fallback: `design-taste-frontend`, constrained to the existing product tokens and interaction model.
- Existing product UI being critiqued or polished: invoke `impeccable` **if available**; do not run a second redesign skill in parallel.
- All interactive UI: `accessibility` defines component requirements before implementation; `accessibility-review` verifies them after rendering.

### Hybrid repositories

Classify routes in `docs/site-plan.md`. Public routes follow the marketing lane; authenticated routes follow the product lane. Shared primitives and tokens have one owner in the existing design system. Never create a second app or deployment only to satisfy a skill preference.

## 3. Product and business capability gates

Apply only rows evidenced by the brief, existing code or approved design.

| Trigger | Owner | Required output |
|---|---|---|
| Ambiguous or high-risk multi-service behavior | `intent-driven-development` if available | acceptance criteria and invariants before implementation |
| Next.js code | `nextjs` if available | current App Router/runtime conventions; no framework switch |
| Convex backend | `design` if available | schema, indexes, authz and function contracts |
| Authentication | `auth` if available | identity provider, protected routes, session and authorization boundaries |
| Billing, subscriptions or Stripe | `billing` if available | checkout/webhook/gating contract and failure paths |
| AI generation, tools, streaming or embeddings | `ai-sdk` if available | provider/model/tool contract, trust boundaries and current API usage |
| Durable multi-step work, retries or pause/resume | `workflow` if available | workflow/step boundaries and recovery behavior |
| Pricing or packaging decision | `pricing` | value metric, tiers and approved commercial decision |
| Offer/guarantee/bonus construction | `offers` | approved offer structure; no invented proof |
| Marketing copy | `copywriting` | approved copy within the factual gates owned by `building-premium-sites` |
| Signup flow | `signup` if available | account-creation states, errors and success criteria |
| Post-signup activation | `onboarding` if available | first-run path and activation event |
| Upgrade/paywall surface | `paywalls` if available | trigger, entitlement truth and recovery path |
| Analytics requested | `analytics` | small event contract tied to decisions; consent requirements recorded |
| New observable logic, API, auth, billing or data contract | `test-driven-development` | a failing behavioral test first, then targeted green proof |
| Missing generated image, video or app icon explicitly requested | `image`, `video` or `app-icon` if available | approved, licensed asset in a durable project path |

Before using a framework, provider, CLI or SDK whose current behavior matters, invoke `read-the-damn-docs` if available and read primary current documentation. Figma reference code never outranks the repository stack.

## 4. Risk and verification gates

| Trigger | Owner | Exit condition |
|---|---|---|
| User input, API route, auth, secrets, upload, payment or sensitive data | `security-review` if available; otherwise `architecture-review` plus the explicit trust-boundary and negative-path checks in this row | no unresolved exploitable blocker; inputs, authz, secrets and failure paths exercised; never claim the dedicated security skill ran when it did not |
| Performance target, regression risk, significant hydration/media/font work | `benchmark` if available | before/after or budget measurement on the affected routes |
| Local rendered application | `webapp-testing` if available, otherwise the available browser tool | key flows executed; console/network checked; screenshots captured |
| Preview or deployed URL | `browser-qa` if available, otherwise the available browser tool | smoke, interaction, responsive and visual verdict |
| Public new/rebuilt routes | `auditing-websites`, mode `pre-launch` | no P0; remaining findings assigned or accepted explicitly |
| Auth/data/payments/backend production surface | `production-audit` if available | production risks, rollback and operational gaps resolved or explicit |
| End-to-end product flow crossing UI/API/data | `verification` if available | browser → API → data → response story proven |
| Any completion claim | `proof` | each claim names an executed probe that could have failed |

`architecture-review` remains the code-boundary reviewer. It is the bundled fallback, not evidence that the optional dedicated security review ran.

## 5. Deployment target gate

Record exactly one target before deployment work:

| Target | Rule |
|---|---|
| local only | no deployment; verify locally and report deployment as out of scope |
| preview/staging | autonomous reversible deployment; run preview QA; production-only DNS/email smoke checks remain explicitly pending |
| production | require the user's explicit confirmation immediately before the real production action; run `deploy-checklist` if available, deploy through `vercel-deploy` or `cloudflare-deploy` if available according to the existing platform, then run `canary-watch` if available; when none is available, use the existing platform CLI after confirmation and record manual canary/smoke checks |

Never infer production authorization from "complete", "ship", a Figma handoff or access to credentials. Never change hosting provider merely because another deployment skill is installed.

## Stop conditions

Do not report the site complete while:

- an applicable gate has no owner;
- two skills own the same deliverable;
- a required source or fact is unresolved but rendered as final content;
- a security, accessibility or pre-launch P0 remains open;
- the requested local/preview/production target has not been verified at that level;
- the completion report omits an applicable gate or claims a stronger environment than was exercised.
