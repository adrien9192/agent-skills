

# SITE-BLUEPRINT — Premium B2B site generator (local SEO + GEO)

> **Purpose of this document**: let an agent (Claude Code / Codex) or a human **rebuild from scratch** a site equivalent to the reference site for **any client, in any industry**, by swapping one set of variables. The reference site (living canonical implementation) is the reference repo; this blueprint extracts from it the process, architecture, design, UX, code, SEO/GEO and traps.
>
> **How to use it**: 1) fill `INTAKE-CLIENT.md` with the client. 2) Hand this file + the filled intake to the agent. 3) The agent follows the **§16 Playbook** step by step. 4) Validate with `QA-CHECKLIST.md`. A clonable starter lives in `starter/`.

---

## 0. Type of site produced

A **premium B2B corporate/showcase site** for an agency or service provider, optimised for:
- **Conversion**: generate qualified enquiries (contact form, "first step" CTA).
- **Local SEO**: one page per city/territory (internal footer linking).
- **GEO / agent-readiness**: be readable and citable by AI (llms.txt, markdown negotiation, Content-Signal, rich JSON-LD).
- **Credibility**: distinctive design (no "AI slop"), real proof, human voice.

**100% data-driven** architecture: content is described in typed `lib/*.ts` files, and generic components generate every page. Adding an offer means adding an object, not a page.

> This principle is **framework-independent**. The reference implementation is Next.js, but everything in this blueprint (content architecture, SEO/GEO, silo, internal linking, traps) transposes to Astro. The choice is made in §2 bis, before the first line of code.

---

## 1. Variable system (to fill per client)

All client-specific content flows through these variables (see `INTAKE-CLIENT.md`). Notation `{{VARIABLE}}`.

| Variable | Typical value | Usage |
|---|---|---|
| `{{COMPANY}}` | the client's trading name | Brand name everywhere |
| `{{LEGAL_NAME}}` | registered name + legal form + share capital | Legal notice |
| `{{REG_IDS}}` | national company number / trade register / VAT id | Legal notice, JSON-LD |
| `{{ADDRESS}}` | registered postal address | LocalBusiness, legal |
| `{{CITY}}` / `{{REGION}}` | home city / region | LocalBusiness, local anchoring |
| `{{DOMAIN}}` | example.com | Canonical URLs, sitemap |
| `{{CONTACT_EMAIL}}` | hello@example.com | Form, legal, mailto |
| `{{FOUNDER}}` | the founder's full name | About page (Person), publication director |
| `{{SECTOR}}` | web agency | Positioning |
| `{{PILLARS}}` | 3 pillars (sites, e-commerce, automation) | Catalog (service tree) |
| `{{OFFERS}}` | 15 sub-offers | Catalog children |
| `{{CITIES}}` | 13 cities + 5 contact cities | Local pages + footer |
| `{{BRAND_COLORS}}` | violet, magenta, night, paper | `:root` of globals.css |
| `{{FONTS}}` | display + body (next/font) | layout.tsx |
| `{{CLIENTS}}` | ~21 logos | Carousel + reference grid |
| `{{PARTNERS}}` | WordPress, Shopify, … | Partners page |
| `{{VOICE}}` | B2B founder, formal register | All copy |
| `{{ESP}}` | Brevo (SMTP) | Form |
| `{{LANG}}` | fr (+ en secondary) | Site language(s) — drives §7 (style rules) and §5 bis |
| `{{JURISDICTION}}` | France | Applicable law — drives §11 (legal identifiers, supervisory authority) |
| `{{LOCAL_SLUG}}` | agence | Segment of local landings `/{{LOCAL_SLUG}}/{city}` (cabinet, restaurant, atelier…) |

---

## 2. Technical stack

**Invariants, whatever the framework**: strict TypeScript (no `any`), Tailwind v4, typed data in TS modules, Vercel deployment, Brevo email, GSAP + Lenis for the animation layer. **The framework itself is chosen in §2 bis.**

The table below describes the reference instance (Next.js). On an Astro project the Next/React rows drop out and the rest is identical.

| Piece | Version (reference instance) | Role |
|---|---|---|
| Next.js | 16.2.6 (App Router) | Framework, SSG, routes |
| React | 19.2.6 | UI |
| TypeScript | 6.x **strict** | Typing (no `any`) |
| Tailwind CSS | 4.3.0 (`@tailwindcss/postcss`) | Utility styles + custom design system |
| framer-motion | 12.x | Animations (1 `Reveal` component) |
| gsap | ^3.15 (ScrollTrigger + SplitText bundled since 3.13) | Premium animation layer (see §4 bis) |
| lenis | ^1.3 | Smooth scroll (singleton driven by gsap.ticker) |
| lucide-react | — | Icons |
| nodemailer | 8.x | Email over Brevo SMTP |
| Deployment | **Vercel** | Hosting + SSL + CDN |
| Email | **Brevo** (SMTP + API fallback) | Contact form |

`tsconfig`: `strict: true`, `moduleResolution: bundler`, `paths: { "@/*": ["./*"] }`, `jsx: react-jsx`.
npm scripts: `dev`, `build`, `start`, `lint` (eslint), `typecheck` (`tsc --noEmit`).

**Init a new project**:
```bash
npx create-next-app@latest <client> --ts --app --no-tailwind --eslint
cd <client>
npm i clsx framer-motion lucide-react nodemailer
npm i -D tailwindcss @tailwindcss/postcss @types/nodemailer
# postcss.config.mjs: { plugins: { "@tailwindcss/postcss": {} } }
# app/globals.css: @import "tailwindcss"; + the design system (see §4)
```
Simpler: **clone `starter/`** (already configured) and fill in the variables.

---

## 2 bis. Framework choice: Astro by default, Next.js if there is a server app

> Astro API verified against the official docs on **2026-07-30**, version **Astro 7.1.6** (released 2026-07-29). Unverified points are marked as such: do not fill them in from memory.

### The switching criterion

The profile this blueprint targets (30 to 50 content pages, 1 to 2 forms, local SEO + GEO) is **a content site**. On that profile **Astro is the default**: it ships no JS per page except where you explicitly ask for it, whereas a Next site ships the React runtime on every page even when 95% of them are static HTML.

Switch to **Next.js** only if **at least two** of these conditions hold:

| Condition | Why it decides |
|---|---|
| The lead magnet is a **real app** (scoring engine, admin area, queue, storage, webhooks) | This is no longer a showcase with a form, it is an application with a site in front. See §9 ter. |
| **Heavy React reuse** (existing design system, shadcn, stateful UI on many pages) | Porting a React DS to Astro costs more than the bundle tax it saves. |
| Need for **Server Components / streaming / PPR** | Astro has no equivalent. |
| **High-cardinality dynamic** content with aggressive ISR | Doable in Astro, but Next stays more direct. |

One condition alone is not enough: a contact form, markdown negotiation or three API routes sit perfectly well in Astro endpoints.

### ⚠️ What Astro actually delivers (and what it does not)

Astro's gain on a content site is **certain in bytes, uncertain in Core Web Vitals**. Confusion not to propagate, measured on 2026-07-30 on the reference site:

| What is acquired | What is NOT |
|---|---|
| ~166 KB less brotli JS per page (measured 2026-07-30 in-browser on a pure content page: **219 KB wire / 706 KB raw served in total**, of which 69 KB `react-dom`) | **Better LCP.** Same page: Chrome render-blocking analysis = 0 ms saved on FCP and LCP. The JS is off the critical path, it does not delay paint |
| Less data consumed by the visitor, less bandwidth served | **Better CLS.** It was already 0.00 |
| Removal of the manual i18n layer (§5 bis): less maintenance | **A ranking gain.** CWV are a signal with no published weight, and Google states relevance comes first |
| Less CPU and battery on low-end mobile | **Demonstrated INP headroom**: a load trace does not measure INP. Without field data it stays unmeasured |

On this site, what weighed on mobile LCP was not the JS but **render delay** (86 to 96% of LCP), i.e. CSS and fonts, identical in both frameworks.

⚠️ **Break the weight down before attributing it to Astro.** Of the 219 KB wire measured, Astro removes only 166:

| Share of JS served | wire | Does Astro remove it? |
|---|---|---|
| React + Next runtime | ~166 KB | **yes** |
| Application animation layer (GSAP + ScrollTrigger + SplitText + Lenis) | ~52 KB | **no** — application dependency, identical in both frameworks |
| `core-js` polyfill | *(38 KB)* | moot: carries the `noModule` attribute, **never downloaded by a modern browser** |

Method corollary: measure JS in the browser (`performance.getEntriesByType('resource')` after scrolling), never by grepping `<script src>` out of the HTML — that misses deferred chunks and counts `noModule` chunks.

⚠️ **The trap that cancels the gain: the shell component.** An interactive header (megamenu, mobile drawer, focus trap) is present on every page. Kept in React with `client:load`, it ships `react` + `react-dom` again on every page and **Astro's gain drops to zero**. The condition for the gain is therefore not "choose Astro", it is **"write the shell without a UI framework"** — work that is feasible while staying on Next, and which then delivers the same gain without rewriting the pages.

**Rule**: choose Astro for architectural simplicity, transferred weight and maintenance. Never by promising a speed gain that has not been measured. Measurement method: skill `auditing-websites`, `METHODE-AUDIT.md` §7.

**Reference case**: two conditions met (audit tool with a scoring engine, token-gated admin routes, Supabase storage, generation worker; plus 11 client components including the whole audit funnel). Next.js is justified **on that site**. It is not the default on the next one.

⚠️ Generalisation trap: the reference site is on Next because it carries an app, not because Next would be the right default for a showcase. Do not copy the choice, redo the arbitration.

### Equivalence table (blueprint patterns → Astro 7)

Everything below is **verified**. This is what makes the blueprint portable: no structural pattern depends on Next.

| Blueprint pattern | Next.js (App Router) | Astro 7 |
|---|---|---|
| **Typed data → pages** | typed `lib/*.ts` imported by a generic component | `defineCollection({ loader: async () => [...] })` in `src/content.config.ts`: **a loader function feeds a collection from a hard TS module**, with no markdown file. Read via `getCollection()` / `getEntry()`. ⚠️ **Every entry must carry a unique `id` field** (or return an object whose keys are the ids) — otherwise `ContentLoaderInvalidDataError` at build. Data shaped `{ slug, … }` must therefore be remapped: `data.map((e) => ({ id: e.slug, ...e }))`. Re-verified 2026-07-30 (`reference/content-loader-reference.mdx`). |
| **Generated routes** | `generateStaticParams()` | `getStaticPaths()` → `{ params, props }[]` |
| **Exclude a slug from generated routes** | filter in `generateStaticParams` | do not return it from `getStaticPaths` (no dedicated skip API) |
| **Static route priority > dynamic** | implicit | **documented**: static routes without a parameter come before dynamic routes. Trap 37 applies identically. |
| **No route outside the list** | `dynamicParams = false` | default behaviour in `output: 'static'` (`getStaticPaths` is authoritative) |
| **Rendering `Block[]`** | `article-body.tsx` (React) | equivalent `.astro` component, same data contract |
| **API routes** | `app/api/x/route.ts` | `src/pages/api/x.ts`, `export const POST: APIRoute`, native `Response`. `export const prerender = false` required in `static` mode. |
| **Markdown negotiation (`Accept: text/markdown`)** | `proxy.ts` + `NextResponse.rewrite` + `x-md-path` header | `src/middleware.ts` + `context.rewrite(new Request('/api/markdown', { headers: { 'x-md-path': ctx.url.pathname } }))`. ⚠️ **`vercel({ middlewareMode: 'edge' })` is required**: by default Astro middleware does NOT run for prerendered pages. The adapter docs describe this mode as running middleware "for all requests, including static assets, prerendered pages, and on-demand rendered pages". Verified 2026-07-30. Without this option, markdown negotiation is dead on a static site. |
| **Bilingual: routing by locale** | hand-assembled (`lib/i18n.ts`, `/en` prefix, locale resolution) | **native**: `i18n: { defaultLocale, locales, routing: { prefixDefaultLocale: false, fallbackType: 'rewrite' }, fallback: { en: 'fr' } }`. Astro removes this plumbing. |
| **Bilingual: FIELD-level fallback** | `lib/en/catalog.ts`: `title: t.title ?? p.title`, 14 fields per entity, nested for children | **NOT native.** Astro's `i18n.fallback` is a **route** fallback (missing page → page in the fallback locale), not a **field** one. When every EN page exists and only some strings are translated, the field-by-field merge **still has to be written**, inside the content collection loader. Verified against the docs 2026-07-30. |
| **Static per-page `lastmod`** | `app/sitemap.ts` | `@astrojs/sitemap` + `serialize(item)` (the only place to set a per-page `lastmod`) |
| **Inline JSON-LD** | `<script dangerouslySetInnerHTML>` | `<script type="application/ld+json" set:html={JSON.stringify(data)} />`. `set:html` escapes nothing: never inject raw user text there. |
| **Targeted client JS** | `'use client'` (component granularity) | `client:load` / `client:idle` / `client:visible` / `client:only="react"` directives, or a plain `<script>` inside the `.astro` (bundled and typed by default; `is:inline` to opt out) |
| **Images** | `next/image` | `astro:assets`: `<Image>` / `<Picture>`, `image.domains` + `image.remotePatterns` for remote |
| **Tailwind v4** | `@tailwindcss/postcss` | Vite plugin `@tailwindcss/vite` via `npx astro add tailwind`, then `@import "tailwindcss";` in a global CSS. **`@astrojs/tailwind` is deprecated.** |
| **Vercel deployment** | native | `import vercel from '@astrojs/vercel'` (single import), `isr` and `imageService` options |
| **Page transitions** | — | `<ClientRouter />` from `astro:transitions` |

**Vercel adapter options verified 2026-07-30** — three keys decide whether the blueprint patterns port:

```js
adapter: vercel({
  middlewareMode: 'edge',  // required for middleware to run on PRERENDERED pages
  staticHeaders: true,     // writes headers (including CSP) into vercel.json for prerendered pages
  isr: true,               // or { bypassToken, exclude }
})
```

**Forms: beware the Actions trap.** Astro Actions (`defineAction`, `astro:actions`) are **server-only and CANNOT run on a prerendered page**. On an `output: 'static'` site a form therefore goes through an endpoint (`src/pages/api/x.ts` + `export const prerender = false`), not an Action. Verified 2026-07-30.

**Unverified** (confirm before coding, do NOT write from memory):
- **Font loading**: the Astro equivalent of `next/font` (self-hosting, `font-display`, preloading) has not been verified. ⚠️ This is the dominant measured LCP lever (render delay = 86-96% of LCP): a regression here cancels the whole benefit.
- **Security headers and CSP**: `staticHeaders: true` is the confirmed lead on the adapter side, but **the exact rendering of the strict CSP from §8 has not been tested**. The CSP is **enforceable**: verify it before shipping, not after.
- **`imageService`**: key not found in the adapter docs (image optimisation is described as built in). To confirm if the site serves remote images — moot if everything is local.
- Sub-imports `@astrojs/vercel/static` and `/serverless`: ambiguous status in the docs. Use the single import.

### Init an Astro project

```bash
npm create astro@latest <client> -- --template minimal --typescript strict
cd <client>
npx astro add tailwind vercel sitemap
```

Then take the §4 design system as is (`@import "tailwindcss";` + the `:root` tokens), it depends on no framework.

### Astro traps (dead APIs not to write from memory)

Astro moves fast and models carry stale versions in mind. Verified as of 2026-07-30:

| What a model writes spontaneously | Astro 7 reality |
|---|---|
| `output: 'hybrid'` | **removed** (v5), merged into `'static'` |
| `<ViewTransitions />` | **renamed `<ClientRouter />`** (v5) |
| `@astrojs/tailwind` | **deprecated**, replaced by `@tailwindcss/vite` |
| `src/content/config.ts` | current form: **`src/content.config.ts`** |
| `@astrojs/db` | **removed** in v7 |
| `experimental: { rustCompiler, cache, ... }` | **stable/default** in v7, stop declaring them |

Two v7 changes to know because they break silently: the compiler moved to **Rust** (stricter, malformed HTML that used to pass now fails the build) and the remark/rehype Markdown pipeline was replaced by **Sätteri** (keeping the old one requires explicit `@astrojs/markdown-remark` + `unified()`).

---

## 3. Project structure (tree)

*Tree of the Next.js instance. Astro mapping at the end of the section.*

```
app/
  layout.tsx              # fonts, <head>, metadata, JSON-LD Organization+WebSite, Header/Footer/CookieBanner
  page.tsx                # homepage = assembly of sections (site-sections.tsx)
  globals.css             # FULL DESIGN SYSTEM (tokens + classes)
  [slug]/page.tsx         # data-driven "legacy"/SEO pages (lib/legacy) — dynamicParams=false
  <pillar>/page.tsx       # pillar hub (pillar-page component)
  <pillar>/[slug]/page.tsx# offer sub-page (offer-page component)
  agence/[city]/page.tsx  # local landing: city photo + form AT THE TOP
  blog/page.tsx           # blog index
  blog/[...slug]/page.tsx # catch-all: 1 segment (articles) OR 4 segments (dated archives)
  contact/page.tsx        # contact page + form
  a-propos/ approche/ realisations/ partenaires/   # editorial pages
  mentions-legales/page.tsx
  politique-confidentialite/page.tsx
  api/contact/route.ts    # Brevo endpoint (POST)
  api/markdown/route.ts   # markdown rendering of pages (agent negotiation)
  sitemap.ts robots.txt/route.ts llms.txt/route.ts llms-full.txt/route.ts
  manifest.ts opengraph-image.tsx apple-icon.tsx
lib/
  catalog.ts        # SERVICES SOURCE OF TRUTH: pillars[] + children (offers)
  site.ts           # site{}, nav, footerCities, proofPoints, faqs, values, clients, tech…
  content/<pillar>.ts # long-form content (~1200 words) per hub/offer (index key = hub)
  offer-content.ts  # aggregates content/*
  blog.ts           # Block/Article type + articles[] + formatDate/getArticle
  legacy/           # data-driven SEO pages: 1 file/page (LegacyPage) + auto-generated index
  legacy-blog/      # dated blog archives (LegacyBlogPost) + auto-generated index
  villes.ts         # local pages /agence/{city} (Ville[] + getVille)
  guides.ts         # GEO data (comparisons, costs, definitions, extended FAQ)
  markdown.ts       # builds the markdown of pages for agents
components/
  header.tsx footer.tsx logo.tsx          # shell (data-driven)
  site-sections.tsx                       # every homepage section
  pillar-page.tsx offer-page.tsx          # data-driven page templates
  contact-form.tsx                        # form (prop `ville?`)
  article-body.tsx                        # renders Block[] (p/h2/h3/ul/table/faq)
  cookie-banner.tsx reveal.tsx
proxy.ts            # middleware: noindex on *.vercel.app + markdown negotiation (Accept: text/markdown)
next.config.ts      # CSP, security headers, RFC 8288 Link headers, 301 redirects
public/
  brand/ logos/ clients/ partners/ villes/ generated/   # assets
scripts/
  gen-images.cjs    # image generation pipeline (Playwright + ChatGPT) — optional
  audit-local.mjs   # accessibility audit (axe/playwright)
docs/               # this blueprint, the intake, the checklist, dns-migration
```

**Astro mapping** (same split, different locations):

| Next.js | Astro 7 |
|---|---|
| `app/<route>/page.tsx` | `src/pages/<route>.astro` |
| `app/[slug]/page.tsx` | `src/pages/[slug].astro` |
| `app/layout.tsx` | `src/layouts/Base.astro` |
| `app/globals.css` | `src/styles/global.css` (imported by the layout) |
| `app/api/x/route.ts` | `src/pages/api/x.ts` |
| `app/sitemap.ts` | `@astrojs/sitemap` integration (`serialize`) |
| `app/robots.txt/route.ts`, `llms.txt/route.ts` | `src/pages/robots.txt.ts`, `src/pages/llms.txt.ts` |
| `proxy.ts` | `src/middleware.ts` |
| `next.config.ts` | `astro.config.mjs` (+ `vercel.json` for headers, see §2 bis unverified) |
| `lib/*.ts` (typed data) | `src/data/*.ts` + `src/content.config.ts` (loader function) |
| `components/*.tsx` | `src/components/*.astro` (+ `.tsx` only for islands) |
| `public/` | `public/` (identical) |

---

## 4. Design system (reusable as is, rethemable)

Everything lives in `app/globals.css` (copy verbatim). **To retheme a brand: change the `:root` variables.**

### Tokens (`:root`)
```
--ink #0f172a  --ink-2 #111827  --muted #475569
--paper #f7f4ee  --paper2 #fffaf2  --line #e6d9c9     (cream background + hairlines)
--violet #7c3aed  --pink #be185d  --night #08111f      (brand accents + dark)
--green #166534  --gold #b47a2c  --terracotta #9d563f  --cyan #0ea5e9
--radius 30px
```
> **Re-theming**: swap `--violet`/`--pink` for the brand colours, and `--night`/`--paper`/`--paper2` for the mood. Everything else (button gradients, eyebrow, grid-bg) inherits from them.

### Typography
- `.h1/.h2/.h3`: fluid `clamp()` sizes, tight negative `letter-spacing`, `text-wrap: balance`. (Successive overrides at the bottom of the file = final values after visual review.)
- `.lead`: subtitles. `.eyebrow`: uppercase kicker + gradient dot.
- Fonts via `next/font` in layout.tsx → CSS variables `--font-display` / `--font-body`. `.font-display` applies the display face.

### CSS components (classes)
| Class | Role |
|---|---|
| `.container` | centred 1200px max width |
| `.section` | fluid vertical rhythm + `content-visibility:auto` (perf) |
| `.btn` `.btn-primary` `.btn-secondary` `.cta-pill` | buttons (dark gradient / glass / light pill) |
| `.card` `.dark-card` | cards (light / dark) with hover lift |
| `.grid-bg` | cream background + grid + violet/magenta halos (hero) |
| `.eyebrow` | section label |
| `.badge` | pill |
| `.premium-link` | gradient-underlined link |
| `.kinetic-panel` | animated sheen on hover |
| `.section-heading` | 2-column section title (sticky eyebrow) |
| `.compact-card` `.horizontal-card` `.rail-item` | card variants |
| `.stack-marquee` + `.stack-pill` / `.client-logo-tile` | carousels (tech, client logos) |
| `.orbit-field` `.hero-visual` `.flow-line` `.ai-node` … | hero animations (SVG hub) |
| `.skip-link` `.focusable` | accessibility (skip nav, visible focus) |
| `.noise` | light global grain (on `<body>`) |

### Design rules (anti AI-slop)
- Cream palette + 1 vivid accent + deep dark; thin `--line` hairlines everywhere.
- Very rounded corners (`--radius` 30px), soft long shadows, subtle gradients.
- Micro-interactions: hover lift, `kinetic-panel` sheen, scroll reveal.
- **Accessibility**: `prefers-reduced-motion` disables every animation; visible focus; skip-link; AA contrast.
- **Tailwind v4 trap**: `a{color:inherit}` MUST live in `@layer base` (otherwise it beats `text-white` utilities on `<a>`).

---

## 4 bis. GSAP + Lenis animation layer (portable, 2 files)

Premium animation engine added after v1 of the blueprint. Fits in **2 files copied as is**: `components/motion/engine.ts` (pure logic, zero React/Next import) + `components/motion/motion-provider.tsx` (client wrapper, dynamic import).

### Integration
1. `npm i gsap lenis` (gsap ≥ 3.13 mandatory: ScrollTrigger and SplitText are bundled free).
2. Copy the 2 files into `components/motion/`.
3. Mount `<MotionProvider />` right before `</body>` in **every root layout** (both layouts if bilingual §5 bis — stateless component, duplication is safe).
4. Keep the GSAP/Lenis import dynamic (`import('./engine')` inside a useEffect): never import it statically (initial bundle).

### Expected DOM contract
| Element | Effect |
|---|---|
| `id="main-content"` on the layout's children container | page transition fade (never on the first SSR load) |
| first `h1` inside `main`/`#main-content` | word-by-word split + auto reveal (SplitText, aria preserved) |
| `.btn-primary` / `.cta-pill` / `[data-magnetic]` | magnetic CTAs (desktop `pointer:fine` only) |
| `.scroll-reveal` | scroll reveal (ScrollTrigger batch) |
| `data-counter` | animated counter (preserves prefix/suffix/locale decimals) |
| `data-stagger` | children cascade on viewport entry |
| `data-parallax="0.2"` | scrubbed vertical drift (speed ratio) |
| `data-tilt` | light 3D tilt on hover (fine pointer) |
| `data-split` | force word-by-word split outside h1 |
| `data-wipe` | clip-path reveal |
| `data-marquee="30"` (+ `data-marquee-reverse`) | infinite horizontal loop, velocity-sensitive |

### Guardrails (NON-negotiable)
- `prefers-reduced-motion` → the engine does not initialise at all + kills autoplay of `data-explainer` videos. Provide the pure-CSS fallback (content visible without JS).
- `navigator.webdriver` → engine disabled (deterministic QA/Axe/audit-local captures).
- ⚠️ **Both tests precede the engine's `import()`, never sit inside `init()`.** `engine.ts` calls `gsap.registerPlugin` at module level: the import alone starts the rAF ticker and downloads the chunk. An `if (reduced || navigator.webdriver) return` placed in the init function arrives too late. Measured in the "disabled" state before the fix (2026-07-30): **620 rAF calls over 5 s of idle and 140 KB downloaded for zero animation played**. General rule: the guardrail of a module with top-level side effects goes before its import, not inside it.
- Mandatory CSS: `.gsap-motion .scroll-reveal{animation:none!important}` (the engine sets `html.gsap-motion`) otherwise **double animation** with the CSS fallback.

### Specific traps
- `gsap.context()` does NOT track SplitText instances → collect them and `revert()` manually on cleanup (otherwise leftover spans after navigation).
- Lenis = **module singleton** driven by `gsap.ticker`: never recreated on navigation, no parallel rAF.
- Selectors `.btn-primary`/`.cta-pill`/`#main-content` = conventions of THIS design system: adapt them if the target site names things differently (otherwise silent no-op).
- Retuning per brand: EASE/duration/distance constants at the top of `engine.ts`.

---

## 5. Content architecture (data-driven)

### 5.1 Services — `lib/catalog.ts` (single source)
Types `Pillar` (hub) and `Offer` (child). A pillar has: `slug, title, href, icon (lucide), color, logo, visual, metric, keyword/volume/kd (SEO), tagline, intro, problem, result, benefits[], deliverables[], uses[], definition, faq[], children: Offer[]`. `published` (on the offer) drives phase 1 / phase 2 visibility.
- `lib/site.ts` does `export const services = pillars` (homepage/footer compat).
- `publishedOffers` = published offers (sitemap).

### 5.2 Long-form content — `lib/content/<pillar>.ts`
~1200 words/page as `Block[]` (see 5.4). Key `index` = the pillar hub, other keys = offer slugs. Aggregated by `lib/offer-content.ts`, rendered by `components/article-body.tsx`.

### 5.3 Local pages — `lib/villes.ts`
`interface Ville { slug, name, region, photo, photoAlt, metaTitle, metaDescription, lead, body[], prep? }`. Rendered by `app/agence/[ville]/page.tsx` (photo + **form at the top**). `prep` handles the correct preposition where the language needs one (city vs department: "à Lyon" but "en Vendée").

### 5.4 Blog + archives — `lib/blog.ts` / `lib/legacy-blog/`
`type Block = {type:'p'|'h2'|'h3'} | {type:'ul',items} | {type:'table',headers,rows} | {type:'faq',items:{q,a}}`. `Article` (rich: cover, tag, date, readingTime, related[]). Dated archives = `LegacyBlogPost { path:'YYYY/MM/DD/slug', slug, date, tag, metaTitle, metaDescription, h1, excerpt, blocks[] }` rendered by the `app/blog/[...slug]` catch-all.

### 5.5 "Legacy" SEO pages — `lib/legacy/`

Copy taken over from an old site is extracted with `defuddle parse <url> --md`, one URL per line from the old `sitemap.xml`. It is never retyped or paraphrased: that copy carries client facts, and rewriting it reopens a gate that was closed.
`interface LegacyPage { slug, url, metaTitle, metaDescription, h1, blocks: ({type:'p'|'h2'|'h3'} | {type:'ul',items})[] }`. 1 file per page, **index auto-generated** by scanning the folder (see §13). Rendered by `app/[slug]/page.tsx` (`dynamicParams=false`). Serves keyword pages and **city × speciality pages** (e.g. `agence-{speciality}-{city}`).

> **Regenerate an auto index** (legacy / legacy-blog) after adding files:
> ```bash
> node -e "const fs=require('fs');const d='lib/legacy';const f=fs.readdirSync(d).filter(x=>x.endsWith('.ts')&&!['types.ts','index.ts'].includes(x)).map(x=>x.replace('.ts','')).sort();fs.writeFileSync(d+'/index.ts',\"import type { LegacyPage } from './types';\n\"+f.map((s,i)=>'import p'+i+\" from './\"+s+\"';\").join('\n')+\"\n\nexport const legacyPages: LegacyPage[] = [\"+f.map((s,i)=>'p'+i).join(', ')+\"];\n\nexport function getLegacyPage(slug: string) { return legacyPages.find((p) => p.slug === slug); }\n\");console.log(f.length+' pages')"
> ```
> ⚠️ Always type the getter `(slug: string)` or `tsc` breaks (`noImplicitAny`).

---

## 5 bis. Bilingual (default language + secondary language) — optional

Pattern proven with FR (canonical) + EN (`/en`), generalisable to any language pair.

> **In Astro, do not hand-code this.** i18n routing and fallback are native: `i18n: { defaultLocale: 'fr', locales: ['fr','en'], routing: { prefixDefaultLocale: false, fallbackType: 'rewrite' }, fallback: { en: 'fr' } }`. An untranslated page serves the default-language content with no 404 and no merge code. All the merge machinery below (`lib/en/*`, `t.field ?? frItem.field`) is **Next-specific**; in Astro it reduces to per-locale translation files. The fragile array-index fallback disappears with it.

- **No root `app/layout.tsx`.** 2 complete root layouts via route groups: `app/(site)/layout.tsx` (default `lang`, group invisible in the URL) + `app/en/layout.tsx` (real `/en` segment). Each renders its own `<html>/<body>`, metadata, JSON-LD, Header/Footer. Single files (sitemap.ts, robots, manifest, `api/`, OG image) stay at the root of `app/` and handle multi-locale internally.
- ⚠️ Any file inheriting Next's default layout (e.g. root `app/not-found.tsx`) must render ONLY content, never `<html>/<body>` (duplicate tags at build).
- **Secondary language = fallback to the default language.** Structure (slugs, hrefs, icons, order) lives ONLY in `lib/*` (default language). `lib/en/*` = mirror folders containing ONLY text, merged by `.map()` + `t.field ?? frItem.field` (by slug when one exists, by array index otherwise — fragile to reordering, comment it). An untranslated field silently shows the default language: progressive translation without ever breaking the build.
- **Centralised locale-aware resolvers**: never access FR/EN data directly from pages. `lib/services.ts` (catalog), `lib/marketing.ts` (content with no stable slug), `lib/i18n.ts` **dependency-free** (locales, BCP47 mapping, `localizeHref()`, `alternates()` reciprocal canonical+hreflang with x-default to the default language, `hasEnVersion(path)` allowlist for the language switcher and hreflang).
- ⚠️ **`ogMeta()` mandatory**: Next REPLACES (does not merge) the layout's `openGraph` object as soon as a page declares one → the default og:image silently disappears. Single helper `ogMeta(title, description, path, locale, image?)` that systematically redeclares `type/locale/url/images` + the `twitter` block. No page writes `openGraph:{...}` by hand.
- **Single-language case (the most frequent)**: keep ONE root layout `app/(site)/layout.tsx` (route group, ready to host a 2nd language later); `lib/i18n.ts` stays useful for `ogMeta()` with `LOCALES = ['fr']`. Do not create `lib/en/*` or hreflang until a translation exists.
- **Changing the language pair (e.g. FR→ES)**: everything derives from `LOCALES`/`HREFLANG`/`OG_LOCALE` in the i18n config — no `/en` or `en-US` literal scattered around. The allowlist of translated pages is PER-SITE data, to be regenerated (never copied from another project).

---

## 6. Page & route inventory

| Route | Source | Content |
|---|---|---|
| `/` | page.tsx + site-sections | Hero, Stats, ClientLogos, PainPoints, ExpertiseShowcase, WhyUs, OperatingModel, Process, MissionTypes, LogoCloud, Resources, About, FAQ, CTA |
| `/<pillar>` | pillar-page | Hub: tagline, intro, long-form content, offer list, FAQ, CTA |
| `/<pillar>/<offer>` | offer-page | Offer: hero (+ visual), visible breadcrumb, long-form content, FAQ, CTA |
| `/agence/<city>` | agence/[ville] | Local landing: city photo + **form at the top** + body + internal links |
| `/<slug>` | [slug] (legacy) | SEO/keyword pages + city×speciality pages |
| `/blog` `/blog/<slug>` `/blog/YYYY/MM/DD/<slug>` | blog/[...slug] | Articles + dated archives |
| `/contact` | contact | Form + reassurance |
| `/a-propos` `/approche` `/realisations` `/partenaires` | dedicated pages | Person schema, method, references, partners |
| `/mentions-legales` `/politique-confidentialite` | legal | No image, aligned with the company |
| `/sitemap.xml` `/robots.txt` `/llms.txt` `/llms-full.txt` `/manifest.webmanifest` | routes | SEO/GEO infra |
| `/glossaire` `/glossaire/<term>` *(optional, see §9 bis)* | lib/glossary.ts | Data-driven trade glossary (non-brand acquisition) |
| `/tarifs` *(optional, see §9 bis)* | catalog data | Public price ranges per offer |
| `/avis` *(optional, see §9 bis)* | site.ts data | Named, quantified testimonials |

---

## 7. Editorial voice & humanizer (CRITICAL)

Voice = **{{VOICE}}** (reference site: B2B founder, formal register, direct, factual). All copy goes through the **humanizer** skill.

> Rules written for a French-language site. Another `{{LANG}}` → transpose the equivalents (fixed register, banned typography, language-specific loanword glossary) via the writing guide; the principles (anti-invention, anti-slop, persuasion) are language-independent.

Hard rules:
- **No em dash — nor en dash –.** Ranges: "5 000 à 20 000 euros".
- **No typographic quotes as JS delimiters** (`'…'` U+2018/2019 → syntax error). In `lib/legacy/*` files (strings delimited by `"`), use **straight apostrophes `'`**.
- **French WITH accents** everywhere in h1/h2/h3/body (agents often produce unaccented French → always do another pass). The preposition "à" always accented ("à Lyon", never "a Lyon").
- **No systematic rule of three**, no negative parallelism ("not only… but"), no hollow promo ("véritable", "incontournable", "au cœur de", "s'impose comme"), no filler present participles, no generic conclusion.
- **ZERO loanwords** where the target language has its own: store→boutique, checkout→parcours de paiement, custom→sur mesure, launch→mise en ligne, features→fonctionnalités, logistics→logistique, roadmap→feuille de route, online→en ligne, etc.
- **No fake proof**: never an invented statistic, quote or client result (E-E-A-T). Reword real proof instead.
- **No competing AI model names** hard-coded (GPT-4o, Claude, OpenAI, Anthropic) in commercial copy → "AI agents" / "language model".

### Persuasion principles (applied to CTAs/hooks — see references/persuasion-principles.md)
1. **"Because"**: justify every CTA/promise with a reason.
2. **Specific social proof** (sector/city) beats generic — without inventing.
3. **Loss framing over gain**: say what the visitor risks losing.
4. **Progressive commitment**: the CTA is a low-friction first step ("first opinion", "short audit").
5. **Quiet authority**: measured tone, zero hype.

---

## 8. SEO / GEO (agent-readiness)

### Metadata
- `metadata` per page (title, description ≤ 160, `alternates.canonical`, openGraph). `metaTitle` may stay unaccented; **h1/body accented**.
- **Title budget — measure the RENDERED title, brand template included.** Google truncates the rendered title around **60 characters**. A ` | {{BRAND}}` template of 13 characters therefore caps source `metaTitle` at **≤ 47**. The source title **never** carries the brand: pages imported from an old CMS often contain it and produce "- Brand | Brand" plus titles > 70. Measured on the reference site (Search Console, 2026-07-31): **40 titles out of 92 ranked pages exceeded 60 rendered characters, 29 of them on pages ranking 1 to 20**; 103 titles fixed. Check by script on the build, never by eye.
- **`og:url` on every page.** An OpenGraph helper that takes no path cannot set it: verify page by page, never by sampling (36 pages shipped without `og:url` on the reference site, 2026-07-30). Next **REPLACES** the layout's `openGraph` object as soon as a page declares one — so `og:image` must be repeated in every page. One OG helper in the project, and its path parameter is mandatory.
- Dynamic OG image (`app/opengraph-image.tsx`, next/og) + apple-icon + manifest (PWA, 192/512 icons).

### JSON-LD (schema.org) per page type
| Page | Schemas |
|---|---|
| layout (global) | `Organization` + `ProfessionalService` (+ `LocalBusiness` + geo), `WebSite` |
| pillar / offer | `Service`, `BreadcrumbList`, `FAQPage`, `OfferCatalog` |
| city | `Service` (areaServed City), `BreadcrumbList` |
| blog | `BlogPosting`, `BreadcrumbList`, `FAQPage` (if FAQ) |
| about | `Person` (founder) |
| glossary (§9 bis) | `DefinedTermSet` (hub) + `DefinedTerm` (entry) + `FAQPage` — **validate with the Rich Results Test** (the analysed competitor had a broken DefinedTerm = 0 value) |
| reviews (§9 bis) | `Review`/`AggregateRating` **ONLY if real, verifiable ratings** (never fabricated) |
| semantic silo (§9 quater) | `Article` **or** `Service` (depending on the page's role) + `BreadcrumbList` + `FAQPage` if there is a FAQ block — `author`/`publisher`/`provider` point to the same Organization `@id` as the layout |

⚠️ `inLanguage` exists only on `CreativeWork` (WebPage, FAQPage, BlogPosting) and `WebSite` — NEVER on `Service`, `Organization` or `LocalBusiness` (UNKNOWN_FIELD at validator.schema.org, seen 2026-07-18 on the reference site's offer/pillar pages).

⚠️ Match the `LocalBusiness` subtype to the client's real trade — engines (and AI) match on the most precise type: `AccountingService`, `LegalService`, `Restaurant`, `HomeAndConstructionBusiness`/`GeneralContractor`, `MedicalBusiness`, `RealEstateAgent`… Look for the subtype on schema.org before falling back to generic `ProfessionalService`.

### Freshness & authorship (E-E-A-T, competitive lessons 2026-07)
- **VISIBLE update date** in the body of money pages ("Updated on DD/MM/YYYY") + `dateModified` in the JSON-LD — the signal must exist for the human AND the machine, not only in meta.
- **Author box** on every article: photo + name + role + link to `/a-propos`. The JSON-LD `author` references the **same Person `@id`** as the founder (not a duplicated Person object).
- **Sourced citable facts** in the prose of pillar pages (dated statistics, named institutions) = material AI engines cite. Never an invented stat.
- The `Person` node carries `sameAs` to the founder's **personal LinkedIn** (the trusted entity is a person, not a logo); the Organization keeps the company LinkedIn.

### Internal linking (enforceable floor)
- **Minimum 5 UNIQUE internal links inside `<main>`** on every indexable page. Count **unique** links: two `<a>` to the same URL count as one (a template "guaranteeing 5 links" delivers 4 real ones as soon as it repeats a destination).
- Descriptive anchors (never "learn more"/"click here"). The check is done by **crawling the sitemap + counting unique `href` in `<main>`**, never by eye.
- Exceptions allowed, but **named and documented** (otherwise they resurface as a finding at every audit): pure conversion landings inside a silo (see §9 quater).

### Scripted checks to run AFTER the build (the build does not produce them)

Three measurements no `tsc`/`eslint`/`build` catches, and that a third-party SEO tool hides. Wire them as npm scripts from v1.

- **`check:orphans` — orphan pages.** Count inbound links across **all rendered HTML**, after build. Two levels: no inbound link = **failure**; page linked only from the menu or footer = **warning**. Trap: third-party tools count **sitewide** links, so a page present in the menu shows hundreds of inbound links for **zero editorial link** (8 pages in that case on the reference site, 195 inbound announced each). Keep a deliberate, written allowlist (technical routes, report pages).
- **`check:duplication` — duplication across a city/speciality page cluster.** Measure per cluster, **city and demonym neutralised**: body Jaccard, title Jaccard, **boilerplate rate** (blocks appearing identically in ≥ 3 pages) and worst pair. ⚠️ **Pairwise averaging dilutes boilerplate**: one cluster showed 3.5% mean body Jaccard for **17.7% of blocks copied into ≥ 3 pages** (identical service list from city to city). Count both. Enforceable thresholds: body 15%, titles 15%, boilerplate 5%, worst pair 20%, `exit 1` on breach. Re-run after any city page creation.
- **Title budget** (see §8 Metadata): measure the rendered title, template included, across every page of the build.

These three checks run **after** `npm run build`, never before: they read the produced HTML.

### Sitemap / robots / GEO
- `app/sitemap.ts`: static `LAST_UPDATED` dates (do NOT use `new Date()` = build churn). Includes pillars, published offers, nav, contact, articles, **legacy pages, legacy blog, cities**, legal.
- `app/robots.txt/route.ts`: `Allow: /` + **Content-Signal** header (`search=yes, ai-input=yes, ai-train=no`).
- `app/llms.txt` (concise) + `app/llms-full.txt` (exhaustive: services, method, definitions, comparisons, FAQ, **local pages, blog archives, cities**). They iterate over the same data → always up to date.
- **Markdown negotiation** (`proxy.ts`): `Accept: text/markdown` → rewrite to `app/api/markdown` (pass the path via the `x-md-path` header, since a rewrite sees the original URL).
- **RFC 8288 Link headers** (`next.config.ts`): announce llms.txt / llms-full.txt.
- **301s** for old URLs (`next.config.ts redirects`); **noindex** on `*.vercel.app` only (`proxy.ts`) so the preview subdomain is not indexed.

### Security (next.config.ts headers)
CSP (`default-src 'self'`, `script-src 'self' 'unsafe-inline'`, `img-src 'self' data: blob: https:`…), HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, X-Frame-Options.

---

## 9. Local SEO system (city pages)

Two families, sized per client:
1. **City × speciality SEO pages** in `lib/legacy/`: `agence-{speciality}-{city}.ts` (e.g. WordPress, Shopify, automation × N cities). ~700-900 words, anchored in the city's **real economic fabric** (otherwise duplicate content). Rendered by `/[slug]`.
2. **Contact landings `/agence/{city}`** in `lib/villes.ts`: city photo + **form at the top** (`ville` prop → hidden field + "City" line in the email). Conversion-oriented.
- **Footer linking**: a "near you" section (`footerCities` in site.ts) → links to the city pages.
- ⚠️ Preposition: `prep` for departments ("en Vendée") — French-specific, transpose per `{{LANG}}`.
- ⚠️ URL choice: `/{{LOCAL_SLUG}}/{city}` (2 segments, e.g. `/agence/lyon`, `/cabinet/lyon`) avoids any collision with `/[slug]` (`dynamicParams=false`). The first segment reflects the client's trade, not "agence" by default.

---

## 9 bis. Non-brand acquisition modules (from a competitor analysis, 2026-07 — see `docs/strategy/competitor-analysis-2026-07.md`)

Citation is not recommendation. Self-ranked "best [category]" pages earn AI citations while the answer around them recommends the established players, which is exactly the low-authority profile this section targets. Weight the effort toward off-site consensus (reviews, communities, analysts) and set the client's expectation accordingly: `ai-seo/references/citations-vs-recommendations.md`.

> Observation: a B2B services site quickly captures ~95% brand traffic. Competitors that break through on non-brand queries do it with **programmatic content clusters** + **price transparency** + **personal brand**. Optional modules, sized per client (E-E-A-T gate: only on expertise actually sold).

### 9 bis.1 Trade glossary (`lib/glossary.ts` + `/glossaire/<term>`)
- **15-30 terms from the client's trade** (not 100+ generic ones = thin content): each entry tied to a catalog offer.
- Entry template (featured snippet / AI citation architecture): **P1 = direct definition in 2-3 sentences** (self-contained answer, citable as is) → H2 "Why it matters" → H2 "How it works / criteria" (numbered list) → mini-FAQ (2-3 Q/A) → **CTA to the linked offer** + 3 related entries.
- Systematic linking: each entry → 2-3 sibling entries + 1-2 offer pages (descriptive anchors); each offer page → its glossary terms.
- Schemas: `DefinedTerm` (+ `inDefinedTermSet` to the `DefinedTermSet` hub) + `FAQPage`. **Validate with the Rich Results Test** — invalid JSON-LD = 0 value.
- 300-600 words/entry, visible update date, author box.

### 9 bis.2 Comparison / third-party tool review pages
- Capture queries on the **third-party brands of the client's ecosystem** ("X vs Y", "[tool] review"): e.g. web agency → "Shopify vs WooCommerce", "Akeneo vs Plytix"; restaurateur → suppliers/equipment.
- Template: context → factual comparison table → use cases ("choose X if…") → our real experience (E-E-A-T) → CTA.
- "Alternatives to X" sections = natural intra-cluster linking.
- ⚠️ Gate: only on tools the client actually practises. Stay factual about third-party brands (no disparagement).

### 9 bis.3 Price transparency (`/tarifs` or ranges per offer)
- **Public ranges** ("from X €", "X to Y € depending on scope") on every offer page + an optional summary page. Lifts B2B friction n°1 (the competitor does it with public packaged prices).
- Consistency with real quotes (do not undercut). "No commitment" / clear conditions where applicable.
- Anti-pattern seen at the competitor: a "popular" badge on the cheapest offer — the anchor should point at the median/high offer.

### 9 bis.4 Trust constellation
- **/avis** page (or a reinforced section in the references page): **named and quantified** testimonials ("traffic 4.8k → 20k", name + company). `Review` schema only if real.
- Embodied team: photos + real first names on the about page; named quotes ("First name - role") in the hero of key pages.
- Press page **only** if there are real mentions with verifiable URLs (claiming without a link is a negative signal).
- A **functional** lead magnet (e.g. `/audit-gratuit`) beats an editorial "tools" cluster: one real interactive tool differentiates more than 23 review pages.

---

## 9 ter. Functional lead magnet: online audit tool (reference implementation `lib/audit/`)

**2-layer** architecture: deterministic scoring (0 LLM tokens, free to operate) + optional narrative.

- **Layer 1 — deterministic scoring**: `types.ts` (signals), `fetch.ts` (hardened networking), `analyze.ts` (HTML parsing by targeted regex: meta/title/canonical/hreflang/OG/JSON-LD/h1/alt), `scoring.ts` (findings per axis + critical/warning/good severity, constant penalty per severity, score/100 per axis, **finding → commercial offer mapping** so each weakness points to a service page).
- **Layer 2 — narrative**: `NarrativeProvider.generate(report, locale)` interface with 2 implementations: deterministic stub (templates conditioned on the score, always available as a fallback) + AI provider (direct API call, NO SDK) enabled only if a key is in env, auto-fallback to the stub on error.
- **Leads**: Supabase via **direct PostgREST** (native fetch + apikey/Bearer headers, zero SDK). Double opt-in: `randomUUID` token → confirmation email → idempotent PATCH route.
- **Deferred "premium" AI generation**: admin button (token compared in **constant time** via `timingSafeEqual`, fail-closed) sets `generate_requested=true`; a **LOCAL worker** (`scripts/audit-worker.mjs`, never deployed) polls the queue and calls the local CLI (`claude -p`, operator subscription — never from production: cost + terms).
- **SSRF (NON-negotiable for any tool that fetches a visitor URL)**: http/https only + reject localhost; DNS resolution and rejection if ANY IP is private/loopback/link-local/CGNAT (IPv4 AND IPv6, including `::ffff:x.x.x.x` and `169.254.169.254`); `redirect:'manual'` redirects re-validated at each hop with a limit; AbortController timeout; response size bounded by chunks; identifiable User-Agent. Copyable implementation: `lib/audit/fetch.ts`.
- **Anti prompt-injection** (third-party site content → LLM prompt): inject only the hostname (never path/query); wrap third-party data in `<site>` tags + an instruction to ignore any instruction inside; strict JSON output parsed with a deterministic fallback.

---

## 9 quater. Semantic silo (data-driven topical silo) — reference implementation `lib/cocon/`

> Module to trigger when the client attacks **a high-intent niche market** that the offer catalog does not cover (migration away from a competing technology, new regulation, product end of life). Difference with §9 bis.1 (glossary): the glossary is a *transversal* mesh of definitions; the silo is a **closed hierarchical silo** of 30 to 50 pages that monopolises an entire semantic field. Living reference: the 42 `/migration-<source-tech>` URLs (2026-07-24), single-language.

### Topology (3 levels, closed)

```
pillar (N0)  →  5 branch heads (N1)  →  ~36 child pages (N2)
```

Typical branches (transpose to the subject): `produits` (the technical objects of the subject), `declencheurs` (the business reasons to move — **perishable**), `technologies-cibles` (possible destinations), `methode` (the how: audit, data migration, budget, transition), `secteurs` (verticalisation), `transverse` (FAQ, cases, pricing, silo glossary).

### File structure

| Path | Role |
|---|---|
| `lib/cocon/types.ts` | `CoconBranch`, `CoconSchema` (`article` / `service` / `minimal`), `CoconPage` (`slug`, `url`, `branch`, `level: 1 \| 2`, `metaTitle`, `metaDescription`, `h1`, `updated?`, `schema`, `blocks`, `linksOut`, `cta`, `ctaSecondary?`), `CoconPilier extends Omit<CoconPage,'branch'\|'level'\|'slug'>` |
| `lib/cocon/content/<branch>.ts` | One file per branch (the body reuses the blog's `Block` type — zero new renderer) |
| `lib/cocon/index.ts` | `COCON_HUB`, `COCON_UPDATED` (silo lastmod), third-party trademark notice, `coconPages` aggregation + slug→page `Map` for `getCoconPage()` |
| `lib/cocon/diagnostic.ts` | Deterministic scoring of the silo's lead magnet (see below) |
| `components/cocon-page.tsx` | Single renderer: JSON-LD + headings + blocks + `linksOut` + CTA. Accepts an optional `children` to inject a client component on ONE specific page (calculator) |
| `app/(site)/<hub>/{page,[slug],<landing>}` | 3 routes only: pillar, `[slug]` (`generateStaticParams` over `coconPages`), lead magnet landing |

### Linking rules (NON-negotiable — this is what makes the silo)

1. **Linking goes EXCLUSIVELY through `linksOut`.** Never an internal link hard-written in a `block`: otherwise the graph is no longer auditable from the data and the silo leaks.
2. **The pillar links only to the 5 heads.** It never descends straight to N2 (otherwise the heads lose their role as juice distributors).
3. **5 outgoing contextual links maximum per page.** Beyond that, dilution cancels the silo's benefit.
4. **Each N2 links to 4 pages of its branch + links back up** (its head or the pillar): the silo is strongly connected *inside* a branch, weakly between branches.
5. **Exact anchors going down** (the anchor = the target query of the linked page), descriptive going up. Anchors come from the silo plan, not from the writer's inspiration.
6. **Lead magnet exception**: the conversion landing carries a single outgoing link (deliberately below the 5-internal-link floor of §8 — document it, otherwise an audit will flag it as under-linked at every pass).
7. **ONE menu entry only** (the pillar) in the megamenu + footer. The silo is browsed through its own links, not through global nav.

### Silo JSON-LD

`BreadcrumbList` (3 levels, 2 on the pillar) + `Article` **or** `Service` depending on `page.schema` + `FAQPage` if the page carries a FAQ block. `author`/`publisher`/`provider` reference the **same Organization `@id`** as the layout (never a duplicated node). §8 reminder: `inLanguage` on `Article`, never on `Service`.

### Freshness: perishable pages

`declencheurs` pages rest on dated facts (licence change, vendor acquisition, skills shortage): an **`updated` field per page**, displayed AND in `dateModified`, distinct from the global `COCON_UPDATED`. **Scheduled quarterly review** — a stale "triggers" silo turns against E-E-A-T.

### Silo lead magnet: scored diagnostic

- `diagnostic.ts`: N single-choice questions, each option carrying `points` → a score against an explicit ceiling (`DIAGNOSTIC_MAX`), 4 named tiers with an associated reading.
- Landing as a **multi-step form** (client) → API route: deterministic server-side scoring + Brevo email. Zero LLM tokens.
- ⚠️ **Check that the lowest tier is reachable**: `sum of the minimum points of each question < lower bound of the first tier`. A tiered score whose floor is unreachable makes one level dead (observed: minimum 45/120 with a "Low" tier at ≤ 40).

### Simulator (optional, on the silo's pricing page)

Client component injected via the `children` of `cocon-page.tsx` on a single slug. **Every assumption displayed and editable**, result always labelled "estimate under assumptions". Displaying an unconfirmed third-party price as a fact is out.

### Gates before publishing

- **Third-party trademarks**: a non-affiliation notice is mandatory (referential use), source the vendor's commercial terms and **explicitly flag whatever is not officially confirmed**.
- **No invented client figures**: until real cases are validated, the "case studies" page presents **typical trajectories, labelled as such**, never disguised references.
- **Validate the graph against the source plan** (silo xlsx / doc) by script: URLs, anchors, link direction, `linksOut` count per page. By eye, a 42-page silo breaks silently.

### Single-language

A silo tied to a national market stays **deliberately single-language** (like `lib/legacy/`). ⚠️ Do NOT register its paths in a predicate shared with the secondary-language logic (see trap 33): `/<lang2>/<hub>` must stay a 404.

---

## 10. Form & email (Brevo)

The field set and the submit label are a conversion decision, not a schema. Before shipping more than name, email and message, apply the cost-per-field and multi-step rules in `cro/references/form.md`; the scored diagnostic in §9 quater inherits them.

- `components/contact-form.tsx` (client): name/email/company/url/subject/message fields + **honeypot** `_hp` + optional `ville` prop. POST JSON → `/api/contact`.
- `app/api/contact/route.ts`: in-memory **rate limit** (3/min/IP), honeypot (silently answers ok), validation + per-field `LIMITS`, HTML+text build, **send via Brevo SMTP** (nodemailer) with **Brevo API fallback**. Variables: `BREVO_SMTP_LOGIN/KEY`, `BREVO_SENDER_EMAIL`, `BREVO_TO_EMAIL`, `BREVO_API_KEY` (fallback).
- ⚠️ **A `{ok:true}` success does not guarantee delivery**: the domain must be **authenticated at Brevo** (SPF + DKIM + DMARC) or mail lands in spam/gets rejected (especially if the mailbox is Google Workspace). See §15.
- Diagnostics: log nodemailer's `info.response/accepted/rejected` (the real SMTP reply).

---

## 11. Legal & compliance (GDPR)

> Detailed content for `{{JURISDICTION}}` = France. Other jurisdictions — same pages, identifiers and authorities transposed:
>
> | | France | Spain | Generic EU |
> |---|---|---|---|
> | Company identifiers | SIREN/SIRET, RCS, intra-EU VAT | NIF/CIF, Registro Mercantil, IVA | national register no. + VAT |
> | E-commerce/site law | LCEN | LSSI-CE | e-commerce directive |
> | Data authority | CNIL | AEPD | national authority + GDPR |

- **Legal notice** (`/mentions-legales`): publisher (registered name, company number, trade register, VAT, publication director), host (Vercel), intellectual property, GDPR, cookies, liability. **No image.**
- **Privacy policy** (`/politique-confidentialite`): data controller, data collected, purposes/legal basis, recipients/processors (ESP, host), transfers outside the EU (SCCs), retention, cookies, GDPR rights + supervisory authority, security. **No image.**
- **Cookie banner** (`components/cookie-banner.tsx`): client component, **first visit only** (`localStorage` `cookie-consent-v1`), aligned design, link to the policy, "Got it" button. Compliant as long as the site has **no advertising tracker** (otherwise add real opt-in consent). No storage is set before the click.
- Links in the footer; pages in the sitemap.

---

## 12. Images

- **Stock**: Pexels / Unsplash / Wikimedia Commons (free for commercial use). Download the original then convert to **WebP** (sharp): `resize(1200,800,{fit:'cover'}).webp({quality:80})`. ~1200px. Keep the source URL for traceability.
- **Realistic generation** (optional): `scripts/gen-images.cjs` (Playwright + ChatGPT, persistent profile). ULTRA-realistic prompts ("photorealistic commercial photograph", screens "out of focus, no readable text"). ~50 s/image. Convert PNG→WebP with sharp.
- `next/image` everywhere (local = no `remotePatterns`). Always a descriptive `alt`. Dimensions consistent with the file (e.g. 1200×800) to avoid distortion.
- **Real logos/signage in post-production**: never let an AI generator draw a logo or a shopfront sign (distorted = instant AI tell). Composite the real logo (official file, stored locally) over the generated image (sharp composite), or frame the prompt to exclude any readable signage.
- Alternate visual types (photo, diagram/SVG, real logo) — a run of too-similar generated illustrations is an AI tell.
- ⚠️ **A hand-written SVG does not pass through `next/image`** unless `dangerouslyAllowSVG` is set in `next.config.ts` — and enabling it opens an XSS surface on remote SVGs. The clean workaround: generate a `.webp`. Design the component with an **optional** `visual` so an offer can ship without an illustration while waiting for the asset, rather than blocking the launch.

---

## 12 bis. Remotion explainer videos (zero-runtime pattern) — optional

For motion design / explainer video: **never a client-side video animation engine** (Lottie, canvas runtime). Pre-render to mp4:

- A **fully standalone** `remotion/` sub-project (own package.json/tsconfig, excluded from the root tsconfig/eslint), react/react-dom as devDependencies aligned with the site.
- 1 video = 1 composition + 1 npm script: `remotion render src/index.ts <Comp> ../public/videos/<name>.mp4 --codec=h264` + `remotion still ... <name>-poster.jpg --frame=<N>` (poster extracted from a frame, no separate visual). Aggregate script `render:all`.
- **Manual render before deployment** (never at Next build time) → `public/videos/`. ⚠️ The mp4s are not generated at build: check they exist before deploying (otherwise a silent 404).
- Embed = a minimal native `<video>` component (`components/video-block.tsx`, ~33 lines): `autoPlay muted loop playsInline preload="metadata" poster` + `aria-label` + sr-only figcaption. Zero JS dependency. `data-explainer` attribute so the animation layer (§4 bis) kills autoplay under `prefers-reduced-motion`.

---

## 13. Agent-assisted build workflow (at scale)

Bulk content (city pages, articles, SEO pages) is generated by **parallel agents**. Proven method:

1. **Batch**: ~2-4 pages per agent. Model **haiku** for simple volume, **sonnet** for nuanced writing (loanwords/accents come out better in sonnet).
2. **Strict prompt**: EXACT format of the target type + hard rules (§7) + **an already-cleaned reference file** to imitate + local specifics (real economic fabric per city). Require "do not declare done without the file actually written".
3. **Always VERIFY** (an agent sometimes says "DONE" without writing):
   ```bash
   ls lib/legacy/ | wc -l                       # expected count
   grep -rl "[‘’“”]" lib/legacy/                # curly quotes (must be empty)
   grep -rn "—\|–" lib/legacy/                  # em/en dash (must be empty)
   grep -rn '"ol"' lib/legacy/                  # forbidden type
   ```
4. **Automated quality pass (Python, Unicode-aware)** — detect missing accents + loanwords + AI tells, then fix. Watch the false positive "métier" → "tier" (the `é` breaks an ASCII regex: use `(?<![A-Za-zÀ-ÿ])`).
4 bis. **Adversarial double review** on any landing generated by multiple agents: one VOICE pass (AI tics, loanwords, register) + one SEO pass (target query in h1/meta/body, internal linking) by two distinct reviewers — a single reviewer lets through what they habitually write themselves.
5. **Regenerate the auto indexes** (§5.5), then `tsc` + `build`.

### Model routing (token economy)
- **haiku**: research, reading, extraction, listing, translation, simple bulk content.
- **sonnet**: structured writing, loanword removal/re-accentuation, review, editing.
- **opus**: orchestration (main thread), arbitration.

### Recurring agent traps (fix systematically)
- Loanwords (store/checkout/custom/launch/features/logistics…).
- Unaccented h2/h3 titles ("Etape", "Conformite", "a Lyon").
- Unaccented metaTitle/metaDescription (tolerable on metaTitle; accent the rest).
- **Fake client quotes** ("a client told us…") → delete.
- **Competing model names** → generalise.
- Hyperbole, over-familiar register.

---

## 14. Build & QA

**Next.js**:
```bash
rm -rf .next            # stale types after removing routes
npx tsc --noEmit        # 0 errors (ignore possible .next/validator errors → rm -rf .next)
npx eslint .
npm run build           # 0 errors; check the number of generated pages
node scripts/audit-local.mjs   # accessibility (axe) — optional
```

**Astro**:
```bash
npx astro check         # equivalent of tsc --noEmit (types + .astro templates)
npm run build           # 0 errors; check the number of generated pages
node scripts/audit-local.mjs   # accessibility (axe) — optional
```

In both cases: **count the generated pages and reconcile them with the expected inventory** (§6). A silent gap is the most frequent symptom of a badly declared route (see traps 32 and 37).
⚠️ The **shell may have `errexit`**: a `grep` with no match (exit 1) kills a chained script → use `|| true` or Python.

---

## 15. Deployment + DNS + email (production)

> Detailed procedure for the default stack (Vercel + Brevo). **Invariants whatever the provider**: domain explicitly attached to the hosting project, leftover AAAA records removed, MX untouched, SPF+DKIM+DMARC authenticated at the ESP, end-to-end email test. Only the commands change.

### Vercel deployment
```bash
npx vercel deploy --prod --yes      # CLI session already logged in
```
### Attach the domain (KEY LESSON)
DNS pointing at Vercel **is not enough**: the domain must be **added to the Vercel project**, otherwise Vercel returns **404** and issues no SSL.
```bash
npx vercel domains add {{DOMAIN}}        # 1 argument; attaches to the linked project
npx vercel domains add www.{{DOMAIN}}
```
### DNS (at the registrar — keep the nameservers)
| Type | Name | Value | Note |
|---|---|---|---|
| A | @ | `76.76.21.21` (value shown by Vercel) | replace the old A |
| **AAAA** | @ + www | (delete) | otherwise IPv6 visitors see the old site; also blocks the CNAME |
| CNAME | www | `cname.vercel-dns.com` | (after deleting the AAAA) |
| MX | @ | unchanged | **do not touch** email |

### Deliverable email (Brevo) — otherwise the form lands in spam
1. Brevo → authenticate the domain `{{DOMAIN}}` (generates 2 DKIM records) + validate the sender.
2. DNS: **merged SPF** (a single line, e.g. `v=spf1 include:_spf.google.com include:spf.brevo.com ~all`), Brevo **DKIM** (2 records), **DMARC** (`_dmarc` → `v=DMARC1; p=none; rua=mailto:{{CONTACT_EMAIL}}`).
3. Re-test the form; check the SMTP logs; remove the diagnostic logging.

(Full detail: `references/dns-migration.md`.)

---

## 16. PLAYBOOK — from zero to production (execution order)

> The agent follows this in order. Tick as you go.

1. **Intake**: fill `INTAKE-CLIENT.md` (§1 variables). Gather logo, colours, legal details, Brevo credentials, city/service list, proof/clients.
2. **Framework choice (§2 bis)**: Astro by default; Next.js if at least two switching conditions hold. Decide BEFORE the first line of code, the arbitration is not redone mid-project. Write the decision and its reason into the intake.
2 bis. **Init**: Astro → `npm create astro@latest` + `npx astro add tailwind vercel sitemap`. Next → clone `starter/` (or `create-next-app` + §2 design system). In both cases fill `.env` (Brevo, SITE_URL, CONTACT_EMAIL).
3. **Theming**: adapt `:root` (colours) + fonts (layout.tsx) to the branding. Logo in `components/logo.tsx` + `/public/brand`.
4. **Service tree**: fill `lib/catalog.ts` (pillars + offers) from the client's real offering. `published` for phase 1.
5. **Marketing data**: fill `lib/site.ts` (nav, real proofPoints, faqs, values, clients, tech, footerCities).
6. **Long-form content**: `lib/content/<pillar>.ts` (~1200 words/page, §7 voice) — via agents (§13) + quality pass.
7. **City × speciality SEO pages** (`lib/legacy/`) if relevant: generate by agents, anchor locally, verify, regenerate the index.
8. **City landings** (`lib/villes.ts`): write them, **download the photos** (§12), form at the top.
9. **Blog**: `lib/blog.ts` articles (+ `lib/legacy-blog/` archives if taking over an old site, with catch-all + 301s for reworked topics).
10. **Editorial pages**: about (Person), approach, references, partners.
10 bis. **Non-brand modules** (§9 bis, per client scope): trade glossary, price ranges, reviews page, comparisons — with author box + visible update dates (§8).
11. **Legal**: legal notice + privacy policy (aligned with the company, no image) + cookie banner.
12. **SEO/GEO**: sitemap, robots+Content-Signal, llms.txt/full, markdown negotiation, Link headers, OG image, JSON-LD schemas, **301s** for old URLs.
13. **Voice**: **humanizer** pass + loanword removal + re-accentuation on ALL content (§13 Python scripts). Apply the **persuasion principles** to CTAs (§7).
14. **QA**: `rm -rf .next && tsc && eslint && build` 0 errors; a11y audit; visual read-through.
15. **Deployment**: `vercel deploy --prod`; **attach the domain**; configure DNS (A/CNAME, remove AAAA, keep MX).
16. **Email**: authenticate the domain at Brevo + SPF/DKIM/DMARC; test the form end to end.
17. **Final check**: `QA-CHECKLIST.md` (production smoke tests, indexability, sitemap, form received).

---

## 17. Known traps (summary)

1. Typographic quotes as JS delimiters → syntax error. `grep -n "[‘’“”]"` after every agent pass.
2. Tailwind v4: `a{color:inherit}` must stay in `@layer base`.
3. Em/en dashes banned; do not convert numeric ranges (use "à").
4. Agent content = French without accents → always re-accentuate (titles included).
5. Next rewrite + query: the route sees the original URL → pass params via header.
6. Stale `.next` after removing routes → `rm -rf .next` before tsc/build.
7. Legacy index: type the getter `(slug: string)`.
8. Shell `errexit`: a `grep` with no match kills the chain → `|| true` / Python.
9. **Domain not attached to the Vercel project** → 404 + no SSL (cause n°1 of a "site down" after a DNS migration).
10. **Leftover AAAA records** → IPv6 visitors on the old site + CNAME refused.
11. **Email accepted but not delivered** → SPF/DKIM/DMARC missing at the ESP.
12. Regex false positive `métier`→`tier`: always Unicode-aware.

### Competitor anti-patterns (observed on a competing site — verify in QA on every site shipped)
13. **JSON-LD never validated**: BreadcrumbList with a single item / wrong domain, DefinedTerm outside `<script>` or invalid JSON → 0 value. Run every type through the Rich Results Test / validator.schema.org.
14. **Fake headings**: CSS-styled `<p>`/`<div>` instead of real `h2`/`h3` → extraction impossible (snippets, AI). Check the real tag hierarchy, not the rendering.
15. **Empty or mid-sentence truncated meta descriptions**: write them calibrated ≤ 160, never a cut excerpt.
16. **Invisible reassurance**: a promise ("reply within 48h") present in meta/title but absent from the visible body → put it where the human fills the form. Phone always in `href="tel:"`.
17. **GDPR holes**: analytics with no consent banner; an "I accept the privacy policy" checkbox with no linked page. Every legal checkbox points to a real page.
18. **Dead DOM**: CTAs in `display:none`, footer links `href="#"`, duplicate links → audit links before delivery.
19. **Bare sitemap**: no `lastmod` (nor images) = no re-crawl signal. Our static `LAST_UPDATED` pattern covers this.
20. **Template leaks**: 404/system pages still carrying the purchased template's name → rebrand everything (the 404 too).

### Traps added since v1 (GSAP, bilingual, audit tool — 2026-07)
21. Next REPLACES (does not merge) the layout's `metadata.openGraph` as soon as a page declares one → default og:image silently lost. Always go through the `ogMeta()` helper (§5 bis).
22. 2-root-layout architecture: `app/not-found.tsx` (and any file inheriting the default layout) must NEVER render `<html>/<body>`.
23. `gsap.context()` does not track SplitText instances → manual `revert()` on cleanup, otherwise leftover spans after navigation (§4 bis).
24. Without `.gsap-motion .scroll-reveal{animation:none!important}` → double animation (CSS fallback + GSAP engine).
25. Lenis recreated on every navigation → multiple tickers, desynchronised scroll. Module singleton driven by `gsap.ticker` only.
26. A tool that fetches a visitor URL without SSRF guards (DNS + re-validated redirects) = possible access to `169.254.169.254`/the private network (§9 ter).
27. `content-visibility:auto` skews axe-core scans (contrast false positives: force `content-visibility:visible` before scanning) and produces full-page captures with empty sections (artefact, not a bug).
28. Never pipe `npm run build` into `head` (SIGPIPE kills the build before `BUILD_ID` is written).
29. Standalone sub-projects (remotion/, tools/, starter/): exclusion from the root tsconfig AND `.vercelignore` are mandatory — the Vercel build type-checks everything uploaded, without the sub-projects' node_modules (`Cannot find module` failure while the local build passes).
30. **Images in a translateX marquee/carousel: `loading="eager"` mandatory** — native lazy evaluates the transformed position: an offset track is "never near the viewport" → 0 images loaded, an empty band scrolling past (seen in production 2026-07-15: 0/24). Applies to any element moved by transform (parallax, rails).
31. **Logo in a flex nav bar: `shrink-0` on its link** — otherwise the `<img>` (the only compressible flex item, `min-width:auto` does not protect it) absorbs all the missing space as the nav grows: 151px → 30px with no error or warning. Check the bar on EVERY nav entry added, at the 1280/1440/1600 breakpoints.
32. **`ScrollTrigger.batch` + `once` + `content-visibility:auto` = sections invisible forever** on anchor arrival, mid-page reload or back button: unlaid-out sections give zero rects, triggers are marked passed without onEnter, and `batch` (unlike scrollTrigger tweens) has NO state catch-up. Double guard mandatory: `html.gsap-motion .section{content-visibility:visible}` (reliable geometry when the engine is active) + inside revealBlocks, never hide an element already in or above the viewport at init. Test all 3 scenarios: anchor, bottom-of-page reload, normal scroll (seen in production 2026-07-15).

### Traps added by the semantic silo (§9 quater — 2026-07)
33. **Path predicate shared between the default and the secondary language**: adding a single-language hub to a generic predicate (e.g. `isDataDriven`, also used to build `/{{LANG2}}/*`) makes `/{{LANG2}}/<hub>` valid while no translation exists. Declare single-language paths **after** the secondary-language branch, never in the shared predicate (seen on `proxy.ts` + the migration silo, 2026-07-24).
34. **Tiered score with an unreachable floor**: if the sum of the minimum points of all questions exceeds the upper bound of the first tier, that tier never comes out. Check `min(total) < lower bound` AND `max(total) = announced ceiling` before publishing a diagnostic (observed: minimum 45/120 with a "Low" tier at ≤ 40, rebalanced to 29/120).
35. **Internal links hard-written in a silo body**: they escape the typed graph (`linksOut`), therefore the validation script and the 5-link cap. The silo leaks with no check seeing it. Rule: the silo renderer is the ONLY source of contextual links; the generic body renderer must handle external links (`rel="noopener noreferrer"`, dofollow) so cited sources do not push writers into working around the rule.
36. **Conversion landing below the 5-internal-link floor**: it is deliberate (a single outgoing link so conversion does not leak) but it surfaces at EVERY linking audit. Document it as a named exception, otherwise it gets "re-fixed" at every pass.
37. **A silo page present both in the data table AND as a dedicated static route** (normal case: the lead magnet landing, which needs its form): Next gives priority to the static segment, so the right page is served — but if the slug is not removed from `generateStaticParams`, an unreachable ghost version is prerendered as well, with no build error and no symptom in production. Rule: `coconPages.filter((p) => p.slug !== '<landing>')` in `generateStaticParams`, with a comment naming the reason; the entry stays in the data for the sitemap and inbound `linksOut`. Reading corollary, NOT to be taken for a bug during an audit: `number of data entries` = `number of generated params + number of dedicated routes`. A gap of 1 with a dedicated route facing it is the signature of a correctly handled case — check the filter before concluding, and count on the **rendered output** (`.next/server/app/**.html`, `dist/**.html` in Astro) rather than on the source table. Applies identically to `getStaticPaths()` in Astro: static route > dynamic route priority is explicitly documented there.
38. **Copying the reference site's stack without redoing the framework arbitration**: the canonical site is on Next.js because it carries an application (audit engine, admin, queue), not because Next would be the right default for a showcase. On a content site, Next ships the React runtime to hundreds of pages that need no JS. Redo the §2 bis arbitration on every project and write it into the intake — an untracked framework choice re-justifies itself by habit.
39. **Writing Astro from memory**: the framework moved fast and dead APIs are plausible (`output: 'hybrid'`, `<ViewTransitions />`, `@astrojs/tailwind`, `src/content/config.ts`, `@astrojs/db`). Before coding, check the current docs (§2 bis gives the state as of 2026-07-30, Astro 7.1.6). Two v7 breaks are silent: a stricter Rust compiler on malformed HTML, and the Sätteri Markdown engine replacing remark/rehype.
40. **Concluding performance from bundle weight**: "200 KB of JS, therefore the site is slow" is false as often as it is true. Measured 2026-07-30: 205 KB of gzip JS served on a content page, yet 0 ms estimated saving on FCP and LCP (the JS is not on the critical path), no long task reported by the trace at 4× CPU throttling, CLS 0.00. The real lever was render delay (CSS + fonts, 92 to 98% of LCP). Corollary: never sell or justify a framework change on speed without field measurement. Protocol: `auditing-websites/METHODE-AUDIT.md` §7.

---

*Living implementation reference: the reference repo. Related documents: `INTAKE-CLIENT.md`, `QA-DEPLOIEMENT-CHECKLIST.md`, `references/dns-migration.md`, `references/persuasion-principles.md`. Clonable starter: `starter/`.*
