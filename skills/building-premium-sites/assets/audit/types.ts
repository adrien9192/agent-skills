// Types for the site audit engine (the "free audit" lead magnet).
// SiteSignals = raw crawl output (deterministic, 0 tokens).
// Scoring + mapping onto the site's offers lives in scoring.ts.

export type Platform =
  | 'wordpress'
  | 'woocommerce'
  | 'shopify'
  | 'prestashop'
  | 'magento'
  | 'wix'
  | 'squarespace'
  | 'webflow'
  | 'drupal'
  | 'unknown';

export interface SeoSignals {
  title: string | null;
  titleLength: number;
  metaDescription: string | null;
  descriptionLength: number;
  canonical: string | null;
  robotsMeta: string | null;
  viewport: boolean;
  htmlLang: string | null;
  hreflang: string[];
  ogCount: number;
  ogImage: boolean;
  twitterCard: boolean;
  jsonLdTypes: string[];
  h1Count: number;
  imagesTotal: number;
  imagesWithoutAlt: number;
}

export interface DiscoverySignals {
  robotsTxt: boolean;
  sitemap: boolean;
  llmsTxt: boolean;
  rss: boolean;
  contentSignal: boolean;
}

export interface SecuritySignals {
  https: boolean;
  hsts: boolean;
  csp: boolean;
  xContentTypeOptions: boolean;
  xFrameOptions: boolean;
  referrerPolicy: boolean;
}

export interface AutomationSignals {
  forms: number;
  chatWidget: boolean;
  analytics: boolean;
}

export interface SiteSignals {
  url: string;
  finalUrl: string;
  status: number;
  fetchedAt: string;
  platform: Platform;
  isEcommerce: boolean;
  seo: SeoSignals;
  discovery: DiscoverySignals;
  security: SecuritySignals;
  automation: AutomationSignals;
  errors: string[];
}
