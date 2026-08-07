# Generic writing + E-E-A-T guide (to instantiate per client)

> Template distilled from full client guides. Replace the `{{...}}` variables with the values from `INTAKE-CLIENT.md`. The FR examples are meant to be transposed into the target language.

## 1. Golden anti-invention rule (outranks everything else)

No invented proof: never a fabricated statistic, client quote, headline result, price, logo or press mention. A missing proof is not replaced by a vague phrase: **it is removed, or the item stays open pending the client's data**. Always separate {{COMPANY}}'s founding date from {{FOUNDER}}'s experience: "X years of [trade] at [employers]", never "agency for X years" when that is false.

## 2. Voice

Define 5 tone attributes in an "Attribute → In practice" table, aligned with {{VOICE}} and {{FOUNDER}}'s real track record ("on the projects we have run…" = first-hand, never "what the market says"). Anchor it with a Do/Don't table of matching compliant/avoided sentence pairs, not with abstract adjectives.

## 3. Hard style rules (to configure per client/language)

- Banned sign: em dash / en dash → ranges "X to Y".
- Full spelling and accents, including headings and prepositions ("à Lyon").
- Fixed politeness register per {{VOICE}} (formal address by default in FR B2B).
- Glossary of banned anglicisms specific to {{SECTOR}} with equivalents (e.g. FR web: store→boutique, checkout→parcours de paiement, roadmap→feuille de route…).
- Off limits: systematic rule of three, negative parallelism ("not only… but"), empty superlatives without proof ("véritable", "incontournable", "s'impose comme"), filler present participles, generic conclusions, competitor brand names in commercial copy (use the generic category instead).

## 4. Persuasion (5 principles, always paired with §1)

1. **"Because"** (Langer): every CTA/promise carries an explicit reason.
2. **Specific social proof** (Cialdini): a close reference (sector/city) beats a generic one — yet is never invented: this principle pushes towards over-precision, so the anti-invention guardrail is part of the rule, not a separate one.
3. **Loss > gain framing** (Kahneman/Tversky): say what the visitor risks losing.
4. **Progressive commitment** (Freedman/Fraser): first CTA at minimal friction.
5. **Quiet authority** (Milgram): level tone, zero hype; competence is shown.

## 5. SEO editorial structure

- 1 piece = 1 intent (informational/commercial/transactional) + 1 main keyword + semantic field. The intent is answered in the intro.
- Single H1 ≠ title; H1>H2>H3 hierarchy with no skipped level (real tags, not styled `<p>`).
- Title: keyword first + brand, 50-60 chars. Meta description: benefit+proof+incentive, 140-160 chars, full sentence. Short URL without accents. Absolute self-referencing canonical.
- Outlines: **Offer page** = problem/outcome → deliverables → method → real proof + price range → FAQ (3-5 genuine questions) → justified CTA. **Article** = answer-first intro → factual H2/H3 → first-hand + offer links → "key takeaways"/FAQ → sources + author box + date. **Glossary entry** = self-contained citable definition in 2-3 sentences → why it matters → how it works (numbered list) → mini-FAQ → CTA + related entries.
- Internal linking: at least 5 internal links in the body, descriptive anchors, thematic silos (offer ↔ glossary ↔ articles ↔ local pages).

## 6. On-page E-E-A-T

- Author box (photo, name, role, about link) on every signed piece; `Person` JSON-LD with a **single @id reused everywhere** (never regenerated per page), `sameAs` pointing to {{FOUNDER}}'s personal LinkedIn.
- Update date **visible in the body** + `dateModified` in JSON-LD.
- JSON-LD always consistent with the content actually displayed (never markup for absent content), and validated (Rich Results Test).

## 7. Sourcing "like a journalist"

- Reliability order: 1) primary institutional source, 2) official documentation from {{SECTOR}} vendors/platforms, 3) professional bodies/statistics offices, 4) dated reference technical data, 5) established press (secondary, last resort).
- Never cited: competitor blogs, monetised affiliates/comparison sites, marketplaces/directories, Wikipedia (starting point only), forums/social networks, unverified AI content; commercial vendor studies are tolerated for a single dated data point, flagged as "party to the case".
- Citation: "According to [body] (date), [data]." + link to the **exact page** (never the home page), descriptive anchor, rephrased (one short quoted sentence maximum). "Sources" block at the bottom: `Body, Title (date) — domain.tld`.
- Every figure or date is tied to its primary source; otherwise it goes.

## 8. GEO checklist (citability by AI engines)

- Every money page: at least one dated verifiable fact, one sourced figure or one structured comparison (an LLM cites facts, not promises).
- Self-contained definitions at the top of an entry; "key takeaways" box or FAQ.
- Identifiable author (Person @id + sameAs), visible dates, complete HTML with no JS required, markdown variant where the agent channel exists.

## 9. Publication checklist

- [ ] Voice matches {{VOICE}}; seniority/facts exact
- [ ] Hard style rules respected (accents, banned items, register); zero franglais outside deliberate {{SECTOR}} terms
- [ ] Zero invented proof; every fact sourced (exact page)
- [ ] Keyword placed (title/H1/intro/H2) without stuffing; lengths respected
- [ ] ≥ 5 descriptive internal links
- [ ] Author box + dates visible; JSON-LD consistent with the visible content
- [ ] Justified CTA ("because") + reassurance
- [ ] AI-tells pass (skill `humanizer`)

## 10. Client brand guidelines (structure to produce, 6 sections)

1) Logo and brand (versions, clear space, misuse); 2) Palette (background/ink + accents, **AA threshold as a number**, not "good contrast"); 3) Typography (display + body, size/letter-spacing hierarchy); 4) Visual elements (shapes/radii, cards, buttons, texture, icons, photography, motion + reduced-motion); 5) Tone and voice (points back to this guide); 6) Applications. **Governance: the code (CSS tokens) is the source of truth, the document follows — never the reverse.**

---
*Fully instantiated examples (web agency, to imitate when producing the client's equivalents): `references/examples/writing-guide-example.md` + `references/examples/eeat-sources-example.md`.*
