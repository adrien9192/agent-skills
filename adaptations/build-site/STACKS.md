# Stack routing — build-site

This file is the framework decision table for `build-site`.

The decision is made **before** the design specialist starts broad implementation.

## Rule 1 — existing project wins

If a real project already exists, preserve its framework and architecture unless the user explicitly asked for a migration.

Examples:

- existing TanStack Start app -> keep TanStack Start;
- existing Astro site -> keep Astro;
- existing Next.js site -> keep Next.js;
- existing WordPress/Webflow migration -> choose a new target only because migration is the task.

A Figma reference, browser clone workflow, or generated code snippet never has authority to replace the current stack.

## Rule 2 — greenfield public marketing/content website

Default stack:

```text
Astro (latest stable)
├── TypeScript strict
├── Tailwind CSS 4 via @tailwindcss/vite
├── Astro components for static UI
├── @astrojs/react only when real React islands are needed
├── shadcn/Radix only for interactive primitives that justify React
├── Astro sitemap when relevant
├── existing transactional email provider when present; Brevo is the bundled marketing default only when email is actually required
├── PostHog optional
├── Sentry optional
├── Vitest for useful logic tests
└── Playwright/browser QA for critical flows and visual verification
```

### Why Astro

Marketing/content pages should ship HTML/CSS by default and hydrate only interactive islands. Do not send a site-wide React runtime because a navbar or carousel needs interaction.

### Do not add by default

- Convex;
- Clerk;
- TanStack Start;
- TanStack Query/Table/Form;
- AI SDK;
- database;
- Redis;
- external job queue.

Add them only when the product requirement actually needs them.

Provider choice follows the same preservation rule as the framework: keep the repository's working email, analytics, auth and hosting providers unless migration is explicitly requested. A downstream specialist's reference provider never overrides that decision.

### React island rule

Do not install React merely because the designer used components.

Install `@astrojs/react` when a real client-side interactive component benefits from React, for example:

- complex mega menu;
- stateful comparison tool;
- interactive calculator;
- advanced carousel;
- modal/dialog using existing React primitives.

Prefer Astro + semantic HTML + CSS for static sections, cards, logos, testimonials, footers and ordinary content.

## Rule 3 — greenfield SaaS / application

Default to the Adrien SaaS starter architecture:

```text
TanStack Start
├── React + TypeScript strict
├── TanStack Router
├── TanStack Form/Table when needed
├── Convex
├── Clerk while its free tier is suitable
├── Tailwind + shadcn
├── AI SDK only for actual AI features
├── Sentry/PostHog optional
├── Vitest
└── Playwright
```

This is for products dominated by authenticated application behavior: dashboards, CRUD, realtime state, agents, workflows, CRM, monitoring, admin tools.

## Rule 4 — hybrid public site + SaaS

Prefer one existing application when the marketing site is modest and already lives inside the SaaS repository.

Do **not** create a second Astro deployment automatically just to render `/`.

Consider a separate Astro marketing site only when there is a real reason, such as:

- large content/SEO surface;
- independent marketing team/release cycle;
- many editorial pages;
- marketing deployment needs to be independent from product deployment;
- measured performance/maintenance benefit that outweighs two applications.

Document the decision before creating a multi-app/monorepo architecture.

## Rule 5 — editorial showcase benchmark

A site with a homepage, solution pages, security, partners, client content, long editorial
sections, mobile navigation and SEO is a **marketing/content website**, not a SaaS application.

If greenfield, choose Astro.

Do not pull Convex/Clerk/TanStack into that website unless a concrete feature requires them.

## Framework decision output

Before initialization, `build-site` writes this into `docs/site-plan.md`:

```text
Framework decision: <existing | Astro | TanStack Start | other>
Reason: <one paragraph>
Rejected alternatives: <short list>
Switch condition: <what would make us revisit this decision>
```

The decision must be explicit and falsifiable, not inherited from the previous project.
