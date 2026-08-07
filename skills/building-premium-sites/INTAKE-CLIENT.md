# CLIENT INTAKE — fill in before generating the site

> Fill this file in (or have the client fill it in) BEFORE starting the build. The agent reads `BLUEPRINT.md` + this file, then runs the **Playbook §16**. Any empty field is something to clarify with the client before coding. Everything here is supplied, never invented — proof figures above all.

## 1. Identity & legal
- **Trading name** `{{COMPANY}}`:
- **Full legal name** `{{LEGAL_NAME}}` (form + share capital):
- **Jurisdiction** `{{JURISDICTION}}` (France by default; Spain → NIF/CIF, Registro Mercantil, AEPD — see BLUEPRINT §11):
- **SIREN / SIRET** (or the jurisdiction's equivalent identifier):
- **Trade register / RCS** (city + registration date):
- **VAT number**:
- **Registered address** `{{ADDRESS}}`:
- **City / Region** `{{CITY}}` / `{{REGION}}`:
- **Publication director / Founder** `{{FOUNDER}}`:
- **Domain** `{{DOMAIN}}` (already bought? registrar?):
- **Contact email** `{{CONTACT_EMAIL}}`:
- **Mailbox hosted at** (Google Workspace, Infomaniak, OVH…) — *matters for deliverability*:

## 2. Positioning & sector
- **Sector / trade** `{{SECTOR}}`:
- **Target(s)** (who buys, B2B/B2C, company size):
- **Main promise** (one sentence):
- **Competitors / reference sites** (what they like / dislike):
- **Tone of voice** `{{VOICE}}` (default: founder, formal address, factual, no hype):
- **Site language(s)** `{{LANG}}` (single language by default; bilingual → BLUEPRINT §5 bis):

## 3. Offer — pillars & sub-offers (`lib/catalog.ts`)
List 2 to 4 **pillars**, each with its **real sub-offers** (document only what is actually sold — E-E-A-T).
- Pillar 1 — title / client problem / target outcome / benefits / deliverables / use cases / sub-offers:
- Pillar 2 — …:
- Pillar 3 — …:
- For each offer: main SEO keyword (+ volume/difficulty if available):

## 4. Proof & reassurance (REAL only)
- **Proof points** (years of experience, number of projects, areas of expertise):
- **Client logos** (cleared for display?) + files:
- **Case studies / results** (verifiable figures — otherwise leave them out):
- **Partners / certifications**:
- **Guarantees** (response time, free first conversation, etc.):

## 5. Local SEO — cities (optional but recommended)
- **Target cities / territories** `{{CITIES}}`:
- **Specialities to decline per city** (e.g. 2-3 services):
- **Local landing segment** `{{LOCAL_SLUG}}` (agency, practice, restaurant, workshop… depending on trade):
- **Contact landings** `/{{LOCAL_SLUG}}/{city}` wanted (which ones?):
- For French départements: preposition « en » (e.g. « en Vendée »):

## 6. Branding & design
- **Logo** (SVG files: light + dark + icon):
- **Brand colours** `{{BRAND_COLORS}}` (main accent, secondary accent, dark, background):
- **Fonts** `{{FONTS}}` (display + body) — otherwise default (one display + Inter):
- **Visual style** wanted (premium cream by default; dark; colourful…):
- **Photos**: supplied? otherwise stock (Pexels/Unsplash) or generated?

## 7. Existing content to carry over (migration)
- **Old site** (URL, CMS):
- **Pages to keep** (URLs to preserve → 301 or legacy migration):
- **Blog posts** to bring over (dated URLs?):
- **301 redirects** needed:

## 8. Email / ESP (Brevo by default)
- **Brevo account** (or other ESP) — SMTP credentials:
  - `BREVO_SMTP_LOGIN`:
  - `BREVO_SMTP_KEY`:
  - `BREVO_SENDER_EMAIL` / `BREVO_TO_EMAIL`:
- **Domain already authenticated at Brevo?** (SPF/DKIM/DMARC):
- **If lead-gen audit tool (§9 ter)**: bot User-Agent `AUDIT_BOT_UA` (brand + contact URL — always this client's own, never another's):

## 9. Deployment
- **Vercel account** (team):
- **DNS access** (registrar / who manages the zone):
- **Analytics wanted?** (if yes → turn the cookie banner into opt-in consent):

## 10. Scope & priorities
- **Lead-gen type**: simple contact form (default) OR interactive audit tool (§9 ter — only if a diagnostic adds value in the sales cycle AND there is a maintenance budget):
- **Phase 1 pages** (delivered first):
- **Phase 2 pages** (later):
- **Deadline**:
- **Specific constraints** (regulatory, accessibility, multilingual…):

---
*Once filled in: hand this file + `BLUEPRINT.md` to the agent, which runs the Playbook (§16).*
