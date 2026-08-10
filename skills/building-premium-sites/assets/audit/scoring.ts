// REFERENCE IMPLEMENTATION — the OFFERS mapping below (labels + hrefs) is an
// example catalogue: remap it onto the target site's lib/catalog.ts before any
// use, otherwise the CTAs point at URLs that do not exist.
// Deterministic scoring: SiteSignals -> scored findings, each attached to the
// offer that resolves it. This is the "lead-gen by design" layer: every detected
// GAP points at its offer and feeds the contact CTA.
// NB: user-facing labels (title/detail/offer/axes) are in accented French.

import type { SiteSignals } from './types';

export type Axis = 'site' | 'ecommerce' | 'seo-geo' | 'automation';
export type Severity = 'critical' | 'warning' | 'good';

export interface OfferRef {
  label: string;
  href: string;
}

export interface Finding {
  axis: Axis;
  severity: Severity;
  title: string;
  detail: string;
  offer?: OfferRef;
}

export interface AxisScore {
  axis: Axis;
  label: string;
  score: number;
  applicable: boolean;
}

export interface AuditReport {
  signals: SiteSignals;
  findings: Finding[];
  axisScores: AxisScore[];
  globalScore: number;
  topPriorities: Finding[];
}

const OFFERS = {
  sites: { label: 'Sites corporate & WordPress', href: '/sites-corporate' },
  ecommerce: { label: 'E-commerce & Shopify', href: '/e-commerce' },
  migration: { label: 'Migration e-commerce sur-mesure', href: '/e-commerce/sur-mesure' },
  pim: { label: 'Données produit (PIM)', href: '/e-commerce/pim' },
  automatisation: { label: 'Automatisation & IA', href: '/automatisation-ia' },
} as const;

const AXIS_LABELS: Record<Axis, string> = {
  site: 'Site & refonte',
  ecommerce: 'E-commerce & migration',
  'seo-geo': 'SEO / GEO',
  automation: 'Automatisation & IA',
};

const PENALTY: Record<Severity, number> = { critical: 30, warning: 12, good: 0 };

function scoreFor(axis: Axis, findings: Finding[]): number {
  const penalty = findings
    .filter((f) => f.axis === axis)
    .reduce((sum, f) => sum + PENALTY[f.severity], 0);
  return Math.max(0, Math.min(100, 100 - penalty));
}

export function scoreReport(signals: SiteSignals): AuditReport {
  const findings: Finding[] = [];
  const add = (f: Finding) => findings.push(f);
  const { seo, discovery, security, automation, platform, isEcommerce } = signals;

  // --- SITE & rebuild axis (technical / robustness) ---
  if (!security.https) {
    add({ axis: 'site', severity: 'critical', title: 'Site non servi en HTTPS', detail: "Le site n'est pas chiffré de bout en bout : pénalité SEO et signal de défiance pour vos visiteurs.", offer: OFFERS.sites });
  } else {
    add({ axis: 'site', severity: 'good', title: 'HTTPS actif', detail: 'Les échanges sont chiffrés.' });
  }
  if (!seo.viewport) {
    add({ axis: 'site', severity: 'critical', title: 'Pas de meta viewport', detail: "Le site n'est probablement pas adapté au mobile, où se joue plus de la moitié de votre trafic.", offer: OFFERS.sites });
  }
  if (!security.hsts) {
    add({ axis: 'site', severity: 'warning', title: 'En-tête HSTS absent', detail: 'Sans HSTS, une première connexion peut être interceptée. Durcissement recommandé.', offer: OFFERS.sites });
  }
  if (!security.csp) {
    add({ axis: 'site', severity: 'warning', title: 'Pas de Content-Security-Policy', detail: 'Aucune politique contre l’injection de scripts tiers. Surface de risque XSS ouverte.', offer: OFFERS.sites });
  }
  if (platform === 'wordpress' || platform === 'woocommerce') {
    add({ axis: 'site', severity: 'good', title: 'Socle WordPress détecté', detail: 'Nous industrialisons et sécurisons les sites WordPress (socle, multisite, maintenance).', offer: OFFERS.sites });
  }

  // --- SEO / GEO axis ---
  if (!seo.title || seo.titleLength < 15) {
    add({ axis: 'seo-geo', severity: 'critical', title: 'Balise title absente ou trop courte', detail: 'Le title est le premier signal de pertinence pour Google. Il doit porter votre mot-clé principal.' });
  } else if (seo.titleLength > 65) {
    add({ axis: 'seo-geo', severity: 'warning', title: 'Title trop long', detail: `Title de ${seo.titleLength} caractères : tronqué dans les résultats. Visez 50 à 60 caractères.` });
  } else {
    add({ axis: 'seo-geo', severity: 'good', title: 'Balise title présente', detail: 'Longueur correcte.' });
  }
  if (!seo.metaDescription) {
    add({ axis: 'seo-geo', severity: 'warning', title: 'Meta description absente', detail: 'Google générera un extrait au hasard : vous perdez le contrôle de votre taux de clic.' });
  } else if (seo.descriptionLength > 160) {
    add({ axis: 'seo-geo', severity: 'warning', title: 'Meta description trop longue', detail: `${seo.descriptionLength} caractères : tronquée. Visez 150 à 160.` });
  }
  if (!seo.canonical) {
    add({ axis: 'seo-geo', severity: 'warning', title: 'Pas de balise canonical', detail: 'Risque de contenu dupliqué aux yeux de Google.' });
  }
  if (seo.jsonLdTypes.length === 0) {
    add({ axis: 'seo-geo', severity: 'warning', title: 'Aucune donnée structurée (JSON-LD)', detail: 'Sans schéma, vous restez absent des résultats enrichis de Google. Google demande par ailleurs que le balisage corresponde au texte visible de la page.' });
  } else {
    add({ axis: 'seo-geo', severity: 'good', title: `Données structurées présentes (${seo.jsonLdTypes.length} types)`, detail: seo.jsonLdTypes.slice(0, 6).join(', ') });
  }
  if (!discovery.sitemap) {
    add({ axis: 'seo-geo', severity: 'warning', title: 'Sitemap introuvable', detail: 'Sans sitemap.xml, Google explore votre site à l’aveugle.' });
  }
  if (!discovery.robotsTxt) {
    add({ axis: 'seo-geo', severity: 'warning', title: 'robots.txt absent', detail: "Aucune directive d'exploration : comportement des robots non maîtrisé." });
  }
  // llms.txt : signalé, jamais pénalisé. Google documente que le fichier n'a aucun
  // effet, positif ou négatif, sur le classement ni sur AI Overviews. Il travaille
  // dans une autre couche : les agents de code et les clients MCP qui lisent une
  // documentation — OpenAI, Anthropic et Perplexity en servent un pour leurs propres
  // docs. Ne pas invoquer ici les études de logs « 515M requêtes » : elles filtrent
  // sur GPTBot et ClaudeBot, qui sont des crawlers d'ENTRAÎNEMENT, pas les bots de
  // recherche. Promettre une visibilité IA à un prospect sur ce fichier reste une
  // affirmation invérifiable — ce que EEAT-WRITING.md §1 interdit.
  if (discovery.llmsTxt) {
    add({ axis: 'seo-geo', severity: 'good', title: 'llms.txt présent', detail: 'Vos pages sont exposées en markdown pour les agents de code et les clients MCP qui liraient votre documentation.' });
  }
  if (seo.h1Count === 0) {
    add({ axis: 'seo-geo', severity: 'warning', title: 'Aucun titre H1', detail: 'Le H1 structure la page pour Google et pour l’accessibilité.' });
  } else if (seo.h1Count > 1) {
    add({ axis: 'seo-geo', severity: 'warning', title: `${seo.h1Count} balises H1`, detail: 'Plusieurs H1 brouillent la hiérarchie. Un seul H1 par page.' });
  }
  if (seo.imagesTotal > 0 && seo.imagesWithoutAlt / seo.imagesTotal > 0.3) {
    add({ axis: 'seo-geo', severity: 'warning', title: 'Images sans attribut alt', detail: `${seo.imagesWithoutAlt}/${seo.imagesTotal} images sans alt : pénalité SEO image et accessibilité dégradée.` });
  }

  // --- E-COMMERCE & migration axis (only when relevant) ---
  const ecomApplicable = isEcommerce || ['shopify', 'woocommerce', 'prestashop', 'magento'].includes(platform);
  if (ecomApplicable) {
    if (platform === 'prestashop' || platform === 'magento' || platform === 'woocommerce') {
      add({ axis: 'ecommerce', severity: 'warning', title: `Plateforme ${platform} : migration à étudier`, detail: 'Ces socles vieillissent vite et coûtent cher à maintenir. Une migration Shopify réduit la charge technique et améliore la conversion.', offer: OFFERS.migration });
    } else if (platform === 'shopify') {
      add({ axis: 'ecommerce', severity: 'good', title: 'Boutique Shopify détectée', detail: 'Bon socle. Reste à fiabiliser vos données produit (PIM) pour passer à l’échelle.', offer: OFFERS.pim });
    } else {
      add({ axis: 'ecommerce', severity: 'warning', title: 'Signaux e-commerce détectés', detail: 'Votre boutique mérite un audit de structure catalogue et de parcours d’achat.', offer: OFFERS.ecommerce });
    }
  }

  // --- AUTOMATION & AI axis ---
  if (!automation.chatWidget) {
    add({ axis: 'automation', severity: 'warning', title: 'Pas de chatbot ni d’assistant', detail: 'Aucune capture ni qualification automatique des visiteurs. Un agent IA répond 24/7 et alimente vos leads.', offer: OFFERS.automatisation });
  } else {
    add({ axis: 'automation', severity: 'good', title: 'Widget conversationnel détecté', detail: 'Vous captez déjà vos visiteurs en direct.' });
  }
  if (!automation.analytics) {
    add({ axis: 'automation', severity: 'warning', title: 'Pas de mesure d’audience détectée', detail: 'Sans analytics, vos décisions se prennent à l’aveugle. Mesure et reporting automatisés recommandés.', offer: OFFERS.automatisation });
  }
  if (automation.forms > 0 && !automation.chatWidget) {
    add({ axis: 'automation', severity: 'warning', title: 'Formulaires non automatisés', detail: 'Vos formulaires génèrent des tâches manuelles (relance, saisie CRM). Tout cela s’automatise.', offer: OFFERS.automatisation });
  }

  // --- Per-axis scores + global score ---
  const axes: Axis[] = ['site', 'seo-geo', 'ecommerce', 'automation'];
  const axisScores: AxisScore[] = axes.map((axis) => {
    const applicable = axis !== 'ecommerce' || ecomApplicable;
    return { axis, label: AXIS_LABELS[axis], score: scoreFor(axis, findings), applicable };
  });

  const scored = axisScores.filter((a) => a.applicable);
  const globalScore = scored.length
    ? Math.round(scored.reduce((s, a) => s + a.score, 0) / scored.length)
    : 0;

  const rank: Record<Severity, number> = { critical: 0, warning: 1, good: 2 };
  const topPriorities = findings
    .filter((f) => f.severity !== 'good')
    .sort((a, b) => rank[a.severity] - rank[b.severity] || (b.offer ? 1 : 0) - (a.offer ? 1 : 0))
    .slice(0, 3);

  return { signals, findings, axisScores, globalScore, topPriorities };
}
