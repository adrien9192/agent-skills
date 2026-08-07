// GENERIC i18n primitives — nothing here needs editing for a new site: every
// per-site value (locales, hreflang, translated-page whitelist) lives in
// i18n.config.ts. The default locale stays at the root (canonical), every
// secondary locale lives under its /{locale}/* prefix. No dependencies, so it
// imports from both Server and Client components.

import {
  LOCALES,
  type Locale,
  DEFAULT_LOCALE,
  HREFLANG,
  OG_LOCALE,
  TRANSLATED_PREFIXES,
  TRANSLATED_EXACT,
  TRANSLATED_BLOG_SLUGS,
} from './i18n.config';

export { LOCALES, DEFAULT_LOCALE, type Locale };
export { HTML_LANG, HREFLANG, OG_LOCALE } from './i18n.config';

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

// Prefixes a root-relative default-locale path with /{locale} for a secondary
// locale. External links, mailto: and #anchors pass through unchanged.
// '/' becomes '/{locale}'.
export function localizeHref(href: string, locale: Locale): string {
  if (locale === DEFAULT_LOCALE) return href;
  if (!href.startsWith('/')) return href;
  if (href === '/') return `/${locale}`;
  return `/${locale}${href}`;
}

// Reciprocal hreflang + canonical for a translated page. `path` is the
// root-relative path in the DEFAULT locale; canonical points at the current
// locale, languages lists every locale with x-default on the default locale.
export function alternates(path: string, locale: Locale) {
  const languages: Record<string, string> = {};
  for (const l of LOCALES) languages[HREFLANG[l]] = localizeHref(path, l);
  languages['x-default'] = path;
  return {
    canonical: localizeHref(path, locale),
    languages,
  };
}

// Per-page OpenGraph/Twitter with a dedicated visual (offer pages get their own
// photorealistic image instead of inheriting the site-wide OG).
// Returns a Metadata partial; metadataBase (set in the layout) resolves the
// relative path.
export function ogVisual(visual: string | undefined, title: string, description: string, locale: Locale) {
  if (!visual) return {};
  const images = [{ url: visual, width: 1600, height: 900, alt: title }];
  return {
    openGraph: { type: 'website' as const, locale: OG_LOCALE[locale], title, description, images },
    twitter: { card: 'summary_large_image' as const, title, description, images: [visual] },
  };
}

// Per-page OpenGraph/Twitter (title, description, url) WITHOUT a dedicated
// image: avoids inheriting the layout's openGraph block verbatim (the home
// page's og:title/og:url on every page). WARNING: Next REPLACES (does not merge)
// the layout's openGraph object as soon as a page declares one → the default
// image has to be repeated here, otherwise og:image disappears (verified on the
// prod render).
// `path` = root-relative path in the default locale (resolved via metadataBase);
// passing `image` switches to a dedicated large card.
export const DEFAULT_OG_IMAGE = { url: '/opengraph-image', width: 1200, height: 630 };

export function ogMeta(title: string, description: string, path: string, locale: Locale, image?: string) {
  if (image) return ogVisual(image, title, description, locale);
  const url = localizeHref(path, locale) || '/';
  return {
    openGraph: {
      type: 'website' as const,
      locale: OG_LOCALE[locale],
      title,
      description,
      url,
      images: [{ ...DEFAULT_OG_IMAGE, alt: title }],
    },
    twitter: { card: 'summary_large_image' as const, title, description, images: [DEFAULT_OG_IMAGE.url] },
  };
}

// Does the page (default-locale path, no prefix) have a translated counterpart?
// Feeds the language switcher and the hreflang tags — reciprocal pairs only.
export function hasTranslatedVersion(path: string): boolean {
  const clean = path.replace(/\/+$/, '') || '/';
  if (TRANSLATED_EXACT.has(clean)) return true;
  if (TRANSLATED_PREFIXES.some((p) => clean === p || clean.startsWith(`${p}/`))) return true;
  if (clean.startsWith('/blog/')) return TRANSLATED_BLOG_SLUGS.has(clean.replace('/blog/', ''));
  return false;
}

// Compatibility alias with the original implementation (FR/EN site).
export const hasEnVersion = hasTranslatedVersion;
