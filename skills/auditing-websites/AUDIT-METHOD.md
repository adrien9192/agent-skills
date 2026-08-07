# Full SEO/GEO audit method

> Distilled from the audits of a B2B agency site (2026-05 → 2026-07): a consolidated multi-agent audit, a third-party SEO tool audit, and a competitor analysis. Every audit states its date, tools, page sample and agents in its own header.

## 1. Collection

**External (third-party SEO tool)**: ranking keywords, monthly volume, Keyword Difficulty, average position, visibility score. Directional only — cross-check against Search Console as soon as the domain is indexed.

**Internal (multi-agent)**: full code read, Playwright desktop/mobile captures per page family (home, hub, detail, index, contact, article), generic-AI-pattern detector, curl checks against production.

**Mandatory reconciliation**: every claim is re-verified against production (raw curl) or the code before it is kept. Recurring false positives: "JSON-LD missing" (the fetch tool stripped `<script>`), "image without priority" (the preload was in the real HTML).

## 2. Scoring and prioritisation

- Per axis (Design/UX, Code/Architecture, SEO, GEO, **CRO when the brief is a conversion problem**): **current score / potential score / main blocker**. Scale and definitions: `ORCHESTRATION.md` §5.
- Action plan in 4 tiers: P0 blocking this week, P1 high impact this month, P2 growth this quarter, P3 hygiene, no date.
- **CONTENT roadmap kept distinct from fixes**, in time phases: Phase 0 blocking prerequisites (indexability) → 0-90 d quick wins at KD ≤ 20 to bootstrap authority → 3-6 months mid volumes + link building → 6-12 months head terms at KD 50+. Tiers P0-P3 prioritise corrections; the roadmap sequences creations.
- A consolidation found independently by two methods (external + internal) is automatically a priority.
- Table of target query → single destination page (never a "fuzzy cluster").

## 3. Cluster / duplicate consolidation

- Merge criterion: several URLs on the **same search intent** cannibalising each other.
- Canonical URL = the one already ranking best, or the most generic phrasing of the intent.
- Remove duplicates from the build/menu/sitemap but **keep the files** (rollback, history).
- **308** for same-site internal consolidation; **301** for an architecture/domain migration, with an exhaustive old → new URL mapping written BEFORE the switch.
- Never delete a page holding an active ranking (even position 70 on a single keyword) without a redirect.

## 4. Keyword arbitration

- Decision = volume × KD × **E-E-A-T legitimacy** (the service is actually sold). Non-negotiable: no money page for an offer that is not delivered (search-engine risk + deceptive commercial practice).
- Low-authority domain: KD ≤ 20 first (realistic ranking in 60-90 days), KD 40+ afterwards.
- Ambiguous head terms (polysemous acronyms) → requalify into a specific long phrase.
- Check the dominant SERP intent before choosing the format (informational SERP → resource page with a secondary CTA, not a commercial page).
- Deduplicate overlapping volumes before summing anything (real case: 38,480 apparent → ~31,000 real).
- Keywords under 100 searches/month → sections inside a page, not menu entries.
- Large volume + abnormally low KD = hidden opportunity, top of the backlog.
- **Recycle before creating**: an existing informational article that ranks on a commercial intent becomes a service (money) page rather than a competing new one — the page's history travels with it.
- Check non-cannibalisation against the existing site before each new page.
- Never mass-generate a content backlog without the decision-maker validating the real scope of the offer; keep the arbitrated backlog documented separately from what was executed.

## 5. GEO (beyond classic SEO)

- `llms.txt` (summary) + `llms-full.txt` (full prose) in **standard markdown** (no proprietary format), generated from the same data as the pages.
- Content negotiation on `Accept: text/markdown` → dedicated route rebuilding the markdown from the structured data (never an HTML→MD conversion). `Vary: Accept`.
- robots.txt: AI bots named individually (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, OAI-SearchBot…) + Content-Signal.
- Freshness **visible in the HTML** (update date in the body), not only in meta.
- Citable content: every money page carries at least one dated fact, one sourced figure, one named methodology or one structured comparison.
- RSS feed maintained alongside the sitemap.
- Sitemap: static `lastmod` per route, never `new Date()` on every build (Google eventually ignores the signal).
- JSON-LD complete AND valid; founder `Person` with a single @id everywhere; never Review/AggregateRating without real ratings.
- **GEO non-regression check after any redesign**: list what the redesign removed (llms.txt, RSS, markdown negotiation) — one competitor fixed all of its classic SEO in a redesign and lost its entire GEO layer without noticing.
- **Operational Search Console**: resubmit the sitemap after any restructuring (scriptable via a service account); a "NEUTRAL" URL Inspection verdict on fresh pages is normal, not something to fix.

## 6. Internal linking / orphan pages

- Identify high-volume pages absent from navigation (orphaned from the menu) and quantify their combined volume: quick wins already built but invisible.
- Internal link floor per page (market reference: 20-30+; under 5 = under-linked, priority).
- Templated linking per cluster (each entry → N sibling entries + M money pages), never ad hoc.
- Proof/case studies tagged by pillar and linked to the matching money page.
- When the sitemap and the internal linking are **data-driven** (generated from the same typed data), internal link integrity holds by construction: auditing the generator once beats crawling links every time.

### 6 bis. Auditing a semantic silo (topical silo)

When the site carries a hierarchical silo (pillar → heads → children, see the blueprint §9 quater), the linking is NOT audited with the generic rules above. Specific checks:

| Check | Expected | Drift symptom |
|---|---|---|
| **Link direction** | Pillar → heads only; children → 4 siblings in the same branch + 1 upward link | Pillar linking straight to N2: the heads no longer distribute anything |
| **Outbound volume** | ≤ 5 contextual links per page | 10+ links: the silo behaves like flat linking, benefit cancelled |
| **Anchors** | Exact going down (anchor = target page's query), descriptive going up | Generic anchors ("learn more", "click here"): no semantic signal transmitted |
| **Tightness** | Cross-branch links rare and justified | Branches linking massively to each other = one large cluster, not a silo |
| **Link source** | 100 % from the data model's typed field (`linksOut`) | Hard-coded links in the body: invisible to the validation script, counts falsified |
| **Orphans** | Every silo page reachable from the pillar in ≤ 2 hops | Page in the sitemap but never linked = crawled, never weighted |
| **Freshness** | "Trigger" pages (dated facts) carry their own visible `updated` + `dateModified` | A single silo-wide date masking stale facts = E-E-A-T risk |
| **Nav entries** | Exactly ONE (the pillar) | Several menu entries into the silo: the hierarchy is short-circuited |

- **Always reconcile the rendered graph against the source silo plan** (xlsx / plan doc) by script: URLs, anchors, direction, count. A 40+ page silo breaks silently during later edits.
- ⚠️ **Audit the RENDERED output, never the data table.** A silo page that also owns its own route (typically the lead magnet landing) appears twice: the framework serves the dedicated route, and the dynamic generator must exclude that slug or it prerenders a ghost version nothing can reach — with no build error and no symptom in production. Count rendered pages (`.next/server/app/**.html` in Next, `dist/**.html` in Astro, or the served sitemap), not data entries. ⚠️ **Classic false positive**: `entry count` = `generated pages + 1` is NOT a bug when a dedicated route exists opposite it — that is exactly what a correct exclusion produces. Read the route generator (`generateStaticParams` in Next, `getStaticPaths` in Astro) before opening a finding (real false positive, 2026-07-27). Static route > dynamic route precedence holds in both frameworks.
- **Accepted exception, not to be "fixed"**: the silo's conversion landing carries a single outbound link. It will fall below the 5-link floor on every pass — list it as a named exception in the report, not as a finding.
- **Factual gate on third-party brands**: a "migrating from [competitor]" silo must carry a non-affiliation notice, source the commercial terms it quotes, and flag what is not officially confirmed. Also check that no case study is presented as real when it is a typical trajectory.

## 7. Performance & Core Web Vitals

> Section born from a counter-intuitive measurement (2026-07-30): on a site whose content pages served **219 KB of brotli JS / 706 KB raw** (69 KB of it `react-dom`), Chrome's render-blocking analysis reported **0 ms of savings on FCP and LCP**, a render delay accounting for 86 to 96 % of LCP, and a CLS of 0.00. **Bundle weight does not predict CWV impact.**
>
> ⚠️ **Correction on 2026-07-30 (same day, second pass):** the first version of this section claimed "no long task reported by the trace even at 4× CPU throttling". **False.** A counter-measurement found 22 to 56 long tasks depending on the run and 180 to 954 ms of blocking over the 0-5 s window. Two lessons, both structural:
> 1. **Run-to-run variance reaches a factor of 5** on blocking. A single trace supports no numerical TBT attribution. A defensible TBT figure needs ≥ 10 runs, a single open tab, and the standard deviation published.
> 2. **Attribution mattered more than the total.** 100 % of `requestAnimationFrame` calls came from the animation-layer chunk (GSAP + ScrollTrigger + Lenis), not the React runtime. The finding therefore concerned an application dependency — one a framework change would not have removed. **Always attribute by stack trace before naming a culprit.**

### Principle

An observation of weight (bundle, request count, framework choice) is an **observation**, not a finding. It becomes one only when backed by a degraded, measured metric. Non-negotiable sequence: **field → lab → attribution → finding**. Skipping a step produces expensive, wrong recommendations.

### 7.1 Metrics and thresholds (defensible reference)

| Metric | Good | Needs improvement | Poor | What it captures |
|---|---|---|---|---|
| **LCP** | ≤ 2,500 ms | 2,501-4,000 | > 4,000 | how fast the main content paints |
| **INP** | ≤ 200 ms | 201-500 | > 500 | responsiveness to interactions (replaced FID on 2024-03-12) |
| **CLS** | ≤ 0.1 | 0.1-0.25 | > 0.25 | visual stability |

Google's evaluation: **75th percentile**, rolling **28-day** window. Sources: `web.dev/articles/defining-core-web-vitals-thresholds`, `web.dev/articles/inp`, `web.dev/articles/vitals-tools` (checked 2026-07-30).

⚠️ CWV are a **confirmed ranking signal whose weight has never been published**, and Google states that relevance outranks page experience. Frame a CWV improvement as risk avoided, never as positions gained.

### 7.2 Field data first, always

Strict order, no shortcut:

1. **CrUX at URL level** (real user data, 28 d).
2. No URL-level data → **CrUX at origin level** (domain aggregate). Go there before concluding: missing URL-level data is common.
3. Neither → **that is a finding, but not a performance finding**. Google lacks the real visits to compute the metrics. The bottleneck is audience. Write it as such and move it to the SEO axis.

CrUX's minimum traffic threshold is not published by Google: do not put a number on it.

### 7.3 Lab measurement protocol (when field data is missing)

The lab does not replace the field, it **orients the diagnosis**. Conditions to freeze, otherwise two audits are not comparable:

1. **PageSpeed Insights API** — CrUX field + lab in one call. ⚠️ The anonymous quota runs out (observed 2026-07-30); plan for a key or the fallback below.
2. **Chrome DevTools (MCP)** — `emulate` with `cpuThrottlingRate: 4`, `networkConditions: 'Slow 4G'`, `viewport: 412x915x2.625,mobile,touch`; then `performance_start_trace` (reload); then `performance_analyze_insight` on `LCPBreakdown`.
3. **At least two pages**: the home AND a typical content page. They diverge sharply (measured on one site: 1,919 ms versus 1,090 ms).

Real weight of the JS served, independent of framework and build (measures what the visitor downloads, not what the build reports):

```bash
#!/usr/bin/env bash
# usage: ./jsweight.sh https://example.com https://example.com/a-page
ORIGIN="$1"; URL="$2"
curl -s "$URL" \
  | grep -oE 'src="[^"]+\.js"' | sed 's/src="//; s/"$//' | sort -u \
  | sed "s|^/|$ORIGIN/|" | grep '^http' \
  | while read -r u; do curl -s -o /dev/null -w "%{size_download}\n" "$u" -H "Accept-Encoding: gzip"; done \
  | awk '{s+=$1; n++} END {printf "%d JS files, %d gzip bytes (%.0f KB)\n", n, s, s/1024}'
```

Tested 2026-07-30 (output: `11 JS files, 210226 gzip bytes (205 KB)`). Put it in a file rather than pasting it as one line. `awk` rather than `paste -sd+ | bc`: BSD/macOS `paste` refuses stdin without an argument.

⚠️ **This script both under-counts and over-counts. Do not use it alone for a defensible figure:**
- it **misses deferred chunks** (a dynamic `import()` does not appear in the initial HTML — on the reference site, 52 KB of GSAP escaped the count);
- it **counts chunks carrying the `noModule` attribute** (`core-js` polyfill, 38 KB wire) that **every modern browser ignores**;
- with `-o file`, `curl` **does not decompress**: `Accept-Encoding: br, gzip` without `--compressed` writes binary, and every subsequent grep silently returns nothing. Use `--compressed`.

Reference measurement, in-browser, after scrolling to the bottom (captures deferred chunks, naturally excludes `noModule`):

```js
// Chrome DevTools MCP: evaluate_script after navigate_page + scroll
const js = performance.getEntriesByType('resource').filter(e => e.name.endsWith('.js'));
({ n: js.length,
   wireKB: Math.round(js.reduce((s,e) => s + e.transferSize, 0) / 1024),
   rawKB:  Math.round(js.reduce((s,e) => s + e.decodedBodySize, 0) / 1024) })
```
⚠️ `transferSize` is 0 on a cache hit: navigate with `ignoreCache: true`, or take wire bytes from `curl --compressed` and raw bytes from the browser.

**Attributing CPU work to the real culprit** — hook `requestAnimationFrame` through `initScript` and count by stack trace over a window of total inactivity. This is what allowed 100 % of the work to be charged to the animation layer rather than the framework runtime:

```js
// navigate_page initScript
window.__st = {};
const _r = window.requestAnimationFrame;
window.requestAnimationFrame = function (cb) {
  const s = new Error().stack.split('\n').slice(1, 4).join(' | ');
  window.__st[s] = (window.__st[s] || 0) + 1;
  return _r.call(window, cb);
};
// then, after 5 s with no interaction: Object.entries(window.__st).sort((a,b) => b[1]-a[1])
```
A rAF loop still running at rest (measured: 620 calls over 5 s of inactivity on a pure-text page) is a CPU/battery finding even when LCP and CLS are green.

### 7.4 Reading an LCP

LCP breaks down into **4 official sub-parts**, and the lever depends entirely on which one dominates:

| Sub-part | Matching lever |
|---|---|
| **TTFB** | hosting, CDN cache, server rendering |
| **Resource Load Delay** | late resource discovery: `preload`, priority, position in the HTML |
| **Resource Load Duration** | weight and format of the LCP image |
| **Element Render Delay** | critical CSS, fonts (`font-display`), blocking JS |

When the LCP element is **text**, both resource sub-parts are 0: only TTFB + render delay remain. **A render delay accounting for 90 %+ of LCP points at CSS and fonts, not at the JS bundle.**

Two corroborations, not to be conflated:
- `RenderBlocking` at 0 ms estimated savings = **no blocking resource to fetch**. It says nothing about JS loaded `async`/`defer`, which is never blocking by construction.
- JS can only hurt **after** render, through long tasks monopolising the thread. That is verified separately, in the trace, and it is what feeds INP (§7.5).

Concluding "the JS costs nothing" therefore requires both: no render blocking **and** no long task under throttling.

### 7.5 What a load trace does NOT measure

**INP.** A load trace produces no value for it: the metric requires real interactions. Yet that is precisely the metric a heavy JS bundle degrades.

Defensible consequence: "the JS hurts responsiveness" **cannot** be concluded from a load trace. Either you have field INP (CrUX), or you measure by interacting, or you write that **it is not measured**. Green LCP and CLS say nothing about INP.

### 7.6 Decision grid

| Observation | Becomes a finding if… | Otherwise |
|---|---|---|
| Heavy bundle | field INP > 200 ms, **or** long tasks measured under throttling — and then the finding names the **cause attributed by stack trace**, never "the framework" | noted as an observation, no priority |
| rAF loop active at rest | always (CPU/battery), even with green LCP and CLS. Count the calls over a window of total inactivity | — |
| Animation dependency loaded under `prefers-reduced-motion` | always: it is a11y (WCAG 2.3.3) **and** weight. Check the guard precedes the `import()` rather than sitting inside the init function | — |
| Field LCP > 2,500 ms | always | — |
| Dominant render delay | yes, with the lever named (CSS / font) | — |
| CLS > 0.1 | always, with the cause identified (image without dimensions, font, injection) | — |
| No CrUX data (URL and origin) | **audience** finding, SEO axis | never a performance finding |

### 7.7 Anti-patterns

- **Concluding performance from bundle weight.** Measured: 205 KB of JS for 0 ms of impact on LCP and FCP.
- **Recommending a framework migration on that observation alone.** On ranking URLs this is judged on SEO risk and cost, never on technical comfort. Green field CWV → write **NOT RETAINED** in the report; red → attribute the degradation to a measured cause before mentioning a rewrite.
- **Charging the framework for weight that comes from an application dependency.** Break the bundle down chunk by chunk and grep the served content before concluding. Measured: of 219 KB, 52 KB came from the animation layer — a migration would not have removed them.
- **Forgetting that a "zero JS" framework's gain depends on the shell.** An interactive header present on every page, built as an island of the UI framework, brings its runtime back everywhere and cancels the gain. Before costing a migration: count the client components in the *layout*, not those in the pages. If the gain comes from rewriting the shell in vanilla, that work is doable without migrating — and that, then, is the recommendation.
- **Serving a lab Lighthouse as field evidence.** Two different things: the report must say which one it shows.
- **Measuring a single page** and generalising to the site.
- **Promising positions** in exchange for improved CWV.

## 8. Known audit traps

- Sitemap `lastModified: new Date()` → churn that destroys the signal.
- **A rendered title over 60 characters is a finding, not a tolerance** (rule corrected 2026-07-31; the earlier version of this document tolerated the overflow when the keyword was front-loaded — measurement says otherwise, see §10).
- `content-visibility:auto`: axe-core contrast false positives (force visible before scanning — validated 16→0 violations) and full-page captures with empty sections (Chromium artefact, not a bug).
- QA scripts silently broken after a component change (stale selector) → revalidate the selectors on every change to the targeted DOM.
- "Popular" badge on the cheapest tier → the anchor should point at the middle/high tier.
- Domain still on noindex while the content plan is being written → prerequisite §1.
- Recommending a framework migration, or any other performance project, without measurement → §7 (the sequence there is defensible).

## 9. Competitor analysis (method proven twice on a competitor in the same sector)

1. **Identity sheet**: legal registry (national company register), technical stack (template leaks, generator, CMS), externally verifiable reputation (LinkedIn, Trustpilot, press with URLs) — never a reputation claim without a link.
2. **Full sitemap inventory**: every URL in the competitor's sitemap, mapped into clusters with each one's role (money, editorial, programmatic, legal). Volume per cluster.
3. **Page-by-page dissection** of a broad sample (30+ pages): real hn structure, JSON-LD, internal linking, CTA, proof displayed.
4. **Gap analysis verified ON BOTH SIDES**: every "they do X and we don't" is verified by grepping OUR code (not only theirs) — half of the assumed gaps already exist internally.
5. **Three-column deliverable**: "they do it better → adopt, adapted" / "we do it better → keep and defend" / "their mistakes → items added to our QA checklist".
6. **Effort × impact action plan WITH deliberate non-actions**: what we decide NOT to copy, justified (E-E-A-T dilution, outside the offer's scope).
7. **Re-audit after every competitor redesign**: a competitor can fix 13 anti-patterns in a single redesign — measuring their execution velocity is part of the benchmark (and their redesign can also make them LOSE their GEO layer: check both directions).

## 10. Scripted post-build checks (what the build does not produce)

Three measurements no `tsc`/`eslint`/`build` catches and a third-party SEO tool hides. They run **after** the build, on the rendered HTML.

### 10.1 Title budget
Measure the **rendered** title, brand template included, not the source `metaTitle`. Google truncates around **60 characters**: a 13-character ` | Brand` template caps sources at **≤ 47**.

The source title never carries the brand — pages imported from an old CMS often do, producing "- Brand | Brand" plus titles over 70.

Measured on the audited site (Search Console, 2026-07-31): **40 titles across 92 ranking pages exceeded 60 rendered characters, 29 of them on pages ranking 1 to 20**; 103 titles corrected. That figure is what invalidated the "front-loaded keyword" tolerance in §8.

### 10.2 Duplication across a page cluster
Measure **per cluster**, with city name and demonym neutralised: body Jaccard, title Jaccard, **boilerplate rate** (blocks appearing identically in ≥ 3 pages) and worst pair.

⚠️ **The pairwise average dilutes boilerplate.** One cluster showed 3.5 % mean body Jaccard for **17.7 % of blocks copied across ≥ 3 pages** — the services list, identical from city to city. Concluding "low duplication" from the average alone is a method error.

Defensible thresholds: body 15 %, titles 15 %, boilerplate 5 %, worst pair 20 %. After correction on the measured cluster: titles 30.3 % → 1.8 %, boilerplate 17.7 % → 0 %, worst pair 35.3 % → 6.8 %.

### 10.3 Orphan pages
Count inbound links across **all rendered HTML**. Two levels: no inbound link = **fail**; page linked only from the menu or footer = **warning**.

⚠️ Third-party tools count **sitewide** links: a page in the menu shows hundreds of inbound links for **zero editorial link**. Measured case: 8 pages reported at 195 inbound links each, none with a link from a page body.

Keep a written, owned allowlist (technical routes, report pages), otherwise it gets reconstructed from memory at every audit.

### 10.4 `og:url`
Check **page by page**, never by sample: an OpenGraph helper that takes no path cannot set it, and a first partial fix then corrects only one page. 36 pages shipped without `og:url` on the audited site (2026-07-30). Next **replaces** the layout's `openGraph` object as soon as a page declares one, so `og:image` must be repeated per page.
