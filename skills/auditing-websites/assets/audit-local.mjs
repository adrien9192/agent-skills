// QA locale automatisée — GÉNÉRIQUE, à copier dans scripts/ du projet puis lancer
// contre le serveur local (npm run dev ou start). Zéro token LLM : Playwright +
// axe-core, déterministe. Prérequis : npm i -D playwright @axe-core/playwright
// && npx playwright install chromium.
//
// Configuration par variables d'environnement (toutes optionnelles) :
//   AUDIT_BASE_URL          défaut http://localhost:3000
//   AUDIT_PAGES             chemins séparés par des virgules ; absent = auto-découverte
//                           via /sitemap.xml (échantillon : 2 URLs max par famille, plafond 20)
//   AUDIT_CANONICAL_ORIGIN  origine attendue des canonical (ex. https://client.fr) ;
//                           défaut = AUDIT_BASE_URL si https, sinon seul le caractère
//                           absolu du canonical est vérifié
//   AUDIT_BRAND             chaîne attendue dans chaque <title> (marque) ; absent = contrôle sauté
//   AUDIT_MENU_SELECTOR     déclencheur du menu mobile ; défaut 'header button' ; 'skip' = sauté
//   AUDIT_CV_SELECTOR       sections en content-visibility:auto ; défaut '.section'
//   AUDIT_MACHINE_PAGES     défaut : robots.txt, sitemap.xml, llms.txt, llms-full.txt, manifest.webmanifest
//   AUDIT_API_PAGES         routes POST testées avec payload invalide ; défaut /api/contact ; '' = aucune
//   AUDIT_MIN_JSONLD        nombre minimal de blocs JSON-LD par page ; défaut 2
//
// Piège connu : revalider AUDIT_MENU_SELECTOR et AUDIT_CV_SELECTOR à chaque
// évolution du DOM ciblé — un sélecteur qui matche 0 élément est un échec
// silencieux, pas un succès.

import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';

const base = process.env.AUDIT_BASE_URL || 'http://localhost:3000';
const brand = process.env.AUDIT_BRAND || null;
const canonicalOrigin =
  process.env.AUDIT_CANONICAL_ORIGIN || (base.startsWith('https://') ? base : null);
const menuSelector = process.env.AUDIT_MENU_SELECTOR || 'header button';
const cvSelector = process.env.AUDIT_CV_SELECTOR || '.section';
const minJsonLd = Number(process.env.AUDIT_MIN_JSONLD ?? 2);

const machinePages = (process.env.AUDIT_MACHINE_PAGES
  ? process.env.AUDIT_MACHINE_PAGES.split(',')
  : ['/robots.txt', '/sitemap.xml', '/llms.txt', '/llms-full.txt', '/manifest.webmanifest']
).map((p) => p.trim()).filter(Boolean);
const apiPages = (process.env.AUDIT_API_PAGES ?? '/api/contact')
  .split(',').map((p) => p.trim()).filter(Boolean);

// Auto-découverte des pages depuis le sitemap : échantillonne chaque famille
// d'URL (premier segment de chemin) pour couvrir tous les templates sans
// crawler tout le site.
async function discoverPages() {
  const explicit = process.env.AUDIT_PAGES;
  if (explicit) return explicit.split(',').map((p) => p.trim()).filter(Boolean);
  const res = await fetch(`${base}/sitemap.xml`).catch(() => null);
  if (!res?.ok) {
    console.warn('sitemap.xml introuvable — fallback sur la page d’accueil seule. Définir AUDIT_PAGES.');
    return ['/'];
  }
  const xml = await res.text();
  const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => { try { return new URL(m[1].trim()).pathname; } catch { return null; } })
    .filter(Boolean);
  const byFamily = new Map();
  for (const p of paths) {
    const family = p.split('/').filter(Boolean)[0] ?? '(racine)';
    const bucket = byFamily.get(family) ?? [];
    if (bucket.length < 2) bucket.push(p);
    byFamily.set(family, bucket);
  }
  const sample = ['/', ...[...byFamily.values()].flat().filter((p) => p !== '/')];
  return [...new Set(sample)].slice(0, 20);
}

const pages = await discoverPages();
const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 1000 },
];

const browser = await chromium.launch({ headless: true });
const errors = [];
const report = [];

for (const path of pages) {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const consoleErrors = [];
    const failedRequests = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('requestfailed', (request) => failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText}`));

    const response = await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
    assert.equal(response?.status(), 200, `${path} should return 200`);
    assert.equal(await page.locator('h1').count(), 1, `${path} should have exactly one h1`);

    // content-visibility:auto fausse la geometrie qu'axe utilise pour calculer les
    // fonds (sections hors ecran non layoutees -> boites superposees -> faux positifs
    // color-contrast, verifie par A/B le 2026-07-14 : 16 -> 0 violations). On force le
    // layout complet pour que axe mesure les couleurs reellement peintes.
    await page.addStyleTag({ content: `${cvSelector}{content-visibility:visible!important}` });

    const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    assert.equal(horizontalOverflow, false, `${path} should not overflow horizontally on ${viewport.name}`);

    const title = await page.title();
    if (brand) assert.ok(title.includes(brand), `${path} title should include ${brand}`);
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    assert.ok(description && description.length >= 50 && description.length <= 170, `${path} description should be 50-170 chars`);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    if (canonicalOrigin) {
      assert.ok(canonical?.startsWith(canonicalOrigin), `${path} canonical should start with ${canonicalOrigin}`);
    } else {
      assert.ok(canonical?.startsWith('https://'), `${path} should have an absolute canonical`);
    }
    const jsonLdCount = await page.locator('script[type="application/ld+json"]').count();
    assert.ok(jsonLdCount >= minJsonLd, `${path} should include at least ${minJsonLd} JSON-LD block(s)`);
    const imageCount = await page.locator('img[alt]').count();
    assert.ok(imageCount >= 1, `${path} should include at least one meaningful image with alt text`);

    // Videos explicatives (pattern Remotion offline ou autre) : chaque <video> doit
    // porter un poster (evite frame blanche + CLS), etre muted si autoplay (politique
    // navigateur), et sa source doit repondre en 200 — piege recurrent : une .mp4 non
    // re-rendue au build sort un bloc 404 en prod. Le HEAD reseau n'est joue qu'en
    // desktop (source identique aux 3 viewports, evite un triple appel).
    const videos = await page.locator('video').evaluateAll((els) =>
      els.map((v) => ({
        src: v.currentSrc || v.getAttribute('src') || v.querySelector('source')?.getAttribute('src') || '',
        poster: v.getAttribute('poster'),
        autoplay: v.hasAttribute('autoplay'),
        muted: v.muted || v.hasAttribute('muted'),
      })),
    );
    for (const v of videos) {
      assert.ok(v.poster, `${path} <video> should have a poster attribute (${v.src || 'no src'})`);
      if (v.autoplay) assert.ok(v.muted, `${path} autoplay <video> must be muted (${v.src})`);
      if (v.src && viewport.name === 'desktop') {
        const abs = new URL(v.src, `${base}${path}`).href;
        const head = await fetch(abs, { method: 'HEAD' }).catch(() => null);
        assert.ok(head?.ok, `${path} <video> source should return 200 — rendu manquant ? (${v.src})`);
      }
    }

    if (viewport.name === 'mobile' && menuSelector !== 'skip') {
      const menuVisible = await page.locator(menuSelector).first().isVisible().catch(() => false);
      assert.equal(menuVisible, true, `${path} mobile menu (${menuSelector}) should be visible — sélecteur obsolète ?`);
    }

    const axe = await new AxeBuilder({ page }).analyze();
    if (axe.violations.length) {
      errors.push({ path, viewport: viewport.name, axe: axe.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })) });
    }
    if (consoleErrors.length) errors.push({ path, viewport: viewport.name, consoleErrors });
    if (failedRequests.length) errors.push({ path, viewport: viewport.name, failedRequests });

    report.push({ path, viewport: viewport.name, title, descriptionLength: description.length, canonical });
    await context.close();
  }
}

for (const path of machinePages) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const response = await page.goto(`${base}${path}`);
  assert.equal(response?.status(), 200, `${path} should return 200`);
  report.push({ path, status: response.status(), contentType: response.headers()['content-type'] });
  await context.close();
}

for (const path of apiPages) {
  const response = await fetch(`${base}${path}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({}) });
  assert.ok([400, 503].includes(response.status), `${path} should validate bad submissions without crashing`);
  report.push({ path, status: response.status, contentType: response.headers.get('content-type') });
}

await browser.close();

if (errors.length) {
  console.error(JSON.stringify({ errors, report }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, checkedPages: pages.length, viewports: viewports.map((v) => v.name), machinePages, apiPages, report }, null, 2));
