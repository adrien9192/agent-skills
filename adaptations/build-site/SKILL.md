---
name: build-site
description: Orchestrate a complete production website or product surface from Figma, live references, or a written brief. Decides framework, source precedence, public-vs-authenticated route ownership, capability/risk gates, and deployment target before delegating to the narrowest applicable specialists. Preserves existing projects, defaults greenfield marketing sites to Astro and greenfield SaaS apps to the Adrien TanStack Start stack, then finishes with browser-based QA and proof matched to the requested environment.
argument-hint: "<figma-url | website-url | brief> [fidelity|enhance|reinterpret]"
user-invocable: true
---

# Build Site

Build **$ARGUMENTS** as a complete production website or product surface.

This is the normal entry point for site-building work. It decides the architecture, then delegates specialist work instead of duplicating it.

## 1. Orchestrator ownership

`build-site` is the single controller for:

- framework and repository architecture;
- source precedence;
- public marketing versus authenticated product routes;
- capability and risk gates;
- execution order and file ownership;
- local, preview/staging or production target;
- the final evidence and completion verdict.

Read `STACKS.md`, then `ROUTING.md`, before broad implementation. Downstream skills execute bounded deliverables; they do not reconsider these decisions or start competing pipelines.

Core specialists:

- `implement-figma` — Figma inventory, variables, durable assets, responsive states, component mapping and visual fidelity;
- `implement-website` — live-site reconnaissance, computed styles, assets, interactions and migration evidence;
- `building-premium-sites` — public marketing content, factual gates, SEO/GEO, CRO, lead generation, accessibility requirements and pre-launch audit;
- `auditing-websites` — adversarial pre-launch audit once public routes exist;
- `architecture-review` — bundled code-boundary and trust-boundary review for product/API/auth/payment work.

Optional specialists are invoked only behind the evidence gates in `ROUTING.md`. If an optional specialist is unavailable, use its named bundled fallback or leave the gate blocked. Never claim that an absent specialist ran.

## 2. Decide framework before specialists

Apply `STACKS.md` in this order:

1. preserve a real existing project unless migration is explicitly requested;
2. use Astro for a greenfield public marketing/content site;
3. use the Adrien TanStack Start + Convex + Clerk architecture for a greenfield authenticated SaaS/application;
4. keep one existing application for a hybrid surface unless a measured reason justifies a second deployment.

Figma reference code, a cloned template or another skill never has authority to replace the repository stack.

Write the decision and its falsifiable reason into `docs/site-plan.md` before initialization.

## 3. Resolve source and surface independently

Use `ROUTING.md`.

Source determines extraction:

- Figma → `implement-figma`;
- live website → `implement-website`;
- written brief → no extraction specialist;
- Figma + live website → `implement-figma` owns visual truth, then `implement-website` performs only the bounded migration inventory defined in `ROUTING.md`.

Surface determines implementation:

- public routes → `building-premium-sites`;
- authenticated routes → the product lane and capability gates in `ROUTING.md`;
- hybrid repository → classify every route, preserve one shared design system and never create another app automatically.

A written brief does **not** imply a marketing site. A SaaS brief must continue through the product capability gates.

## 4. Create the execution contract

Before implementation create `docs/site-plan.md` containing:

## Source(s) and precedence
## Fidelity mode
## Framework decision
## Reason, rejected alternatives and switch condition
## Repository architecture
## Route-to-surface ownership
## Reference screens
## Shared chrome, sections and design tokens
## Responsive states
## Content gates and missing content
## Capability/risk gate table
## Deployment target
## Technical integrations
## Required probes
## Out of scope

The capability/risk table uses the columns from `ROUTING.md`: gate, trigger evidence, one owner, required output/probe and status. Record `not applicable` with a reason; record missing prerequisites as `blocked`.

This is the contract every specialist and builder follows.

## 5. Dispatch in dependency order

The default order is:

```text
framework
→ source inventory
→ route/surface ownership
→ capability and risk gates
→ shared design system and architecture
→ bounded implementation
→ accessibility/security/performance checks that were triggered
→ visual and functional QA
→ pre-launch or production audit that was triggered
→ deployment at the recorded target
→ proof and completion report
```

Skip non-applicable gates; never skip a triggered gate silently. Parallelize only independent file ownership after route map, tokens, assets and interfaces are stable.

## 6. Resolve fidelity mode

### fidelity
For an approved design. Reference visual wins. Quality skills may improve invisible semantics/accessibility but do not redesign.

### enhance
Preserve brand/design while improving weak responsive, accessibility, conversion and performance details.

### reinterpret
Reference is inspiration. `building-premium-sites` may redesign substantially.

## 7. Initialize only when needed

If the repository already contains the target project, do not scaffold another one.

For a greenfield Astro website, verify the current official Astro CLI before running it. Prefer pnpm when available. Use the current Tailwind 4 integration pattern rather than deprecated `@astrojs/tailwind` conventions.

Add `@astrojs/react` only when identified interactive islands require React. Do not ship React site-wide just because some components are easier to write in JSX.

## 8. Extract before broad implementation

Delegate source extraction first.

Do not fan out builders until these are stable:

- route map;
- design tokens;
- durable asset paths;
- shared components;
- responsive source inventory;
- content gates.

## 9. Content truth layer

Before production copy is considered final classify content as:

- approved factual content;
- ordinary descriptive content;
- placeholder;
- claim requiring proof;
- third-party attribution requiring approval.

Mandatory proof gates include:

- company metrics;
- savings and percentages;
- processing volumes;
- customer numbers;
- fundraising;
- awards;
- certifications;
- testimonials;
- customer logos;
- hosting/security claims;
- comparative performance claims.

Never publish Lorem ipsum, fake personas/testimonials, invented customer names or invented compliance claims.

## 10. Stabilize the design system before page builders

Establish:

- typography;
- colors;
- spacing;
- radius;
- container widths;
- button/link patterns;
- header;
- footer;
- asset conventions.

Reuse Figma variables/current project tokens when possible. No section builder creates its own palette or primitive system.

## 11. Route architecture

Map every approved screen to a real route/state.

### Astro
Use `src/pages/` and shared Astro layouts/components. Prefer static/server-rendered markup and hydrate only islands that need it.

### TanStack Start
Use typed file routes in `src/routes/` and preserve existing providers.

Do not create a monolithic page that switches on dozens of arbitrary conditions when real routes exist.

## 12. Component plan

Create `docs/component-plan.md` and classify:

### Primitive
Button, input, accordion, dialog, etc.

### Global site
Announcement bar, Header, Footer, Breadcrumb, MobileNav.

### Marketing sections
Hero, product/features, testimonial, impact/proof, integrations, compliance, FAQ, CTA.

### Route-specific
Only genuinely unique structures.

On Astro, prefer `.astro` components for static marketing UI. Reach for React/shadcn only where client-side interaction justifies the island/runtime.

## 13. Parallel implementation rules

Good parallel split:

- shared navigation/footer;
- homepage section group A;
- homepage section group B;
- one inner product page;
- one security/about page.

Bad split:

- five agents editing global CSS;
- multiple agents changing Button;
- page builders inventing tokens/assets independently.

Explicitly assign file/component ownership before parallel work.

## 14. Responsive is first-class

Build mobile intent alongside desktop.

When explicit mobile Figma/reference screens exist, they are requirements.

Account for mobile header/menu hierarchy, section reordering, copy states, image crops, touch targets, horizontal scrollers and mobile-specific CTA behavior.

Do not merely shrink desktop.

## 15. Interaction and motion

Implement observed/approved interaction models only.

Motion must respect reduced motion, keyboard interaction, performance and layout stability.

Do not add GSAP/Lenis or React merely because a skill supports them. Add dependencies only when the design/behavior actually requires them and native CSS/browser behavior is insufficient.

## 16. Execute triggered capability and risk gates

Use the owners recorded from `ROUTING.md`.

For public routes, invoke `building-premium-sites` once as the marketing production lane. For authenticated routes, dispatch only the product capabilities evidenced by the brief or existing code. For user input, API, auth, secrets, uploads, payments or sensitive data, run the dedicated security specialist if available; otherwise use bundled `architecture-review` and explicitly exercise trust boundaries, authorization and negative paths.

Downstream reference stacks are examples, not authority. Preserve working providers. The bundled marketing path defaults to Brevo only when transactional email is needed and the project has no chosen provider.

## 17. Performance

Measure rather than guess.

Check initial JS, image/media weight, fonts, unnecessary hydration/client components, layout shift and duplicated runtime code. When the gate in `ROUTING.md` is triggered, record the benchmark or budget and its result in `docs/site-plan.md`.

For Astro, a static section should normally ship no component JavaScript. Hydration is an explicit choice, not a default.

## 18. Accessibility

Turn semantic landmarks, heading hierarchy, button-vs-link semantics, labels, focus, keyboard menus, modal focus restoration, Escape, contrast, alt text, reduced motion and touch targets into implementation requirements before building interactive UI.

After rendering, verify those requirements with the owner and probe recorded in `ROUTING.md`.

## 19. Mandatory visual QA loop

For every key route:

reference screenshot -> local screenshot -> compare -> classify -> fix -> repeat.

At minimum test reference desktop width, 1440, 1024, 768, 390 and reference mobile width.

Do not validate only the homepage when several templates/routes exist. If no visual reference exists, compare against the approved design direction and check hierarchy, consistency, overflow and responsive intent rather than inventing a pixel-fidelity claim.

## 20. Functional and risk QA

Click through navigation, mobile menu, CTAs, internal links, accordions, forms, language controls, product state transitions and external links that exist.

Check console, hydration warnings, 404s, malformed URLs and failed assets/network calls. Exercise the negative paths required by each triggered capability gate: invalid input, unauthorized access, provider failure, webhook replay or other boundary named in `docs/site-plan.md`.

## 21. Technical verification and deployment

Use the target project's actual commands. Do not bypass legitimate failures.

Typical Astro baseline:

```bash
pnpm astro check
pnpm test        # when tests exist
pnpm build
```

Typical Adrien SaaS starter:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm test:e2e   # when configured/runnable
```

Run browser QA against the rendered application, not only source files or a build exit code.

For a new or rebuilt public surface, `auditing-websites` in pre-launch mode is a completion gate, not an optional suggestion: no P0 may remain open. For an authenticated backend/data/payment surface, apply the production-audit gate from `ROUTING.md` when available.

Deploy only to the target recorded in `docs/site-plan.md`:

- local only -> no remote deployment;
- preview/staging -> deploy reversibly and verify that environment;
- production -> obtain explicit confirmation immediately before the real production action, then run the provider-specific deployment and canary gates.

Preview success never implies production DNS, email delivery, indexing or canary success.

## Completion report

## Framework and provider decisions
## Routes and surface ownership completed
## Design sources and precedence implemented
## Responsive states covered
## Shared components
## Capability/risk gates and owner verdicts
## Content gates and claims remaining
## SEO/GEO status
## Accessibility status
## Security/trust-boundary status
## Performance evidence
## Visual and functional QA status
## Pre-launch/production audit status
## Technical verification
## Deployment target actually exercised
## Missing credentials/integrations
## Intentional deviations

## Delivery definition

A build exit code is not completion. The requested result is complete only when approved routes, design and responsive states are implemented; applicable capability/risk gates have one owner and an executed probe; content is defensible; interactions work; visual, functional and technical QA pass; required audits have no blocking finding; and the recorded local/preview/production target was exercised without claiming a stronger environment.

## Anti-slop rules

Never invent metrics, testimonials, clients, awards, certifications or security claims. Never ship Lorem ipsum. Never replace exact design assets with generic icons when fidelity is requested. Never generate generic gradient-SaaS sections when a concrete design exists. Never rebuild existing primitives unnecessarily. Never change framework for convenience. Never claim pixel-perfect without visual comparison.
