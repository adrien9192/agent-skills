# QA + DEPLOYMENT CHECKLIST

> Run before AND after deploying each site. Tick every line.

## A. Content & voice (before build)
- [ ] `grep -rl "[‘’“”]" lib/` → **empty** (no curly quotes as delimiters)
- [ ] `grep -rn "—\|–" lib/ app/ components/` → **empty** (no em dash/en dash)
- [ ] `grep -rn '"ol"' lib/` → **empty** (block type not allowed)
- [ ] Missing-accent scan (Python, Unicode-aware) over h2/h3 headings and body → fixed
- [ ] Franglais scan (store, checkout, custom, launch, features, logistics, online, roadmap…) → fixed
- [ ] AI-tells scan (promo « véritable/incontournable/s'impose comme », filler participles, rule of three, fake quotes, competitor model names) → fixed
- [ ] Preposition « à » accented everywhere; French départements use « en »
- [ ] Every statistic and client result is real (E-E-A-T)
- [ ] CTAs apply the persuasion principles (a "because" reason, first step, loss framing)

## B. Code & build
- [ ] (if Remotion video module) Explainer videos present: `ls public/videos/*.mp4` (otherwise `cd remotion && npm run render:all`)
- [ ] Nettoyage du cache de build **du framework en vigueur** — Astro : `rm -rf dist .astro` · Next : `rm -rf .next` · TanStack : `rm -rf dist .output` (table complete : SKILL.md §7)
- [ ] **Type-check du framework en vigueur** → **0 erreur** (legacy getters typed `(slug: string)`)
      · Astro : `pnpm astro check` · Next : `pnpm tsc --noEmit` · TanStack : `pnpm typecheck`
- [ ] `pnpm lint` → clean (le linter declare dans `package.json`, pas `npx eslint .` en dur :
      un projet Astro ou TanStack peut utiliser Biome)
- [ ] **Build du framework en vigueur** → **0 erreur** ; le nombre de pages generees tombe juste
      (villes, blog, legacy) · Astro : `pnpm build` puis `ls dist` · Next : `pnpm build` ·
      TanStack : `pnpm build`
- [ ] `pnpm test` → vert, s'il existe des tests

> Table canonique complete des trois chaines : `SKILL.md` §7. `npx tsc` et `npx eslint .` ne
> sont PAS des commandes universelles — sur Astro le type-check passe par `astro check`, qui
> voit les `.astro`, et un projet peut linter avec Biome. Prescrire l'outil plutot que
> l'intention faisait echouer la checklist sur deux des trois stacks du depot.
- [ ] (if legacy pages) Auto indexes (`lib/legacy`, `lib/legacy-blog`) regenerated and current
- [ ] `a{color:inherit}` still inside `@layer base`
- [ ] Images: `alt` everywhere, dimensions match the real file (no distortion), WebP optimised

## C. SEO / GEO
- [ ] `metadata` (title, description ≤ 160, canonical) on every page
- [ ] JSON-LD present (Organization+WebSite global; Service/BreadcrumbList/FAQPage per page; BlogPosting; Person)
- [ ] `sitemap.xml` includes pillars, offers, nav, cities, legacy, blog, archives, legal
- [ ] `robots.txt`: `Allow: /` + Content-Signal header, AI bots named **by role** (search / user-fetch / training). Probe production, never read the route: `curl -s https://{{DOMAIN}}/robots.txt | grep -icE 'oai-searchbot|claude-searchbot|perplexity-user'` → **3 expected**; `0` means the flat pre-2026 list shipped and the client is opted out of ChatGPT and Claude answers
- [ ] `llms.txt` + `llms-full.txt` current (they iterate over the data)
- [ ] Markdown negotiation OK (`curl -H "Accept: text/markdown" https://{{DOMAIN}}/<page>`)
- [ ] RFC 8288 Link headers present
- [ ] 301s from the old URLs configured (`next.config.ts`)
- [ ] OG image + apple-icon + manifest (PWA 192/512) OK

## D. Accessibility
- [ ] `node scripts/audit-local.mjs` (axe) → 0 critical violations — copy the script from the `auditing-websites/assets/` skill onto a fresh project, then set its `AUDIT_*` variables (pages, domain, brand, menu selector)
- [ ] Visible focus (`.focusable`), skip link, AA contrast
- [ ] `prefers-reduced-motion` disables animations (CSS, GSAP engine `components/motion/engine.ts` AND autoplay videos)

## E. Legal & GDPR
- [ ] Legal notice matches the company (SIREN, RCS, host), **no image**
- [ ] Full privacy policy (controller, data, recipients, rights, CNIL), **no image**
- [ ] Cookie banner: first visit only, nothing stored before a click
- [ ] If analytics/trackers are added → banner becomes **opt-in consent**

## F. Deployment
> Vercel commands (default stack). Invariants on any host: domain attached to the project, AAAA deleted, MX untouched.
- [ ] `npx vercel deploy --prod --yes` → success
- [ ] **Domain attached to the project**: `vercel domains add {{DOMAIN}}` + `www.{{DOMAIN}}`
- [ ] DNS: A `@` → Vercel IP; **AAAA deleted**; CNAME `www` → cname.vercel-dns.com; **MX unchanged**
- [ ] SSL issued (HTTPS 200 on apex + www)
- [ ] www → apex redirect (Vercel toggle) — optional

## G. Production smoke tests (curl)

> Run at least one of these from outside your own network. A DNS entry that only
> resolves on your machine, or a firewall rule that only you pass, looks identical
> to a working site from your desk. `auditing-websites/assets/kitesurf.mjs content <url>`
> does that without a local browser, and renders the JS while it is there.

- [ ] `https://{{DOMAIN}}/` → 200
- [ ] A sample of every page type (pillar, offer, city, legacy, blog, dated blog) → 200
- [ ] 301 redirects → 308 to the right target
- [ ] `X-Robots-Tag noindex` **absent** on the final domain (present only on *.vercel.app)
- [ ] `sitemap.xml` reachable and complete
- [ ] (if local SEO) Every footer city link → 200

## H. Email (form)
> Brevo procedure (default ESP). Invariants on any ESP: SPF+DKIM+DMARC authenticated, end-to-end test, real mailbox checked.
- [ ] Domain authenticated at Brevo (SPF + DKIM + DMARC verified with `dig`)
- [ ] End-to-end form test → **email received** in the mailbox (check spam too)
- [ ] SMTP logs: `accepted`, `response: 250 … queued`
- [ ] Diagnostic logging removed once delivery is confirmed

## I. Post-launch
- [ ] Google Search Console: add the property, submit the sitemap
- [ ] Check indexing after a few days
- [ ] Store the credentials (Vercel, Brevo, DNS) somewhere safe
