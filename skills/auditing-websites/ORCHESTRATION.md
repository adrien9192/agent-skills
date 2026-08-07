# Audit orchestration — agents, contracts, scales, deliverable

> Operating manual for the Process in SKILL.md: who launches what, with which prompts, in what output format, how to reconcile, how to score, what to deliver. Companion to AUDIT-METHOD.md (the substance) and QUALITY-REVIEW.md (the grids).

## 1. Sizing & prerequisites

- **Brochure site ≤ 10 pages** (tradesperson, local business): 3 collectors are enough (technical+SEO merged, CRO/UX, GEO); clusters/cannibalisation/consolidation are usually out of scope; add the local SEO annex (§10). **Site with 30+ pages / e-commerce**: 5 full axes + competitors.
- **Blocking prerequisite** (Process step 1): if the domain is on noindex or unindexed, keep going — deliver the full audit with indexability as the ONLY P0 item and everything else explicitly conditioned on its resolution.
- **Detecting a 100 % JS site** (fatal for a curl audit): if the home's raw HTML holds under 5 KB of useful text, or `<body>` is nearly empty next to large bundles → switch collection to Playwright (`page.content()` after networkidle) and NOTE it in the report (the GEO citability of a 100 % JS site is itself a finding).
  Two ways to render it: local Playwright, or `assets/kitesurf.mjs content <url>`, which runs Cloudflare's Browser Run from outside your network and needs no local browser. The free tier allows one request per 10 seconds and 10 minutes of browser time per day, so it suits a handful of pages and an outside vantage point, never a 40-page sweep — that stays with Playwright.

## 2. Finding contract (shared by all collectors)

Each collector returns ONLY a JSON list — no conclusion, no score:

```json
{ "id": "seo-03", "axis": "seo", "url": "https://…/page", "claim": "meta description missing",
  "evidence": "raw excerpt (HTML/code/screenshot) quoted",
  "verify_cmd": "curl -s https://…/page | grep -c 'name=\"description\"'",
  "proposed_tier": "P1", "confidence": "high|medium|low" }
```

The **`verify_cmd` field is mandatory**: whoever makes the claim supplies the exact command that can refute it. A finding without a replayable `verify_cmd` is inadmissible. `id`s are **unique within the axis** (two findings sharing an id would silently share a verdict). A command that cannot **fail differently** refutes nothing: `curl -o /dev/null -w '%{http_code}'` returns 200 whether the page rendered or redirected to a login. Before accepting a `verify_cmd`, apply the falsifier question from the `proof` skill: *if this claim were false, what would this command have printed instead?* No different output, no usable probe.

## 3. Collection fan-out

Launch in PARALLEL (Task tool or workflow §12), one agent per row. Prompts are self-sufficient: each agent gets the domain, the repo path (when available), the paths of the skill files to read, and the §2 contract.

| Axis | Model | Reads | Collects |
|---|---|---|---|
| Technical + semantic SEO | sonnet | AUDIT-METHOD §1,3,4,6 | indexability, canonical/hreflang, meta, cannibalisation, internal linking, orphans, sitemap |
| GEO | haiku | AUDIT-METHOD §5 | llms.txt, markdown negotiation, robots + AI bots, RSS, raw JSON-LD, visible freshness | Plus one outcome probe: run the client's target queries through ChatGPT, Perplexity and Google AI Overviews and record who gets cited (method: `ai-seo`). It cannot satisfy the falsifier test, so it lands **directional** like §8, never CONFIRMED, and never in scoring.
| Design/UX anti-slop | sonnet | QUALITY-REVIEW §1 | design read preserve/redesign FIRST, captures at 390/768/1440, quantified grid, real tag hierarchy in the code |
| CRO/copy | sonnet | QUALITY-REVIEW §3 | single conversion goal per page, 5 frictions, every critique WITH a proposed rewrite |
| Code/perf/a11y | sonnet | QUALITY-REVIEW §2,4,5 + **AUDIT-METHOD §7** | field CWV (CrUX URL then origin) BEFORE any lab work; throttled mobile trace per the §7.3 protocol on at least 2 pages (home + content); images, forms (anti-spam), tracking versus privacy policy, audit-local.mjs when a repo is available. **Bundle weight is not a finding** (§7.6) and INP cannot be concluded from a load trace (§7.5) |
| Competitor (×N) | haiku | AUDIT-METHOD §9 | one normalised sheet per competitor (same fields for all → comparison table with no reprocessing) |

Models = routing matrix (haiku for mechanical checklists, sonnet for judgement). Run the tooled external audit (Semrush/Ahrefs when licensed) in parallel with all of this; otherwise §8.

**No competitors supplied → automatic discovery** (before the scouts): web search on the client's 5-10 target queries (+ a "{service} {city}" variant for a local business); keep the 3-5 domains recurring in organic results, EXCLUDING directories, marketplaces, media and aggregators (Yelp, Amazon, press) — a competitor is a site selling the same thing to the same audience. Validate each in one line in the report (why it was kept).

**Collector prompt template**:
> You are auditing {domain} on the {axis} axis. First read {paths of the skill sections}. Collect via RAW curl (protocol §4) {+ read the code in {repo} if supplied}. Return ONLY a JSON list of findings matching this contract: {contract §2}. Do not conclude, score, recommend, or claim "missing" without quoting the raw HTML you downloaded.

## 4. curl protocol & reconciliation

**Canonical commands** (identifiable UA, never a fetch that strips `<script>`):
```bash
curl -sIL "$URL"                                    # status, redirects, X-Robots-Tag
curl -s "$URL" -A "AuditBot (+contact)"             # full raw HTML
curl -s "$URL" > page.html   # then robust JSON-LD extraction: see §11 (never a line-by-line grep — it is multiline)
curl -s -H 'Accept: text/markdown' "$URL" -D - -o /dev/null | grep -i 'vary\|content-type'
curl -s "$DOMAIN/robots.txt" | grep -iE 'gptbot|claudebot|perplexitybot|google-extended|content-signal'
```

**Reconciliation (Process step 3) — exact mechanics**:
1. EVERY finding goes to fact-check — claim by claim, NEVER by sample. Fan out the `site-fact-checker` agent (haiku) in batches of ~10 findings.
2. The checker runs the `verify_cmd` as written and returns a verdict: **CONFIRMED / REFUTED / UNVERIFIABLE** + raw evidence.
3. Collector/checker disagreement → a second check from a different angle (code instead of production, or the reverse); still divergent = UNVERIFIABLE.
4. Only CONFIRMED findings enter scoring. REFUTED ones are archived WITH their evidence in an annex (anti-recurrence case law for later audits). UNVERIFIABLE ones are listed separately and never promoted.

## 5. Scoring scale (per axis, /10)

| Score | Anchor |
|---|---|
| 9-10 | No confirmed P0/P1 finding; the axis is a differentiator |
| 7-8 | Sound foundations, minor P1s; optimisations bring marginal gains |
| 5-6 | Functional but with real leaks (multiple P1s); fixes bring measurable gains |
| 3-4 | At least one confirmed P0 or a systemic P1; the axis structurally underperforms |
| 1-2 | The axis is broken (not indexed, dead form, unreadable design) |

- **Potential score** = the REALISTIC ceiling for this domain (authority, budget, offer scope) — not the theoretical maximum. A new domain caps around 7 on SEO at 6 months whatever is done.
- **Main blocker** = THE finding preventing a move up one tier (exactly one per axis).
- KD threshold: new domain OR low authority (few referring domains, 100 % branded traffic) → KD ≤ 20 first; the rule follows real authority, not domain age.

## 6. Action plan — template

Fixes in 4 tiers, each item:
`| # | Item | Axis | Effort (S/M/L) | Expected impact | Depends on | Owner (agency/client) |`
- P0 = blocking this week (indexing, broken form, legal compliance — the last one deployed ON ITS OWN).
- Client gates (missing data: price, testimonial, lead time) = items marked **[CLIENT GATE]**, never closed by invention.
- CONTENT roadmap kept separate, in time phases (AUDIT-METHOD §2).

## 7. Deliverable

ONE markdown file, in the client's language, with an imposed structure:
1. **Meta header** (required by the method): date, tools used, page sample, agents launched.
2. **Executive summary — 3 bullets max** (including the H1/H2 verdict when the brief is a conversion problem, see §9).
3. Scoring table per axis (current / potential / blocker).
4. Confirmed findings per axis (with evidence).
5. 4-tier action plan + content roadmap.
6. Annexes: discarded false positives (with evidence), unverifiables, competitor sheets.

Default audience = the client decision-maker (plain language, every item actionable); internal backlog version on request.

## 8. Fallback with no third-party SEO tool (the normal case for a small client)

- Manual SERP: 5-10 target queries in private browsing (+ a localised "{service} {city}" variant); record the site's position and the 3-5 competitors that rank.
- Volumes: Google suggestions/autocomplete + "related searches" + Google Trends in relative terms. Label ALL of it "directional" in the report — never present it as a measurement.
- E-E-A-T legitimacy (is the offer actually sold) and SERP intent are judged without tooling: read the real SERP.

## 9. Proprietary data to request from the client (BEFORE concluding)

Access or exports: **Search Console** (impressions/clicks/queries), **Analytics** (traffic, sources, conversions), history of forms/calls received.
- Triaging the "no leads" symptom: GSC ≈ 0 impressions → **H1: visibility problem** (SEO/technical); real traffic but 0 conversions → **H2: CRO/trust problem**. The audit weights the axes according to H1/H2.
- Access refused or non-existent → a "blind" audit is possible, but note it in the header and keep the H1/H2 verdict as a hypothesis.

## 10. Local SEO annex (tradespeople, shops, practices)

The highest-return axis for a local business, added to the fan-out (haiku):
- **Google Business Profile**: existence, exact category, reviews (volume/rating/replies), photos, posts.
- **NAP consistency** (name/address/phone): site versus GBP versus directories (Yelp, trade directories).
- **Local citations** + local backlinks (town hall, chamber of commerce, trade associations).
- On the site: `LocalBusiness` (exact trade sub-type) with geo/openingHours, phone as `href="tel:"` visible on mobile, explicit service area, city pages only when anchored in something locally real.

## 11. Scriptable JSON-LD validation

The Rich Results Test (web, not scriptable) stays the FINAL manual gate. In an agent:
```bash
# robust extractor (multiline JSON-LD, reordered attributes) — never a line-by-line grep
curl -s "$URL" | python3 -c '
import sys, re, json
html = sys.stdin.read()
blocks = re.findall(r"<script[^>]*application/ld\+json[^>]*>(.*?)</script>", html, re.S | re.I)
print(f"{len(blocks)} JSON-LD block(s)")
for i, b in enumerate(blocks): json.loads(b); print(f"block {i+1}: valid JSON")'
```
then check the business invariants by hand: BreadcrumbList ≥ 2 items, a single Person @id everywhere, Review/AggregateRating only with real ratings, exact LocalBusiness sub-type.

## 12. Turnkey audit (workflow) + fallback

- **With the Workflow tool**: `Workflow({scriptPath: "<base directory of this skill>/assets/workflows/audit-site.mjs", args: {domain, repoPath?, competitors?, mode: 'full'|'geo-regression'|'pre-launch', compareTo?, small?, skillDir?}})` — the base directory is the one announced when the skill loads; an absolute path is required (no tilde); `compareTo` = the old site for geo-regression; `small` = site ≤ 10 pages (3 collectors, §1); `skillDir` = the skill root when the copy is replicated. The script covers collection + reconciliation (steps 2-3) and returns findings that are ALREADY verified; scoring, review and the plan (steps 4-6) stay in the main thread and are never delegated.
- **Without the Workflow tool**: parallel Tasks on the §3 collectors (with the listed models), then a `site-fact-checker` fan-out in batches of 10, then §4-§7 in the main thread.
