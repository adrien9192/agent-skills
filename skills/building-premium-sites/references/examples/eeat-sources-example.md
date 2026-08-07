# Credible sources guide — worked example

E-E-A-T sourcing for the client's content: WordPress and Shopify sites, e-commerce, product data (PIM, DAM), business automation, AI, SEO/GEO, accessibility, GDPR.
Companion to `writing-guide-example.md`.

**This is an instantiated example.** The client is an archetype: a small B2B web agency serving the French market. Imitate the shape — the tiers, the catalogue tables, the usage column, the reliability hierarchy — and swap the sectors, markets and institutions for the real client's.

Purpose: give writers, human and agent, a reference set of official and authoritative external sources to cite in content (offers, glossary, articles, city pages), meeting Google's E-E-A-T criteria and the citation expectations of AI engines (ChatGPT, Perplexity, Claude, Gemini, AI Overviews).

**Guiding rule: sources are institutional or official.** Public bodies (.gouv.fr, .europa.eu), vendor and platform documentation (WordPress.org, Shopify, W3C, Google), recognised organisations (CNIL, ANSSI, INSEE, FEVAD) and standards (ISO, RGAA, WCAG). Competitor agency blogs, affiliate sites and marketplaces stay out, as sources and as links.

## 1. E-E-A-T criteria applied to the client

- **Experience**: the structural advantage is the founder's first-hand experience (seven years on e-commerce and product data at a digital services firm, seven years at a cloud hyperscaler, cofounder of an AI procurement startup). Activate it systematically: "on the projects we ran", "what we see during migrations", real screenshots and examples, anonymised where needed.
- **Expertise**: content signed by a named author, with an author box and an about page. No anonymous technical article.
- **Authoritativeness**: editorial consistency (WordPress, Shopify, product data, automation), depth (glossary, guides), outbound links to the authorities of the field.
- **Trustworthiness**: accuracy (versions, prices, dates), transparency (author, visible update date), a clear line between a sourced fact and an assumed expert opinion.

## 2. Citing like a journalist

- **Named source + date**: "According to FEVAD (2025 review), French online commerce…"
- **Outbound link to the exact page**, not the home page, with a descriptive anchor and `rel="noopener"`. No blanket nofollow: passing authority to the authorities is part of the signal.
- **Rephrase**: at most one short sentence quoted verbatim; everything else in your own words.
- Standard format: "According to [organisation] (date), [data]." with the link on the organisation's name.

## 3. Catalogue of official sources

### 3.1 Platforms and vendors (official documentation)

| Source | Domain | Editorial use |
|---|---|---|
| WordPress.org (docs, releases) | wordpress.org | Versions, features, security, Gutenberg/FSE; never a third-party blog for a product fact |
| WooCommerce (docs) | woocommerce.com | Features, compatibility, version upgrades |
| Shopify (docs, changelog, engineering) | shopify.dev / shopify.com | Features, Shopify Plus, APIs, checkout, official pricing |
| Akeneo (docs) | akeneo.com | PIM: concepts, versions, connectors (real project heritage) |
| Prismic, Webflow (docs) | prismic.io / webflow.com | Product facts on the tools actually practised |
| Make, n8n, Zapier (docs) | make.com / n8n.io / zapier.com | Automation: connectors, limits, official pricing |
| Anthropic, OpenAI, Google (developer docs) | official docs | Model capabilities and limits, technical context only (no model name in commercial copy) |
| MDN Web Docs | developer.mozilla.org | Web standards, HTML/CSS/JS, performance |
| web.dev / Google Search Central | web.dev / developers.google.com | Core Web Vitals, SEO best practice, official Google guidelines |
| Schema.org | schema.org | Structured data type definitions |
| W3C / WAI | w3.org | Standards, WCAG, ARIA |

### 3.2 Public institutions (example market: France and the EU)

| Source | Domain | Editorial use |
|---|---|---|
| CNIL | cnil.fr | GDPR, cookies, consent, registers; the reference for data compliance |
| ANSSI | cyber.gouv.fr | Site security, recommendations, alerts |
| DGCCRF / economie.gouv.fr | economie.gouv.fr | Online consumer law, customer reviews, commercial practices |
| Légifrance | legifrance.gouv.fr | Statutes (e-commerce, consumer law, accessibility) |
| EUR-Lex | eur-lex.europa.eu | GDPR, DSA, DMA, AI Act, accessibility directive (EAA 2025) |
| DINUM / RGAA | accessibilite.numerique.gouv.fr | French accessibility framework, legal obligations |
| service-public.fr | service-public.fr | Company obligations (legal notices, terms of sale) |
| France Num | francenum.gouv.fr | SME digital transformation, support schemes |

### 3.3 Market data and statistics

| Source | Domain | Editorial use |
|---|---|---|
| FEVAD | fevad.com | French e-commerce figures (quarterly and annual reviews) |
| INSEE | insee.fr | Company, digital and consumption data |
| Eurostat | ec.europa.eu/eurostat | European digital and online commerce statistics |
| ARCEP / ARCOM | arcep.fr | Digital usage (digital barometer) |
| Central bank and public investment bank | | SME conditions, digital investment |
| W3Techs | w3techs.com | CMS market share (technical reference, always dated precisely) |
| HTTP Archive / Chrome UX Report | httparchive.org | Real-world web performance data |

### 3.4 SEO, GEO and engines

| Source | Domain | Editorial use |
|---|---|---|
| Google Search Central (docs + official blog) | developers.google.com/search | Guidelines, updates, spam policies; the only official voice of Google |
| Google Search Status Dashboard | status.search.google.com | Confirmed incidents and updates |
| Bing Webmaster Guidelines | bing.com/webmasters | Second engine, AI (Copilot) |
| AI crawler documentation (OpenAI, Anthropic, Perplexity) | official docs | GPTBot, ClaudeBot, PerplexityBot: the actual robots directives |
| schema.org + Rich Results Test | validator.schema.org | Structured data validation (required before publication) |

### 3.5 Press and secondary sources (bounded tolerance)

Established press only (national dailies, business press, wire services, the reference digital trade title), as a secondary source, when the primary source is cited alongside or genuinely unavailable. Always dated.

## 4. Usage examples by editorial theme

- **E-commerce migration article**: Shopify docs (target features) + FEVAD (market) + web.dev (expected performance).
- **PIM glossary entry**: Akeneo docs (concepts) + real project experience + W3Techs if market share is quoted.
- **WordPress maintenance page**: WordPress.org (release cycle, security) + ANSSI (update recommendations).
- **Accessibility article**: RGAA (national obligations) + WCAG/W3C (the standard) + EUR-Lex (EAA 2025).
- **GDPR / cookies article**: CNIL (the practical reference) + EUR-Lex (the text).
- **SEO/GEO article**: Google Search Central + official AI crawler docs + schema.org.
- **Business automation page**: Make/n8n/Zapier docs (the tools' real limits) + an anonymised concrete case.

## 5. Sources to keep out

- **Competing web and SEO agencies**, domestic or not: never, as a source or as a link.
- **Affiliate blogs and monetised comparators** (sponsored top 10s, coupon sites).
- **Marketplaces and directories** (agency listing sites) as proof of authority.
- **Wikipedia as a cited source**: a documentary starting point only; trace back to the primary source.
- **Forums and social networks** (Reddit, X, Facebook groups): anecdotal value, never a source.
- **Unverified AI-generated content** (automated sites with no human control).
- **Vendor studies** (Semrush, Ahrefs, HubSpot and similar): tolerated only for data nobody else produces, dated, and flagged as coming from an interested party. Never for a fact an official source already covers.

## 6. Reliability hierarchy

1. **Primary institutional source**: .gouv.fr, .europa.eu, CNIL, ANSSI, Légifrance, EUR-Lex, W3C.
2. **Official vendor documentation**: WordPress.org, Shopify, Akeneo, Google Search Central, MDN.
3. **Professional and statistical bodies**: FEVAD, INSEE, Eurostat, ARCEP.
4. **Technical reference data**: W3Techs, HTTP Archive, CrUX (always dated).
5. **Established press**: secondary source, last resort.

## 7. Optimising for AI engines (GEO)

To be cited by an AI engine, a piece of content must:
- Carry clear factual claims, dated and quantified, each tied to its primary source.
- Open every glossary entry with a self-contained two or three sentence definition, quotable as is.
- Name an identifiable author (author box + Person schema with a unique `@id` and `sameAs` to LinkedIn).
- Show both the publication date and the update date in the body.
- Carry valid structured markup (Organization, Person, Service, BlogPosting, FAQPage, DefinedTerm, BreadcrumbList), checked with the Rich Results Test.
- Include a "Key takeaways" box or a FAQ at the start or end of the article.
- Stay served as complete HTML without JavaScript, and as markdown through `Accept: text/markdown` negotiation.

## 8. Citation and bibliography template

At the foot of the content, a "Sources" section:

**Sources:**
- CNIL, Cookies and trackers: what the law says (2025) — cnil.fr
- FEVAD, French e-commerce review, Q1 2026 — fevad.com
- Google Search Central, SEO starter guide (2025) — developers.google.com/search
- WordPress.org, 6.9 release notes (2026) — wordpress.org

Each source carries: organisation, document title, publication or access date, and a clickable URL to the exact page.
