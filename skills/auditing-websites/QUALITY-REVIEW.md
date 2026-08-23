# Quality review: design taste, Socratic pass, CRO, images

## 1. Anti-AI-slop design review

**Protocol**: (1) establish the "design read" — **preserve** mode (existing identity is intentional and documented, protect it) or **redesign** — and set the dials (variance/motion/density) BEFORE judging; (2) desktop+mobile captures on a sample of each page family + a check in the code (real tag hierarchy, not the rendered look); (3) separate what the grid VALIDATES (intentional choices) from what it FLAGS (slop to fix).

**Slop pattern catalogue (quantified rules)**:

| Pattern | Rule |
|---|---|
| Eyebrows/labels above every heading | max ~1 per 3 sections |
| "All cards" page (same grid across 5-6 sections) | 1 layout family max 1×/page; vary: ruled lists, full-width bands, rails |
| Overloaded hero (eyebrow + long title + chips + multiple CTAs + tagline) | max ~4 elements, title ≤ 2 lines, subtext ≤ 20 words |
| Multiple marquees/carousels | max 1 per page |
| CTAs with duplicated intent (4+ labels for the same action) | 1 label per intent, everywhere |
| Repeated light/dark flips | 1 deliberate flip max (e.g. the final CTA) |
| Nav overflowing at intermediate breakpoints | test the real burger switch boundaries |
| No active nav state | low-effort a11y/UX fix, always |

**False positives not to "fix"**: locked, documented brand identity (signature colour, character typeface); a generic UX pattern that is discouraged but functionally justified (FAQ accordion + FAQPage schema); capture artefacts (`content-visibility:auto`); **an entrance animation frozen in a screenshot** (element at `opacity:0`/translated before its GSAP trigger → a "missing element" that is in fact animated — force the end state or check the `navigator.webdriver`/`prefers-reduced-motion` gating before flagging).

**Design versus SEO arbitration = an owned, documented divergence**: when the design grid and SEO interest contradict each other (e.g. a 3-line keyword-loaded h1), do not settle it silently — record the explicit decision ("h1 kept for SEO, font size reduced for design") in the report, so the next audit does not "correct" the arbitration.

## 2. Socratic review

Format: a numbered list of closed questions, each → short answer → **explicit Decision** (applied OR deferred gate). Two granularities: full greenfield (~50 questions), post-change delta (~15-20 on what changed). Grid of 7 categories:

1. **Conversion & CTA**: clarity of the primary CTA, single intent, friction, no dead end after success, stated lead times, required versus optional fields distinguished.
2. **Accessibility**: aria-live on async errors/successes, focus outline never removed, legitimate alt text (decorative images at `alt=""`), measured contrast, menu focus (Escape → trigger), heading hierarchy, accessible name for link cards, **`prefers-reduced-motion` actually disables animations and video autoplay** (WCAG 2.3.3 — the media query present AND the motion layer covered, not just one transition).
3. **Performance**: format/priority/lazy according to LCP role, heavy JS libs arbitrated (bundle cost versus risk), fonts, decoration in CSS rather than JS, minimal client scope, content-visibility on long pages, **entrance animations (h1 split-text, counters, parallax) that shift no layout and delay no LCP** (reserve the space, animate `transform`/`opacity` rather than geometry).
4. **SEO/GEO**: unique, calibrated meta, coherent canonical + hreflang, valid structured data, descriptive anchors, fresh sitemap, FAQ schema only when the content is visible, agent/LLM readability, OG images, visible breadcrumb = schema.
5. **Content & voice**: banned tics, generic AI vocabulary, negative parallelism, action-verb CTAs, keyword titles that keep the voice, sourced and dated stats, never invented.
6. **Trust**: privacy policy versus real tracking (a mismatch is legal non-compliance, top priority, deployed alone), zero fabricated testimonial/logo/review, embodied E-E-A-T, no invented price, explicit gates.
7. **Robustness**: anti-spam/rate-limit on public forms, redirects versus Search Console data, branded 404, no-JS degradation consciously assessed.

**Deployment discipline**: surgical fixes, a status per item (to do/ok/fixed/open), deploy in coherent batches — EXCEPT legal compliance/security: immediate and separate.

**Gate, do not fabricate**: a real opportunity blocked by missing data (response time, testimonial, price) → an open item depending on the client, never closed by invention.

## 3. CRO / copywriting audit

Establish the page's **single primary conversion goal** first. 5 frictions to hunt:
1. Positioning too broad, diluting the core offer (a title drifting into generalist language).
2. CTA judged on its **specificity of value**: low, concrete perceived commitment beats a correct generic one.
3. Proof phrased defensively ("we don't do X") → rephrase positively (method, deliverables).
4. A secondary differentiator (technology, buzzword) visually over-represented against the main offer.
5. Abstract benefits → "what the visitor concretely gets".

Rewriting: clarity before style; the main offer's keywords up front; CTA = the next low-commitment step; honest proof only; address the status-quo objection; every internal page lets the reader **choose between concrete actions** (fix/rebuild/migrate/optimise) rather than only describing. Final pass: less jargon, concrete sector benefits, human tone, action verbs.

## 4. Image / performance audit

- Every public page: ≥ 1 meaningful image with alt text (script-verifiable).
- Heavy sources → compressed WebP (~< 100 KB target); explicit dimensions (CLS).
- Original assets or official logos **stored locally** (never hotlinked: dependency + licensing).
- LCP: the candidate image explicitly prioritised (priority/preload) — or no image at all on the LCP (a text/SVG hero removes the whole risk class); below the fold = lazy.
- Alternate visual types (photo, diagram/SVG, real logo) — a run of near-identical generated illustrations is an AI tell.
- Favicon/manifest on the real brand. Assets reproducible in the deployed repo.
- **Explainer videos (offline Remotion or other)**: the `.mp4` source served with a **200** (recurring trap: rendered at build time? not regenerated = a 404 block), `poster` attribute present (avoids a blank frame + CLS), explicit dimensions/ratio, `autoplay` always `muted playsInline`, disabled under `prefers-reduced-motion`. Script-verifiable (`audit-local.mjs` now tests every `<video>`).

## 5. Automated QA (pattern `assets/audit-local.mjs`)

Loop over pages × breakpoints (mobile/tablet/desktop): HTTP 200, single h1, no horizontal overflow, meta description 50-170 chars, absolute canonical, JSON-LD present, image+alt, every `<video>` (source 200 + poster + muted autoplay), mobile menu visible, axe-core scan, console errors, failed requests. Separately: machine routes (robots, sitemap, llms.txt, manifest) at 200 with the right content-type; API routes tested with an invalid payload (no crash). Adapt the page/domain list; revalidate the selectors on every component change.

## 6. Animation & video layer (GSAP / Remotion)

A premium site built with the sibling skill `building-premium-sites` ships a motion layer (GSAP + Lenis, an `engine.ts`-style engine) and explainer videos rendered offline (Remotion → self-hosted `.mp4`). **An audit does not write that layer — it judges it**, like everything else. It is a cross-cutting Design/UX + accessibility + performance axis. Checklist:

| Check | Axis | Concrete failure |
|---|---|---|
| `prefers-reduced-motion` disables animations AND video autoplay | a11y (WCAG 2.3.3) | animation that cannot be disabled = accessibility fail |
| Every referenced `.mp4` served with a **200** (not 404) | pre-launch / robustness | recurring trap: video not re-rendered at build → 404 block in production |
| `<video>`: `poster` + explicit dimensions | perf (CLS) | blank frame on load, layout shift |
| `autoplay` always `muted playsInline` | robustness | browser policy blocks unmuted autoplay |
| Entrance animations (h1 split-text, counters, parallax) reserve their space | perf (CLS/LCP) | animated h1 shifting content / delaying LCP |
| `navigator.webdriver` gating (+ reduced-motion) on the motion engine | audit method | without it, QA captures are non-deterministic → "missing element"/contrast false positives |

`audit-local.mjs` automates part of this (video source 200, poster, muted autoplay); reduced-motion, CLS/LCP and webdriver gating stay a code review (grep the motion engine and the media query). Anything that **writes or modifies** the animation belongs to `building-premium-sites` / `design-taste-frontend`, never to this skill.

### Scroll-timeline branch

When the site plan marks a `scroll experience` gate or rendered markup contains
`[data-scroll-experience]`, ordinary screenshots are insufficient: each scroll position is a
different state. Run `assets/audit-scroll.mjs` at desktop, mobile and reduced motion. It sets the
explicit `window.__BUILD_SITE_MOTION_AUDIT__` flag before application code loads; ordinary Axe
and screenshot runs do not set it and therefore keep the deterministic webdriver fallback.

The page must expose the contract from
`building-premium-sites/SCROLL-STORYTELLING.md`: stable acts, cues, scrub videos, pan tracks and
rendered-state signatures for bespoke fixed stages. The audit fails on dead scroll, cues that
never reach full opacity, frozen scrub clips, rails without meaningful overflow/travel, runtime
errors and failed requests. An intentional hold is accepted only while
`data-scroll-verify-hold="true"` is visibly active.

Read every generated `sheet.png`. Reconcile mechanical findings with the planned feeling curve,
peak, reduced-motion equivalent, keyboard reachability, mobile crop and dynamic text contrast.
The harness proves state change; it does not prove composition, pacing or meaning.
