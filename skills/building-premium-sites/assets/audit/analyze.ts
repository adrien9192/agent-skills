// Deterministic analyzer: light crawl of a URL -> SiteSignals.
// 0 tokens, 0 external dependency. The head is parsed with regexes (enough for
// meta/JSON-LD extraction; no need for a full DOM tree here).

import { assertPublicUrl, safeFetch } from './fetch';
import type {
  AutomationSignals,
  DiscoverySignals,
  Platform,
  SecuritySignals,
  SeoSignals,
  SiteSignals,
} from './types';

const HEAD_CAP = 200_000; // parse at most the first 200 KB (head + start of body)

function attr(tag: string, name: string): string | null {
  const re = new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i');
  const m = tag.match(re);
  return m ? (m[2] ?? m[3] ?? '').trim() : null;
}

function metaContent(html: string, key: 'name' | 'property', value: string): string | null {
  const re = new RegExp(`<meta[^>]*\\b${key}\\s*=\\s*["']${value}["'][^>]*>`, 'i');
  const tag = html.match(re);
  return tag ? attr(tag[0], 'content') : null;
}

function detectPlatform(html: string, headers: Headers): Platform {
  // STRUCTURAL signals only (asset paths, headers, meta generator). Never a
  // dictionary word found in prose: a blog quoting "Magento" must not be detected
  // as Magento, and "mage/" matches "image/".
  const h = html.toLowerCase();
  const powered = (headers.get('x-powered-by') || '').toLowerCase();
  const generator = (metaContent(html, 'name', 'generator') || '').toLowerCase();

  if (headers.has('x-shopify-stage') || h.includes('cdn.shopify.com') || h.includes('/cdn/shop/') || h.includes('shopify.theme') || generator.includes('shopify')) {
    return 'shopify';
  }
  if (h.includes('/wp-content/plugins/woocommerce')) return 'woocommerce';
  if (h.includes('/wp-content/') || h.includes('/wp-includes/') || h.includes('/wp-json') || generator.includes('wordpress')) {
    return 'wordpress';
  }
  if (generator.includes('prestashop') || h.includes('/modules/ps_') || h.includes('prestashop=')) return 'prestashop';
  if (generator.includes('magento') || h.includes('/static/version') || h.includes('mage-cache') || h.includes('/static/frontend/')) return 'magento';
  if (h.includes('static.wixstatic.com') || headers.has('x-wix-request-id') || generator.includes('wix')) return 'wix';
  if (h.includes('static1.squarespace.com') || h.includes('squarespace.com/static') || generator.includes('squarespace')) return 'squarespace';
  if (h.includes('assets.website-files.com') || h.includes('assets-global.website-files.com') || generator.includes('webflow')) return 'webflow';
  if (h.includes('drupal.settings') || h.includes('/sites/default/files') || generator.includes('drupal') || powered.includes('drupal')) {
    return 'drupal';
  }
  return 'unknown';
}

function extractSeo(html: string): SeoSignals {
  const head = html.slice(0, HEAD_CAP);

  const titleM = head.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleM ? titleM[1].replace(/\s+/g, ' ').trim() : null;

  const description = metaContent(head, 'name', 'description');
  const robotsMeta = metaContent(head, 'name', 'robots');

  const canonicalTag = head.match(/<link[^>]*rel\s*=\s*["']canonical["'][^>]*>/i);
  const canonical = canonicalTag ? attr(canonicalTag[0], 'href') : null;

  const htmlTag = html.match(/<html[^>]*>/i);
  const htmlLang = htmlTag ? attr(htmlTag[0], 'lang') : null;

  const hreflang = Array.from(head.matchAll(/<link[^>]*hreflang\s*=\s*["']([^"']+)["'][^>]*>/gi)).map((m) => m[1]);

  const ogTags = head.match(/<meta[^>]*property\s*=\s*["']og:[^"']*["'][^>]*>/gi) || [];
  const ogImage = /property\s*=\s*["']og:image["']/i.test(head);
  const twitterCard = /name\s*=\s*["']twitter:card["']/i.test(head);

  const jsonLdTypes = Array.from(
    head.matchAll(/<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
  ).flatMap((m) => Array.from(m[1].matchAll(/"@type"\s*:\s*"([^"]+)"/g)).map((t) => t[1]));

  const h1Count = (html.match(/<h1[\s>]/gi) || []).length;
  const imgTags = html.match(/<img\b[^>]*>/gi) || [];
  const imagesWithoutAlt = imgTags.filter((t) => attr(t, 'alt') === null).length;

  return {
    title,
    titleLength: title ? title.length : 0,
    metaDescription: description,
    descriptionLength: description ? description.length : 0,
    canonical,
    robotsMeta,
    viewport: /name\s*=\s*["']viewport["']/i.test(head),
    htmlLang,
    hreflang: Array.from(new Set(hreflang)),
    ogCount: ogTags.length,
    ogImage,
    twitterCard,
    jsonLdTypes: Array.from(new Set(jsonLdTypes)),
    h1Count,
    imagesTotal: imgTags.length,
    imagesWithoutAlt,
  };
}

function extractSecurity(headers: Headers, finalUrl: string): SecuritySignals {
  return {
    https: finalUrl.startsWith('https://'),
    hsts: headers.has('strict-transport-security'),
    csp: headers.has('content-security-policy'),
    xContentTypeOptions: (headers.get('x-content-type-options') || '').toLowerCase() === 'nosniff',
    xFrameOptions: headers.has('x-frame-options') || headers.has('content-security-policy'),
    referrerPolicy: headers.has('referrer-policy'),
  };
}

function extractAutomation(html: string): AutomationSignals {
  const h = html.toLowerCase();
  const chatWidget = [
    'crisp.chat', 'intercom', 'tawk.to', 'drift.com', 'hubspot', 'zendesk',
    'livechat', 'chatbot', 'voiceflow', 'manychat',
  ].some((sig) => h.includes(sig));
  const analytics = [
    'gtag(', 'googletagmanager.com', 'google-analytics.com', 'plausible.io',
    'matomo', 'clarity.ms', 'segment.com',
  ].some((sig) => h.includes(sig));
  return {
    forms: (html.match(/<form\b/gi) || []).length,
    chatWidget,
    analytics,
  };
}

async function probeDiscovery(origin: string, robotsBody: string, headHtml: string): Promise<DiscoverySignals> {
  const head = headHtml.slice(0, HEAD_CAP).toLowerCase();
  const [sitemap, llms] = await Promise.all([
    safeFetch(`${origin}/sitemap.xml`),
    safeFetch(`${origin}/llms.txt`),
  ]);
  const rss =
    head.includes('application/rss+xml') ||
    head.includes('application/atom+xml');
  return {
    robotsTxt: robotsBody.length > 0,
    sitemap: sitemap.ok || /sitemap\s*:/i.test(robotsBody),
    llmsTxt: llms.ok && llms.body.length > 0,
    rss,
    contentSignal: /content-signal/i.test(robotsBody),
  };
}

const ECOMMERCE_PLATFORMS: ReadonlySet<Platform> = new Set<Platform>([
  'shopify', 'woocommerce', 'prestashop', 'magento',
]);

/** Entry point: validates the URL, crawls it, returns the signals. */
export async function analyzeSite(rawUrl: string): Promise<SiteSignals> {
  const fetchedAt = new Date().toISOString();
  const validated = await assertPublicUrl(rawUrl);

  const empty = (errors: string[]): SiteSignals => ({
    url: rawUrl,
    finalUrl: rawUrl,
    status: 0,
    fetchedAt,
    platform: 'unknown',
    isEcommerce: false,
    seo: {
      title: null, titleLength: 0, metaDescription: null, descriptionLength: 0,
      canonical: null, robotsMeta: null, viewport: false, htmlLang: null,
      hreflang: [], ogCount: 0, ogImage: false, twitterCard: false,
      jsonLdTypes: [], h1Count: 0, imagesTotal: 0, imagesWithoutAlt: 0,
    },
    discovery: { robotsTxt: false, sitemap: false, llmsTxt: false, rss: false, contentSignal: false },
    security: { https: false, hsts: false, csp: false, xContentTypeOptions: false, xFrameOptions: false, referrerPolicy: false },
    automation: { forms: 0, chatWidget: false, analytics: false },
    errors,
  });

  if (!validated) {
    return empty(['URL invalide ou non accessible publiquement.']);
  }

  const origin = validated.origin;
  const main = await safeFetch(validated.toString());
  if (!main.ok || main.body.length === 0) {
    return empty([main.error ? `Echec du chargement : ${main.error}` : `Reponse HTTP ${main.status}.`]);
  }

  const robots = await safeFetch(`${origin}/robots.txt`);
  const platform = detectPlatform(main.body, main.headers);

  return {
    url: rawUrl,
    finalUrl: main.finalUrl,
    status: main.status,
    fetchedAt,
    platform,
    isEcommerce: ECOMMERCE_PLATFORMS.has(platform) || /add[- ]to[- ]cart|ajouter au panier|"@type"\s*:\s*"product"/i.test(main.body),
    seo: extractSeo(main.body),
    discovery: await probeDiscovery(origin, robots.ok ? robots.body : '', main.body),
    security: extractSecurity(main.headers, main.finalUrl),
    automation: extractAutomation(main.body),
    errors: [],
  };
}
