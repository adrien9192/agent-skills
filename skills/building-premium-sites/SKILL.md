---
name: building-premium-sites
description: Use when building or rebuilding a marketing or showcase website. Branches - new premium site or WordPress/Webflow redesign ("refais mon site"), B2B vitrine and local business, landing page, city-based local SEO, bilingual site, lead-gen form or scored diagnostic, semantic silo of 30-50 pages ("cocon semantique"), GEO readiness (llms.txt), quoting a site project, choosing between Astro and Next.js. NOT for web app or SaaS product UI, nor auditing a site without rebuilding it (skill auditing-websites). FR and EN.
---

# Building premium sites

## Overview

A method for producing a premium showcase site that is **data-driven, anti AI-slop, local-SEO and GEO-ready**, from client intake through to production.

**Gate** is the word this skill turns on. Any data the client has not supplied — a figure, a testimonial, a price, a length of experience — stays an open item until they supply it.

This gates **proof**, never illustration. A scenario, a persona or a typical case is invented on purpose and reads as such; write those freely, since a page that refuses to illustrate says nothing while staying defensible. The edge is attribution: invent the example, never the source (`EEAT-WRITING.md` §1).

**A gate closes on the client's writing, and nothing else.** Not all "sources" carry the same weight:

| Level of source | Publishable? |
|---|---|
| The client in writing (filled intake, email, message, signed document) | **Yes** |
| Spoken and reported, even timestamped in your meeting notes | **No** — that is your memory, not their commitment. Send the value back in writing and wait for the "yes" |
| Derived from a public source (LinkedIn, Google Business, press) | **No** — "founder since 2011" is not "14 years of firm experience", and 47 reviews are not 47 clients |
| A careful estimate, a range, a vague formulation | **No** — "over 10 years" is an invented value wearing a costume |

**Data naming a third party: a separate and harder rule.** A testimonial, a client logo, a named case study require the written agreement **of that third party themselves**. "They agreed, I asked them", relayed by your client, is not an agreement: what you are missing is the thing itself, that person's own text. A wrong figure about the client is corrected the next day; a name published without consent cannot be un-published.

**No blanket permission closes a gate.** "I trust you, put whatever works" authorises your layout judgment, not the publication of a fact the client answers for commercially and legally.

The skill is self-contained: everything it needs lives in this folder, and nothing is regenerated from an upstream repository.

## Scope check, before the process

The seven steps below build a site. They are not the route for a one-line change
to a site already live: a copy fix, a price update, one new city page. For those,
edit the typed data, run the delivery checks, ship. Reach for the full sequence
when the work is a new site, a rebuild, or a new page archetype.

## Process (mandatory order)

1. **Intake**: fill `INTAKE-CLIENT.md`, and run it as an interrogation rather than a form — the `grill-me` skill, one question at a time, each answered before the next. A client rarely knows what they want until someone walks them down the branches: framework, lead-gen type, target cities, which offers are actually sold. A form collects what you thought to ask; grilling collects what they had not thought to say. Ask from the first exchange: domain, jurisdiction, language(s), whether the site will conclude a contract online and roughly what size the company is (those two decide whether accessibility is a statutory obligation or only a quality criterion — BLUEPRINT §11 bis, and the answer changes what you quote), the pillars and offers actually sold, verifiable measured proof, target cities, lead-gen type, ESP credentials and mailbox host. Lead-gen call: a plain form by default; an interactive audit tool (BLUEPRINT §9 ter) when a diagnostic adds value inside the sales cycle AND there is a maintenance budget. When the branch is quoting the project rather than building it, invoke the `offers` skill: it carries the value equation, guarantee and payment structure for productized service work; nothing in this folder covers it, despite the description promising it. Run the lead-gen call through the `free-tools` skill first — its scorecard and gating table: it is the only thing that can answer "do not build it" before weeks of work and a permanent abuse surface, and it forces the gated / partly gated choice that §9 ter otherwise freezes into double opt-in.
   *Done when*: every field carries either a client value or a named open gate.
2. **Framework — this skill does NOT own the decision when one already exists.**

   | Situation | Rule |
   |---|---|
   | **Called by `build-site`** | The decision is **already made**, in `build-site/STACKS.md`. **DO NOT reconsider it.** Read it, then build inside it. |
   | **Inside an existing project** | **Preserve** the existing framework and architecture, unless the user explicitly asked for a migration. A Figma file, a cloned page or a generated snippet never has authority to replace the current stack. |
   | **True greenfield standalone marketing site, no upstream decision** | Then, and only then, choose here: **Astro by default** for a content site; Next.js when ≥2 switch conditions hold (the lead magnet is a real app, heavy React reuse, Server Components needed, high-cardinality ISR). |

   The old wording — « make the call fresh each time » — was written when this skill was the
   entry point. It is no longer: `build-site` owns the routing, and a skill that re-decides
   downstream can answer « Astro » to a repo that is already TanStack Start. Deciding twice is
   worse than deciding badly, because nothing signals the contradiction.

   *Done when*: the framework in force is written in the intake **with its origin** — upstream
   decision, existing project, or chosen here — before any initialisation.
2 bis. **Init — for a true greenfield only.** Inside an existing project this step does not
   exist: there is nothing to initialise, and running an init there overwrites the config.

   | Stack | Init |
   |---|---|
   | **Astro** | `pnpm create astro@latest`, then Tailwind **4 via `@tailwindcss/vite`**, then `@astrojs/sitemap` if relevant |
   | **Next** | `pnpm create next-app`, then BLUEPRINT §2-4 |
   | **TanStack Start** | not this skill's business — owned by `build-site/STACKS.md` |

   **Never `npx astro add tailwind`.** That command installs `@astrojs/tailwind`, the deprecated
   integration; the canonical path is the Vite plugin, and `build-site/STACKS.md` states it.
   Adding the integration on top of the plugin produces two Tailwind pipelines on the same build.

   Fill `.env` from `assets/env.example`.
3. **Build**: follow `BLUEPRINT.md`. ALWAYS read: §16 (playbook) + §17 (traps). As the project needs: §5 bis (bilingual or single-language — Astro's i18n fallback is native), §9 (local SEO), §9 bis (off-brand acquisition — when that means comparison or "alternative to X" pages, the `competitors` skill owns the format and the honesty rules), §9 ter (audit tool), §9 quater (semantic silo), §12 bis (video). When `build-site` records a required `scroll experience` gate, read `SCROLL-STORYTELLING.md` before the component plan and run its fingerprint check before markup. Fully data-driven architecture (typed data plus generic components; in Astro, a loader function in `src/content.config.ts`). The equivalence table in §2 bis maps each pattern between Next and Astro.
   *Done when*: **every page in the §6 inventory renders** from typed data, the build of the framework in force passes (§7), and every playbook step in §16 is ticked. A page written by hand means the build is unfinished.
4. **Design**: **REQUIRED SUB-SKILL** `design-taste-frontend` for all UI — handoff: client brief, sector, and the starter's `:root` tokens to retheme, BEFORE writing components. Copy `assets/motion/` (the reduced-motion and webdriver guards are not negotiable; per-brand retuning happens in the `TUNING`/`SELECTORS` blocks at the top of engine.ts).
   Accessibility belongs in the component spec, not in the QA that follows it: target size, focus appearance, error suggestion, reflow at 400% and modal escape are decided when the component is designed, and retrofitting them means rebuilding it. Success criteria: the `accessibility` skill, web column only. An automated scan catches roughly a third of what WCAG asks for, which is why `audit-local.mjs` alone never closes this.
   *Done when*: the `:root` tokens carry the client's brand, no component hardcodes a colour, and every interactive component has its target size, focus state and keyboard path specified.
5. **Content**: apply `EEAT-WRITING.md`. At 3+ pages → parallel agents (BLUEPRINT §13: batches of 2-4 pages, sonnet for editorial and haiku for volume, prompt = exact format + §7 rules + a cleaned reference file, then grep to confirm — an agent sometimes reports DONE without writing). Then page by page: **REQUIRED SUB-SKILL** `humanizer` on the copy, THEN the gate — figures, testimonials, prices and seniority go through `site-fact-checker`, traced to INTAKE-CLIENT.md or a named source.
   *Done when*: every page has been through `humanizer`, and every measured claim carries its source or an open gate. An UNVERIFIABLE stays out of publication.
6. **SEO/GEO from v1**: static sitemap lastmod, robots plus Content-Signal, `llms.txt` and `llms-full.txt`, `Accept: text/markdown` negotiation (`assets/markdown-negotiation/`), validated JSON-LD (the LocalBusiness subtype of the exact trade, BLUEPRINT §8), 301s for old URLs.
   *Done when*: all six artefacts answer 200 on the preview domain. If intake asked for analytics (`INTAKE-CLIENT.md` §9), name the three or four events that count as a lead before wiring the tag (`analytics`, naming convention and the marketing-site event table; the rest of that skill is out of format here). Without them, the visibility-or-conversion triage in `auditing-websites` has no first-party data to read six months later.
6 bis. **Code review**: `design-taste-frontend` judged the UI and the pre-launch audit judges the delivered site, but neither reads the code. Before deploying, review it adversarially — `architecture-review` on the boundaries and failure modes, or APEX with `-x` when the build introduced server-side logic (forms, audit tool, webhooks).
   *Done when*: every finding is fixed or written down with the reason it was accepted.
7. **QA and deployment**: `QA-CHECKLIST.md` before AND after deploy. Canonical commands, **per stack** — `rm -rf .next` is a Next.js artefact and means nothing on
   an Astro build:

   | Stack | Chaine |
   |---|---|
   | **Astro** | `rm -rf dist .astro && pnpm astro check && pnpm lint && pnpm test && pnpm build` |
   | **Next** | `rm -rf .next && pnpm tsc --noEmit && pnpm lint && pnpm test && pnpm build` |
   | **TanStack Start** | `rm -rf dist .output && pnpm typecheck && pnpm lint && pnpm test && pnpm build` |

   Run the chain of the framework **in force** (§2), not the one this skill used to assume. Automated QA: copy `../auditing-websites/assets/audit-local.mjs` into `scripts/` and set its `AUDIT_*` variables. When the scroll-experience gate is required, also run `../auditing-websites/assets/audit-scroll.mjs` on desktop, mobile and reduced motion, read each contact sheet, then append the accepted fingerprint. Then do the keyboard pass by hand, because axe is structurally blind to it: focus restored after the drawer or modal closes, arrow keys and Escape on the megamenu, `aria-live` announcing the form result. An axe-green drawer that strands focus on close is the normal failure, not the exotic one. Patterns: `frontend-a11y` (React-flavoured; the HTML and ARIA transfer to Astro, the hooks do not). At delivery, close the loop: a pre-launch audit via `auditing-websites` (workflow `audit-site`, mode `pre-launch`).
   *Done when*: sections G (production smoke tests) and H (an email actually received) are ticked, and the pre-launch audit comes back with no P0. Tick each on an EXECUTED probe, never on a plausible one: the `proof` skill's falsifier question applies here, and section H exists precisely because a 250 OK from the mail API looks the same whether the message landed in an inbox or in spam.

## Checks before delivery

Four measurements that `tsc`, `eslint` and `build` all fail to produce, to run against rendered HTML: **title budget** (rendered ≤ 60, so source ≤ 47 with a brand template), **cluster duplication** (boilerplate rate alongside the mean Jaccard that dilutes it), **orphan pages** (editorial inbound links, not sitewide), **`og:url`** page by page. Rules, measured figures and thresholds: `BLUEPRINT.md` §8 and "Scripted checks to run AFTER the build".

## Quick reference

| File | Contents |
|---|---|
| `BLUEPRINT.md` | Architecture, design system, §4 bis GSAP, §5 bis bilingual/single, §9-9 quater acquisition, §11 jurisdictions, §13 agents, §16 playbook, §17 traps (40) |
| `INTAKE-CLIENT.md` / `assets/env.example` | Client and environment variables, filled before any code |
| `EEAT-WRITING.md` | Writing plus E-E-A-T plus persuasion (worked examples: `references/examples/`) |
| `QA-CHECKLIST.md` | QA and deploy checklist (invariants over Vercel/Brevo commands) |
| `assets/motion/` | GSAP + Lenis engine — retune via `TUNING`/`SELECTORS` at the top |
| `SCROLL-STORYTELLING.md` | Optional scroll-timeline branch: narrative contract, grammars, fingerprint, assets and temporal QA |
| `assets/scroll-registry.mjs` | Cross-project fingerprint gate, stored outside client repositories |
| `assets/encode-scroll-video.mjs` | Provider-neutral dense-GOP mp4 and matching poster encoder |
| `assets/i18n.ts` + `i18n.config.ts` | Generic primitives plus PER-SITE config (whitelist regenerated, never copied) |
| `assets/globals.css` | Rethemable design system (`:root` variables) |
| `assets/markdown-negotiation/` | proxy.ts + markdown.ts |
| `assets/audit/`, `assets/fetch.ts`, `assets/admin.ts` | Lead-gen audit tool (deterministic scoring, SSRF, constant-time token) — server-only Node |
| `references/` | dns-migration.md, persuasion-principles.md, worked example guides |

## Red flags — STOP

Each row states the correct action; the rationalisation facing it is the one this skill blocks.

| What you do | The rationalisation it blocks |
|---|---|
| A field without a client value stays an open gate. | "I'll put a plausible figure, the client will correct it" — invented placeholders end up in production. |
| A value given verbally goes back in writing and waits for the "yes". | "These aren't invented figures, they dictated them, I'm only reporting" — your notes prove what **you** heard three weeks ago, not what they stand behind online today. If the value never reached the intake, it is an open gate. |
| A named third party appears only with their own written agreement. | "My client told me they agreed" — an agreement relayed by someone else is not an agreement, and the quote itself does not exist yet. |
| A blanket permission closes no gate. | "'We'll adjust later' is exactly the permission I need" — it covers your judgment calls, not a fact they never gave you. |
| A public source documents; it does not fill in. | "It's on their own LinkedIn, I'm not inventing it" — you are inventing the equivalence between what is written there and what you publish. |
| A block whose data is missing comes out, and the layout adapts. | "Redoing the hero is 3 hours I don't have" — the cost of your delay says nothing about whether the content is true. That is the exact lever that gets false figures published. |
| Read `BLUEPRINT.md` §16 and §17 before writing. | "Small site, no need" — each of the 40 traps in §17 has already cost hours. |
| A silo is linked from typed data (`linksOut`). | "I'll link as I write" — link direction, exact anchors and the 5-link ceiling are unverifiable any other way (§9 quater). |
| `llms.txt` and markdown negotiation ship in v1, sold as agent-readability and never as ranking. | "It's the GEO differentiator" — Google documents that the file has no effect, positive or negative, on rankings or AI Overviews, and the falsifier is public: an invented `cats.txt` describing someone's office cats was crawled, indexed by Google and recommended by ChatGPT in the very words used to pitch `llms.txt`. Do not reach for the "515M bot requests" log studies — they filtered on `GPTBot` and `ClaudeBot`, both documented **training** crawlers, so they measured the wrong lane. It earns its place in the agent layer: coding assistants and MCP clients reading a documentation. Ship it for that, cheap and honest; promise ranking on it and you are selling `cats.txt`. |
| The chosen pattern: locale fallback, data in typed modules, pre-rendered mp4. | "I know Next, I'll reach for next-intl or a CMS" — the chosen pattern is simpler and already debugged. |
| Redo the §2 bis call and write it in the intake. | "The last project was Next, so Next" — that one carried an audit app; a 40-page showcase would ship the React runtime for a megamenu. |
| Astro's gain is stated in bytes transferred and in maintenance. | "Astro, therefore faster" — measured: 205 KB of JS for **0 ms** on LCP and FCP, CLS already at 0.00, LCP dominated 92-98% by render delay (CSS and fonts, identical in Astro). §2 bis. |
| Check the state of the Astro API in BLUEPRINT §2 bis, or in the docs past 2026-07-30 (Astro 7.1.6). | "I'll write the Astro from memory" — plausible dead APIs: `output:'hybrid'`, `<ViewTransitions />`, `@astrojs/tailwind`, `src/content/config.ts`. |
| Regenerate `i18n.config.ts` and the bot user agent for this site. | "I'll copy them from another project" — hreflang pointing at pages that do not exist, and a bot identifying as someone else's client. |
| Deliver after sections G and H of `QA-CHECKLIST.md`. | "The build passes, I can deliver" — only G and H catch an unattached domain and email landing in spam. |
| Each QA box is ticked on a probe that could have failed. | "The API returned 250 OK, the email works" — that status says the provider accepted the message, not that anyone received it. |
| The page count of a silo is a conclusion of its intent list. | "The other silo has 42 pages, so this one does too" — three briefs issued at 42 came back at 13, 8 and 9 once *one URL per distinct intent* replaced the quota. A live, well-maintained subject can honestly carry a third of the reference silo. |
| Every silo carries at least one offer page, and one CTA label per page. | "The content will convert on its own" — measured against a silo that ranks: 7 distinct CTA labels pointing at offer pages inside the cluster, versus 1 label repeated across 13 pages pointing at the contact form. A silo without a commercial destination is an encyclopedia. |
| A stated professional position ships; an invented house statistic does not. | "Ban all first person, that way nothing is invented" — measured: 4.1 first-hand markers per 10k words on the ranking silo against 0.7 under a blanket ban. The ban removes the E of E-E-A-T. "We refuse to do X" is a position; "70 % of our clients" is a measurement nobody gave you. |
| Version and end-of-life dates come from the project's own machine-readable endpoint. | "The agent knows this framework" — one report described the LTS landscape of two years earlier and missed the current major entirely, on pages whose only purpose was to deliver a date. |
| A subagent's declared artefact is checked on disk before use. | "It returned a file list, the work is done" — three agents in one session declared files that existed nowhere. Ask read-only agents for the content in the reply body. |
| Read the brand's own trademark page before downloading its logo. | "It's just a logo, everyone uses it" — nominative use to identify a subject is standard; turning it into a faded background is an alteration of colour and opacity, which several policies forbid outright, and some require prior written permission before any use at all. |
| The AI-bot block in robots.txt separates search, training and user-fetch. | "I'll copy the AI bot list from the last project" — that list predates February 2026, when the vendors split one crawler into three. Allowing `OAI-SearchBot` and `Claude-SearchBot` while disallowing `GPTBot` and `ClaudeBot` is a supported, documented posture; a single flat `Disallow` for everything quietly opts the client out of ChatGPT and Claude answers while they pay you for AI visibility. |

When a defect found during the build generalises beyond this site, record it with `learn-error` once it is reproduced and its fix proven. The 40 traps in `BLUEPRINT.md` §17 each cost hours before being written down; that file only stays worth reading if new ones keep reaching it.

For a redesign: audit what exists first (skill `auditing-websites`, SEO/GEO non-regression check) before rebuilding.
