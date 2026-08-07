// PER-SITE i18n CONFIGURATION — REGENERATE FOR EVERY PROJECT.
// The translated-page lists below are a STRUCTURAL EXAMPLE (a FR -> EN site).
// Copying them as-is yields hreflang tags and a language switcher pointing at
// pages that do not exist.
//
// To change the language pair (e.g. FR -> ES): edit LOCALES, HTML_LANG,
// HREFLANG and OG_LOCALE here — the i18n.ts primitives derive everything from
// these constants, no locale literal lives anywhere else.

export const LOCALES = ['fr', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'fr';

// BCP 47: <html lang>, hreflang, JSON-LD inLanguage, og:locale.
export const HTML_LANG: Record<Locale, string> = { fr: 'fr', en: 'en' };
export const HREFLANG: Record<Locale, string> = { fr: 'fr-FR', en: 'en-US' };
export const OG_LOCALE: Record<Locale, string> = { fr: 'fr_FR', en: 'en_US' };

// Default-locale pages that have a translated counterpart. Only reciprocal
// pairs get hreflang tags and an entry in the language switcher. Locale-specific
// pages (legacy SEO, city pages, dated archives) stay in the default locale only.
export const TRANSLATED_PREFIXES: readonly string[] = [
  '/sites-corporate',
  '/e-commerce',
  '/automatisation-ia',
  '/glossaire',
];

export const TRANSLATED_EXACT: ReadonlySet<string> = new Set([
  '/',
  '/a-propos',
  '/approche',
  '/realisations',
  '/partenaires',
  '/contact',
  '/audit-gratuit',
  '/mentions-legales',
  '/politique-confidentialite',
  '/blog',
]);

// Translated blog article slugs (dated archives stay in the default locale).
export const TRANSLATED_BLOG_SLUGS: ReadonlySet<string> = new Set([
  'migration-prestashop-vers-shopify',
  'salesforce-commerce-cloud-vers-shopify-plus',
  'essor-ecommerce-b2b',
]);
