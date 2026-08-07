---
name: auditing-websites
description: Use when auditing an existing marketing, showcase or e-commerce website. Branches - no organic visibility (SEO audit, "personne ne me trouve sur Google"), never cited by ChatGPT or Perplexity (GEO audit), site that does not convert (CRO audit), cannibalised or duplicate pages, internal linking or semantic silo audit, pre-launch quality review, competitor benchmark, verifying a redesign lost no SEO or GEO, site too slow or too JS-heavy ("faut-il migrer vers Astro"). FR and EN.
---

# Auditing websites

## Overview

A multi-axis audit (Design/UX, Code, SEO, GEO, CRO): cross a tooled external audit with an internal multi-agent one, **reconcile** them, score per axis, then prioritise into four tiers.

**Reconciliation** is the word this skill turns on. Tools and agents both produce recurring false positives; a claim becomes a finding once its `verify_cmd` has been replayed by `site-fact-checker`, never before.

**Short on time, with checks outstanding?** The deliverable still ships, carrying the CONFIRMED findings **alone**. Everything else goes to an appendix named "signals collected, verdict pending": no score, no priority, no effort or gain estimate. This is not a truncated report. **The sorting IS the deliverable.** An audit that states "51 signals collected, 12 reconciled, 9 confirmed, 3 disproved" sells its method; one that ships 51 raw lines sells a tool export. Put that count in the executive summary: it is what justifies the price.

**Labelling is not reconciling.** A per-row status, a "not verified" mention, a confidence colour code: these look rigorous and let into the deliverable exactly what reconciliation exists to keep out. A committee lifts rows and projects a table; the label does not survive the copy-paste, the claim does.

## Process

1. **Prerequisites**: an indexable canonical domain (no noindex, canonicals aligned). Otherwise indexability becomes the ONLY P0 and everything else waits on it. Request the **first-party data** (Search Console, Analytics, lead history — `ORCHESTRATION.md` §9) to separate a visibility problem from a conversion one.
   *Done when*: indexability status is written down, and first-party data is either received or explicitly refused by the client.
2. **Double collection**: third-party SEO data (directional) plus an internal multi-agent audit in parallel — axes, models, prompt templates and the finding contract (`verify_cmd` required): `ORCHESTRATION.md` §2-3. Method background: `AUDIT-METHOD.md`. Without a third-party SEO tool: `ORCHESTRATION.md` §8. Local trade or retail → GBP/NAP appendix (`ORCHESTRATION.md` §10).
   *Done when*: every axis in scope has returned its findings, each carrying a `verify_cmd`.
3. **Reconciliation**: EVERY finding goes to `site-fact-checker` (fan out in batches of 10); the main thread delegates this verification. Exact mechanics: `ORCHESTRATION.md` §4.
   *Done when*: every finding carries a verdict. Non-CONFIRMED ones go to the false-positive appendix, not to scoring.
4. **Per-axis scoring**: current score / potential score (realistic ceiling) / main blocker — scale: `ORCHESTRATION.md` §5. Include the CRO axis when the brief is a conversion problem.
   *Done when*: every axis in scope carries its three values.
5. **Quality review**: design anti-slop, seven-category socratic review, CRO copy, images and performance → `QUALITY-REVIEW.md`. Automated QA: `assets/audit-local.mjs` (generic — set the `AUDIT_*` variables).
   *Done when*: the seven socratic categories are through and `audit-local.mjs` has run on all three breakpoints, output attached.
6. **Action plan**: four tiers plus a phased content roadmap; a single markdown deliverable with an imposed structure: `ORCHESTRATION.md` §6-7.
   *Done when*: every CONFIRMED finding sits in a tier, and the false-positive appendix is written.

## Turnkey audit (multi-agent)

For a full audit, run the workflow — reconciliation is structural there:

`Workflow({ scriptPath: "<base directory of this skill>/assets/workflows/audit-site.mjs", args: { domain, repoPath?, competitors?, queries?, noCompetitors?, mode: "full" | "geo-regression" | "pre-launch", compareTo?, small?, skillDir? } })`

The base directory is the one announced when this skill loads. Absolute path required, no tilde. If the skill is replicated elsewhere, pass that same path as `skillDir`. Competitors left unset are discovered automatically, unless `noCompetitors: true`.

**No `domain` given and cwd is a site repo → automatic inference**, in strict order: 1. `CNAME` → 2. `vercel.json` / `netlify.toml` → 3. framework config (`astro.config.*` site, `next.config.*` metadataBase/siteUrl) → 4. `package.json` homepage. Announce "domain detected: X (source: Y)" before launching — auditing the wrong domain invalidates everything upstream of reconciliation. Several plausible candidates (monorepo, staging against production) → list them and ask.

It returns findings already reconciled; steps 4-6 stay with the main thread. Without the Workflow tool: parallel Tasks on the collectors (`ORCHESTRATION.md` §3), then fan out `site-fact-checker` in batches of 10.

## Quick reference

| Situation | Rule |
|---|---|
| Pages cannibalising each other | Consolidate to one canonical URL (the best-ranking or the most generic); **308** for an internal merge, 301 for a structural migration with the mapping written BEFORE |
| A page with any live ranking, however small | Redirect first, always, before any removal |
| Files of removed pages | Kept (rollback plus equity), pulled from build, menu and sitemap |
| **Titles, cluster duplication, orphans, `og:url`** | Four measurements the build does not produce and a third-party tool hides, to run against rendered HTML: **rendered** title ≤ 60 (so source ≤ 47 with a brand template), **boilerplate** rate alongside the mean Jaccard that dilutes it, **editorial** inbound links rather than sitewide ones, `og:url` page by page. Measured figures, defensible thresholds and traps: `AUDIT-METHOD.md` §10 |
| A new keyword | Volume × KD × **E-E-A-T legitimacy** (an offer actually sold); low authority → KD ≤ 20 first |
| Summing volumes | Deduplicate overlaps before summing |
| A delivered redesign | `audit-site` workflow in **geo-regression** mode with `compareTo` (llms.txt, RSS, markdown negotiation, JSON-LD) — a competing site lost all of it in a redesign |
| Missing data (testimonial, price, lead time) | **Gate**: a [CLIENT GATE] item stays open, closed by the client alone |
| A legal-compliance finding (tracking against the privacy policy) | Ships on its own, immediately |
| Competitor benchmark | Seven-point method: `AUDIT-METHOD.md` §9 |
| A site built on a semantic silo | Its own grid, not the generic internal-linking rules: `AUDIT-METHOD.md` §6 bis |
| A silo conversion landing under the 5-link floor | A **deliberate exception**, named in the report: a single outbound link, so the conversion does not leak |
| A site with animations (GSAP) or video (Remotion) | Design/UX axis plus a11y and performance, audited like the rest: `prefers-reduced-motion` (WCAG 2.3.3), `.mp4` served as 200, CLS/LCP of entrance animations, `navigator.webdriver` gating. Detail: `QUALITY-REVIEW.md` §6 |
| Performance, JS weight, whether to change framework | Field BEFORE lab: CrUX URL → CrUX origin → if neither exists, that is an audience finding. Bundle weight does not predict CWV impact (measured: 205 KB of JS for 0 ms on LCP). Sequence, thresholds and decision grid: `AUDIT-METHOD.md` §7 |
| Responsiveness (INP) | Measured through interaction or read from CrUX. A load trace produces none: `AUDIT-METHOD.md` §7.5 |
| Model routing | Collectors that judge (seo/design/cro/code) = sonnet; mechanical checklists (geo/fact-check/scout) = haiku; scoring and plan = main thread |

## Red flags — STOP

Each row states the correct action; the rationalisation facing it is the one this skill blocks.

| What you do | The rationalisation it blocks |
|---|---|
| A finding enters scoring **after** its CONFIRMED verdict. The rest go to the false-positive appendix. | "The tool says so, no need to re-check" — documented false positives: JSON-LD "missing" because the tool filters `<script>`, preload ignored. |
| Reconciliation runs **claim by claim**. | "I checked 3 claims, the rest must be fine." |
| Verify, then score, then write. | "I'll write first and verify after" — writing first anchors the wrong conclusions. |
| An UNVERIFIABLE is reported as unverifiable. | "It's probably true, I'll log it as a likely finding." |
| Out of time: ship the CONFIRMED alone, the rest in a "verdict pending" appendix. | "I label every row 'not verified', that's honest so it's covered" — a per-row status survives neither the copy-paste nor the projector; the claim does. Labelling is not reconciling. |
| The sorting count goes in the executive summary. | "9 findings for €9,900 is expensive per line" — that pressure is exactly what gets unverified material published. 51 collected, 12 reconciled, 9 confirmed: the sorting is what you sell. |
| The motion and video layer is audited like every other axis. | "GSAP/Remotion is build work, not audit work" — reduced-motion is WCAG 2.3.3, a 404 on `.mp4` blocks pre-launch. |
| Validate JSON-LD by script, then Rich Results Test (`ORCHESTRATION.md` §11). | "The `<script type=\"application/ld+json\">` is there, so it's fine" — a BreadcrumbList with one item is worth nothing. |
| Force sections visible before a contrast scan or a capture. | "The section is empty / contrast fails" — a `content-visibility:auto` artefact. |
| Check the brand document before applying a generic ban. | "This pattern is a defect" — sometimes it is a documented identity or a working UX pattern (FAQ accordion plus schema). |

For a redesign following the audit: **REQUIRED SUB-SKILL** `design-taste-frontend`. To build or rebuild the site: skill `building-premium-sites`.
