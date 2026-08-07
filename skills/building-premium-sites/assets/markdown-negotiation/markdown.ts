// REFERENCE IMPLEMENTATION — REGENERATE PER SITE.
// Brand strings (LBL homeTitle/why/blogTitle/glossaryTitle) and the About /
// Contact / LEGAL NOTICE sections carry {{PLACEHOLDERS}}: fill them from the
// target site's own identity, or better, derive everything from lib/site.ts.
// Shipping a {{...}} token to production means the placeholder is still there.
import { caseStudies, faqs as faqsFr, site, values as valuesFr } from '@/lib/site';
import { getGlossary, getGlossaryTerm, getOffer, getPillar } from '@/lib/services';
import { getArticleL, getArticles } from '@/lib/articles';
import { getOfferBody, getPillarBody } from '@/lib/offer-content';
import { getMarketing } from '@/lib/marketing';
import { type Article, type Block } from '@/lib/blog';
import { method } from '@/lib/guides';
import { type Locale, localizeHref } from '@/lib/i18n';

function mdTable(headers: string[], rows: string[][]) {
  const head = `| ${headers.join(' | ')} |`;
  const sep = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows.map((r) => `| ${r.join(' | ')} |`).join('\n');
  return [head, sep, body].join('\n');
}

function blocksToMd(blocks: Block[]) {
  const out: string[] = [];
  for (const b of blocks) {
    if (b.type === 'h2') out.push(`## ${b.text}`);
    else if (b.type === 'h3') out.push(`### ${b.text}`);
    else if (b.type === 'p') out.push(b.text);
    else if (b.type === 'ul') out.push(b.items.map((i) => `- ${i}`).join('\n'));
    else if (b.type === 'table') out.push(mdTable(b.headers, b.rows));
    else if (b.type === 'faq') out.push(b.items.map((i) => `### ${i.q}\n\n${i.a}`).join('\n\n'));
  }
  return out.join('\n\n');
}

// Section labels and fixed strings per locale, so the markdown rendering matches
// the visible page language.
const LBL = {
  fr: {
    homeTitle: '# {{COMPANY}}, agence WordPress, Shopify et automatisation',
    homeIntro: 'On refond votre site pour qu’il convertisse, et on connecte vos outils pour retirer les tâches répétitives. Vous obtenez plus de demandes qualifiées et moins de travail manuel. Basée à {{CITY}} ({{REGION}}).',
    services: 'Services',
    why: 'Pourquoi {{COMPANY}}',
    questions: 'Questions fréquentes',
    contact: 'Contact',
    email: 'Email',
    form: 'Formulaire',
    more: 'En savoir plus',
    problem: 'Le problème',
    result: 'Le résultat',
    offers: 'Offres',
    benefits: 'Bénéfices',
    deliverables: 'Livrables',
    uses: 'Cas d’usage',
    faq: 'FAQ',
    scopeProject: 'Cadrer un projet',
    scopeThis: 'Cadrer ce projet',
    blogTitle: '# Blog {{COMPANY}}',
    blogIntro: 'Guides chiffrés et sourcés pour décider avant de refondre ou migrer.',
    sources: 'Sources',
    glossaryTitle: '# Glossaire {{COMPANY}}',
    glossaryIntro: 'Les termes des projets web, e-commerce, données produit et IA, définis simplement. Chaque définition renvoie vers l’offre associée.',
    inPractice: 'En pratique',
    relatedTerms: 'Termes liés',
    updatedOn: 'Mis à jour le',
  },
  en: {
    homeTitle: '# {{COMPANY}}, WordPress, Shopify and automation agency',
    homeIntro: 'We rebuild your website to convert, and connect your tools to remove repetitive tasks. You get more qualified enquiries and less manual work. Based in {{CITY}}, {{COUNTRY}}.',
    services: 'Services',
    why: 'Why {{COMPANY}}',
    questions: 'Frequently asked questions',
    contact: 'Contact',
    email: 'Email',
    form: 'Form',
    more: 'Learn more',
    problem: 'The problem',
    result: 'The result',
    offers: 'Services',
    benefits: 'Benefits',
    deliverables: 'Deliverables',
    uses: 'Use cases',
    faq: 'FAQ',
    scopeProject: 'Scope a project',
    scopeThis: 'Scope this project',
    blogTitle: '# {{COMPANY}} blog',
    blogIntro: 'Data-backed guides to decide before you rebuild or migrate.',
    sources: 'Sources',
    glossaryTitle: '# {{COMPANY}} glossary',
    glossaryIntro: 'The terms behind web, e-commerce, product data and AI projects, defined in plain words. Every definition links to the related service.',
    inPractice: 'In practice',
    relatedTerms: 'Related terms',
    updatedOn: 'Updated on',
  },
} as const;

function abs(href: string, locale: Locale) {
  return `${site.url}${localizeHref(href, locale)}`;
}

function homeMd(locale: Locale) {
  const t = LBL[locale];
  const m = getMarketing(locale);
  const pillars = getPillarsLocale(locale);
  return [
    t.homeTitle,
    `> ${m.description}`,
    t.homeIntro,
    `## ${t.services}`,
    pillars.map((s) => `### ${s.title}\n${s.tagline}\n\n${s.definition}\n\n${t.more} : ${abs(s.href, locale)}`).join('\n\n'),
    `## ${t.why}`,
    m.values.map((v) => `- **${v.title}** : ${v.text}`).join('\n'),
    `## ${t.questions}`,
    m.faqs.map(([q, a]) => `### ${q}\n\n${a}`).join('\n\n'),
    `## ${t.contact}`,
    `- ${t.email} : ${site.email}\n- ${t.form} : ${abs('/contact', locale)}`,
  ].join('\n\n');
}

function getPillarsLocale(locale: Locale) {
  // local import-free accessor to avoid circular concerns
  const p0 = getPillar('sites-corporate', locale);
  const p1 = getPillar('e-commerce', locale);
  const p2 = getPillar('automatisation-ia', locale);
  return [p0, p1, p2].filter(Boolean) as NonNullable<ReturnType<typeof getPillar>>[];
}

function pillarMd(slug: string, locale: Locale) {
  const p = getPillar(slug, locale);
  if (!p) return null;
  const t = LBL[locale];
  const body = getPillarBody(slug, locale);
  return [
    `# {{COMPANY}}, ${p.title}`,
    p.definition,
    `## ${t.problem}\n\n${p.problem}`,
    `## ${t.result}\n\n${p.result}`,
    `## ${t.offers}\n\n${p.children.map((c) => `- ${c.title}${c.published ? ` : ${abs(c.href, locale)}` : ''}`).join('\n')}`,
    `## ${t.benefits}\n\n${p.benefits.map((i) => `- ${i}`).join('\n')}`,
    `## ${t.deliverables}\n\n${p.deliverables.map((i) => `- ${i}`).join('\n')}`,
    p.faq.length ? `## ${t.faq}\n\n${p.faq.map(([q, a]) => `### ${q}\n\n${a}`).join('\n\n')}` : '',
    body && body.length ? blocksToMd(body) : '',
    `${t.scopeProject} : ${abs('/contact', locale)}`,
  ].filter(Boolean).join('\n\n');
}

function offerMd(pillarSlug: string, slug: string, locale: Locale) {
  const o = getOffer(pillarSlug, slug, locale);
  if (!o || !o.published) return null;
  const t = LBL[locale];
  const body = getOfferBody(pillarSlug, slug, locale);
  return [
    `# ${o.hero}`,
    o.intro,
    `## ${t.problem}\n\n${o.problem}`,
    `## ${t.result}\n\n${o.result}`,
    `## ${t.benefits}\n\n${o.benefits.map((i) => `- ${i}`).join('\n')}`,
    `## ${t.deliverables}\n\n${o.deliverables.map((i) => `- ${i}`).join('\n')}`,
    `## ${t.uses}\n\n${o.uses.map((i) => `- ${i}`).join('\n')}`,
    o.faq.length ? `## ${t.faq}\n\n${o.faq.map(([q, a]) => `### ${q}\n\n${a}`).join('\n\n')}` : '',
    body && body.length ? blocksToMd(body) : '',
    `${t.scopeThis} : ${abs('/contact', locale)}`,
  ].filter(Boolean).join('\n\n');
}

function glossaryIndexMd(locale: Locale) {
  const t = LBL[locale];
  return [
    t.glossaryTitle,
    t.glossaryIntro,
    getGlossary(locale).map((g) => `- [${g.term}](${abs(`/glossaire/${g.slug}`, locale)}) : ${g.definition}`).join('\n'),
  ].join('\n\n');
}

function termMd(slug: string, locale: Locale) {
  const g = getGlossaryTerm(slug, locale);
  if (!g) return null;
  const t = LBL[locale];
  return [
    `# ${g.term}`,
    `> ${g.definition}`,
    `${t.updatedOn} ${g.updated}. {{FOUNDER}}, {{COMPANY}}.`,
    blocksToMd(g.blocks),
    g.faq.length ? `## ${t.faq}\n\n${g.faq.map(({ q, a }) => `### ${q}\n\n${a}`).join('\n\n')}` : '',
    `## ${t.inPractice}\n\n- [${g.offer.label}](${abs(g.offer.href, locale)})`,
    g.related.length ? `## ${t.relatedTerms}\n\n${g.related.map((s) => `- ${abs(`/glossaire/${s}`, locale)}`).join('\n')}` : '',
    `${t.scopeProject} : ${abs('/contact', locale)}`,
  ].filter(Boolean).join('\n\n');
}

function blogIndexMd(locale: Locale) {
  const t = LBL[locale];
  return [
    t.blogTitle,
    t.blogIntro,
    getArticles(locale).map((a) => `- [${a.title}](${abs(`/blog/${a.slug}`, locale)}), ${a.excerpt}`).join('\n'),
  ].join('\n\n');
}

function articleMd(a: Article, locale: Locale) {
  const t = LBL[locale];
  return [`# ${a.title}`, `> ${a.excerpt}`, blocksToMd(a.blocks), `${t.sources} :\n${a.sources.map((s) => `- ${s}`).join('\n')}`].join('\n\n');
}

// ---- French-only editorial pages (no EN markdown counterpart) ----

function aboutMd() {
  return [
    '# À propos de {{COMPANY}}',
    '{{COMPANY}} est une agence web ({{LEGAL_FORM}}) basée à {{CITY}}, en {{REGION}}, immatriculée au RCS de {{RCS_CITY}} le {{RCS_DATE}}. Fondateur : {{FOUNDER}}, plus de {{FOUNDER_YEARS}} ans sur des projets web, e-commerce et transformation digitale.',
    'On travaille sur WordPress, Shopify, UX/UI et automatisation pour des entreprises qui veulent un site plus clair et plus de demandes qualifiées. On comprend votre situation, on priorise, on livre par blocs, et on vous transmet les clés.',
    '## Valeurs',
    valuesFr.map((v) => `- **${v.title}** : ${v.text}`).join('\n'),
    `Contact : ${site.email}`,
  ].join('\n\n');
}

function approcheMd() {
  return [
    '# Notre approche',
    'On ne commence pas par une maquette, on commence par le blocage. Que vous ayez un site à refondre ou un process à automatiser, on cherche d’abord ce qui vous coûte le plus cher aujourd’hui, puis on s’attaque à ça en premier.',
    '## Deux terrains, une même méthode',
    '- **Sites et boutiques** : WordPress, Shopify, UX et conversion.\n- **Automatisations** : Make, n8n, Zapier et assistants IA pour supprimer la ressaisie et qualifier les leads plus vite.',
    `## ${method.name}`,
    method.tagline,
    method.steps.map((s) => `${s.n}. **${s.title}**, ${s.desc}`).join('\n'),
    '## Comment on décide quoi lancer en premier',
    'On classe chaque idée sur quatre critères, puis on tranche avec vous : impact, risque, effort, dépendances.',
    `Contact : ${site.url}/contact`,
  ].join('\n\n');
}

function realisationsMd() {
  return [
    '# Réalisations',
    'Comment {{COMPANY}} cadre une mission WordPress, Shopify ou automatisation : le problème de départ, ce qu’on fait, et les résultats visés.',
    caseStudies
      .map((c) =>
        [
          `## ${c.title}`,
          `Service : ${c.service}. Profil : ${c.sector}. Durée : ${c.duration}.`,
          `Contexte : ${c.context}`,
          `Ce qu’on a fait :\n${c.actions.map((a) => `- ${a}`).join('\n')}`,
          `Résultats : ${c.results.map((r) => `${r.label} ${r.before} → ${r.after}`).join(' ; ')}.`,
          `Repère clé : ${c.headlineMetric.value} ${c.headlineMetric.label}.`,
        ].join('\n\n'),
      )
      .join('\n\n'),
  ].join('\n\n');
}

function contactMd() {
  return [
    '# Contact {{COMPANY}}',
    'Envoyez l’URL de votre site ou décrivez la tâche à automatiser. On vous dit par quoi commencer. Réponse humaine sous 24 h ouvrées, premier avis offert, sans engagement.',
    `- Email : ${site.email}\n- Localisation : {{CITY}}, {{REGION}}, {{COUNTRY}}`,
    'Indiquez si possible : URL actuelle, objectif, CMS ou plateforme, délai, contraintes SEO ou catalogue, et ce qui bloque aujourd’hui.',
  ].join('\n\n');
}

function legalMd() {
  return [
    '# Mentions légales',
    'Éditeur : {{LEGAL_NAME}}, {{LEGAL_FORM}} au capital de {{SHARE_CAPITAL}}, {{STREET_ADDRESS}}, {{POSTAL_CODE}} {{CITY}}, {{COUNTRY}}. SIREN {{SIREN}}, RCS {{RCS_CITY}} ({{RCS_DATE}}), TVA {{VAT_NUMBER}}. Responsable de la publication : {{FOUNDER}}.',
    'Hébergement : Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis.',
    `Données personnelles (RGPD) : les données du formulaire servent uniquement à répondre à votre demande, transmises via Brevo. Droit d’accès, rectification, effacement et opposition à ${site.email}.`,
  ].join('\n\n');
}

// Returns the markdown representation of a known content path, or null.
// Handles both FR (root) and EN (/en/*) data-driven pages; FR-only editorial
// pages return null when requested under /en.
export function getPageMarkdown(path: string): string | null {
  let clean = path.replace(/\/+$/, '') || '/';
  let locale: Locale = 'fr';
  if (clean === '/en' || clean.startsWith('/en/')) {
    locale = 'en';
    clean = clean.replace(/^\/en/, '') || '/';
  }

  if (clean === '/') return homeMd(locale);

  for (const ps of ['sites-corporate', 'e-commerce', 'automatisation-ia']) {
    if (clean === `/${ps}`) return pillarMd(ps, locale);
    if (clean.startsWith(`/${ps}/`)) return offerMd(ps, clean.replace(`/${ps}/`, ''), locale);
  }

  if (clean === '/glossaire') return glossaryIndexMd(locale);
  if (clean.startsWith('/glossaire/')) return termMd(clean.replace('/glossaire/', ''), locale);

  if (clean === '/blog') return blogIndexMd(locale);
  if (clean.startsWith('/blog/')) {
    const a = getArticleL(clean.replace('/blog/', ''), locale);
    return a ? articleMd(a, locale) : null;
  }

  // Editorial / legal pages are French-only in markdown.
  if (locale === 'fr') {
    if (clean === '/a-propos') return aboutMd();
    if (clean === '/approche') return approcheMd();
    if (clean === '/realisations') return realisationsMd();
    if (clean === '/contact') return contactMd();
    if (clean === '/mentions-legales') return legalMd();
  }

  return null;
}
