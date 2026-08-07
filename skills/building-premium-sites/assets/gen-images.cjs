// Realistic image generator (Playwright + ChatGPT, persistent profile) —
// BLUEPRINT §12. Configure through env vars: GEN_IMAGES_OUT (defaults to
// ./public/generated of the current project), GEN_IMAGES_PROFILE (persistent
// browser profile).
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PROFILE = process.env.GEN_IMAGES_PROFILE || path.join(os.homedir(), '.cache/gen-images-profile');
const OUT = process.env.GEN_IMAGES_OUT || path.join(process.cwd(), 'public/generated');
const LOG = process.env.GEN_IMAGES_LOG || '/tmp/gen-images.log';
const MODE = process.argv[2] || 'login';

function log(m) {
  const line = `[${new Date().toISOString()}] ${m}\n`;
  try { fs.appendFileSync(LOG, line); } catch (e) {}
  console.log(m);
}

const REAL = "Photorealistic, ultra-detailed, sharp focus, professional commercial photography, shot on 50mm, shallow depth of field, natural warm daylight, premium and trustworthy B2B mood. Color palette: cream, warm beige and soft grey with a subtle violet-to-magenta accent in the decor. Any screen content must be softly out of focus and NOT legible. Absolutely no readable text, no UI labels, no logos, no watermark, no captions.";

const JOBS = {
  'offer-shopify-realistic': "Ultra-realistic wide 16:9 commercial photograph. Over-the-shoulder view of an entrepreneur managing an online fashion store on a laptop in a bright modern studio; a few elegant products and kraft shipping boxes neatly arranged on a clean desk, soft bokeh background. " + REAL,
  'offer-wordpress-realistic': "Ultra-realistic wide 16:9 commercial photograph. A professional web designer reviewing a corporate website layout on a large desktop monitor in an elegant bright office; tidy desk with a notebook and a coffee cup, plants softly blurred behind. " + REAL,
  'offer-automatisation-realistic': "Ultra-realistic wide 16:9 commercial photograph. A focused operations professional at a clean minimalist desk with a laptop and a second monitor, calmly orchestrating automated business workflows; bright airy modern office, subtle sense of efficiency, soft bokeh. " + REAL,
  'offer-pim-realistic': "Ultra-realistic wide 16:9 commercial photograph. A product manager organizing a neat grid of physical retail products on a bright studio table, a laptop nearby, soft daylight, orderly and structured composition suggesting a clean product catalogue. " + REAL,

  // --- extension: 11 remaining offers ---
  'offer-socle-wordpress-realistic': "Ultra-realistic wide 16:9 commercial photograph. Two web developers collaborating in a bright modern studio, reviewing a modular reusable website design system on a large monitor; the desk shows tidy color swatches, a notebook with neat sketches of layout blocks, like a clean construction kit. " + REAL,
  'offer-wordpress-multisite-realistic': "Ultra-realistic wide 16:9 commercial photograph. A digital manager in a bright modern office overseeing several brand websites displayed across two large desktop monitors side by side, organized and consistent, one shared foundation; calm professional mood, soft bokeh. " + REAL,
  'offer-site-sur-mesure-realistic': "Ultra-realistic wide 16:9 commercial photograph. An elegant sleek corporate setting, a designer presenting a premium bespoke institutional website on a large wall screen to two executives in a refined modern boardroom, high-end and trustworthy, warm architectural light. " + REAL,
  'offer-ecommerce-sur-mesure-realistic': "Ultra-realistic wide 16:9 commercial photograph. A B2B e-commerce specialist working on a custom wholesale online platform across two monitors in a modern office, a tidy warehouse or stockroom softly blurred through a glass wall behind, professional and technical. " + REAL,
  'offer-gestion-catalogue-realistic': "Ultra-realistic wide 16:9 commercial photograph. A product content specialist at a bright clean desk structuring a product catalogue on a laptop, a few sample retail products and a notebook neatly arranged, organized and meticulous mood, screen out of focus. " + REAL,
  'offer-dam-realistic': "Ultra-realistic wide 16:9 commercial photograph. A creative professional in a bright studio organizing a large library of product photographs, a neat grid of printed product images pinned on a clean wall, a laptop on the desk, orderly visual asset management. " + REAL,
  'offer-comptabilite-realistic': "Ultra-realistic wide 16:9 commercial photograph. An accountant at a calm bright office desk with a laptop, a small tidy stack of paper invoices and a sleek calculator, organized and reassuring financial workflow, soft daylight, screen out of focus. " + REAL,
  'offer-achats-realistic': "Ultra-realistic wide 16:9 commercial photograph. A procurement manager in a bright modern office reviewing supplier purchase orders on a laptop, holding a tablet showing out-of-focus approval steps, organized and efficient back-office mood. " + REAL,
  'offer-content-commerce-realistic': "Ultra-realistic wide 16:9 commercial photograph. A content creator in a bright studio photographing an elegant product with a smartphone on a small tripod, a laptop nearby, shoppable content concept linking media to a store, warm soft light. " + REAL,
  'offer-shooting-ia-realistic': "Ultra-realistic wide 16:9 commercial photograph. A premium product photography studio setup: a single elegant cosmetic product on a clean reflective table under professional softbox lighting, a camera on a tripod softly blurred, high-end packshot scene. " + REAL,
  'offer-sales-realistic': "Ultra-realistic wide 16:9 commercial photograph. A sales operations professional at a desk in a bright modern office, wearing a discreet headset, a laptop showing an out-of-focus sales pipeline, focused and organized, confident professional mood. " + REAL,
};
const TEST_ONLY = ['offer-shopify-realistic'];
const REST = ['offer-wordpress-realistic', 'offer-automatisation-realistic', 'offer-pim-realistic'];
const EXTEND = ['offer-socle-wordpress-realistic', 'offer-wordpress-multisite-realistic', 'offer-site-sur-mesure-realistic', 'offer-ecommerce-sur-mesure-realistic', 'offer-gestion-catalogue-realistic', 'offer-dam-realistic', 'offer-comptabilite-realistic', 'offer-achats-realistic', 'offer-content-commerce-realistic', 'offer-shooting-ia-realistic', 'offer-sales-realistic'];

async function findComposer(page) {
  return await page.$('#prompt-textarea') || await page.$('div[contenteditable="true"]') || await page.$('textarea');
}

// Returns the best new content image: { src, w } or null. Logs candidates.
async function bestNewImage(page, baseline) {
  const cands = await page.evaluate((base) => {
    return Array.from(document.querySelectorAll('img'))
      .map(im => ({ src: im.currentSrc || im.src, w: im.naturalWidth || 0, h: im.naturalHeight || 0 }))
      .filter(o => o.src && !base.includes(o.src))
      .filter(o => !/avatar|profile|favicon|gravatar|sprite|emoji|\.svg(\?|$)/i.test(o.src))
      .filter(o => o.w >= 400 || /oaiusercontent|blob\.core\.windows\.net|files\.oai|^blob:/i.test(o.src));
  }, baseline);
  if (!cands.length) return null;
  cands.sort((a, b) => (b.w * b.h) - (a.w * a.h));
  return cands[0];
}

async function download(page, ctx, url, outFile) {
  if (url.startsWith('blob:') || url.startsWith('data:')) {
    const dataUrl = url.startsWith('data:') ? url : await page.evaluate(async (u) => {
      const r = await fetch(u); const b = await r.blob();
      return await new Promise(res => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(b); });
    }, url);
    fs.writeFileSync(outFile, Buffer.from(dataUrl.split(',')[1], 'base64'));
  } else {
    const resp = await ctx.request.get(url);
    if (!resp.ok()) throw new Error('HTTP ' + resp.status());
    fs.writeFileSync(outFile, await resp.body());
  }
  return fs.statSync(outFile).size;
}

(async () => {
  try { fs.writeFileSync(LOG, ''); } catch (e) {}
  log(`MODE=${MODE}`);
  const ctx = await chromium.launchPersistentContext(PROFILE, {
    headless: false,
    viewport: { width: 1320, height: 920 },
    args: ['--disable-blink-features=AutomationControlled'],
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto('https://chatgpt.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  // Auth via session cookie (resilient to login navigation).
  let logged = false;
  const maxPolls = MODE === 'login' ? 160 : 20;
  for (let i = 0; i < maxPolls; i++) {
    let authed = false;
    try {
      const cookies = await ctx.cookies();
      authed = cookies.some(c => /^__Secure-next-auth\.session-token/.test(c.name));
    } catch (e) {}
    if (authed) { logged = true; break; }
    if (i % 4 === 0) log(`... pas encore connecte. CONNECTEZ-VOUS dans la fenetre. ${i * 3}s`);
    await page.waitForTimeout(3000).catch(() => {});
  }
  if (!logged) { log('ECHEC: connexion non detectee.'); await page.screenshot({ path: '/tmp/ss-login-state.png' }); await ctx.close(); process.exit(2); }
  log('CONNECTE a ChatGPT.');
  if (MODE === 'login') { await page.waitForTimeout(1200); await ctx.close(); return; }

  const STOP_SEL = '[data-testid="stop-button"], button[aria-label*="Arrêt" i], button[aria-label*="Stop" i], button[aria-label*="streaming" i]';
  const jobs = (MODE === 'test') ? TEST_ONLY.map(k => [k, JOBS[k]])
    : (MODE === 'rest') ? REST.map(k => [k, JOBS[k]])
    : (MODE === 'extend') ? EXTEND.map(k => [k, JOBS[k]])
    : Object.entries(JOBS);
  for (const [base, prompt] of jobs) {
    try {
      log(`=== ${base}: nouveau chat`);
      await page.goto('https://chatgpt.com/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      await page.bringToFront().catch(() => {});
      const baseline = await page.evaluate(() => Array.from(document.querySelectorAll('img')).map(i => i.currentSrc || i.src));
      const composer = await findComposer(page);
      if (!composer) { log('composer introuvable, skip ' + base); continue; }
      await composer.click();
      await page.keyboard.type(prompt, { delay: 1 });
      await page.keyboard.press('Enter');
      log(`${base}: prompt envoye`);
      // wait for generation to start (stop button appears)
      await page.waitForSelector(STOP_SEL, { timeout: 30000 }).catch(() => {});

      let best = null;
      let finishedTicks = 0;
      for (let i = 0; i < 200; i++) { // hard cap ~10 min
        if (i % 8 === 0) { await page.bringToFront().catch(() => {}); }
        const b = await bestNewImage(page, baseline);
        if (b && (!best || (b.w * b.h) > (best.w * best.h))) best = b;
        const generating = await page.$(STOP_SEL);
        if (!generating) {
          finishedTicks++;
          // grab once more after it settles
          if (finishedTicks >= 2) {
            const b2 = await bestNewImage(page, baseline);
            if (b2 && (!best || (b2.w * b2.h) > (best.w * best.h))) best = b2;
            if (best && (best.w >= 256 || /oaiusercontent|blob\.core/i.test(best.src))) { log(`${base}: generation terminee`); break; }
            if (finishedTicks >= 5) { log(`${base}: termine sans image qualifiante`); break; }
          }
        } else {
          finishedTicks = 0;
        }
        if (i % 6 === 0) log(`... ${base} ${i * 3}s gen=${!!generating} best=${best ? best.w + 'px' : '-'}`);
        await page.waitForTimeout(3000);
      }
      if (!best) { log('ECHEC image: ' + base); await page.screenshot({ path: `/tmp/ss-noimg-${base}.png` }); continue; }

      const outFile = path.join(OUT, base + '.png');
      const sz = await download(page, ctx, best.src, outFile);
      log(`OK ${base}.png ${best.w}x${best.h} (${sz} octets)`);
    } catch (e) {
      log(`ERREUR ${base}: ${(e && e.message) || e}`);
    }
  }
  await page.screenshot({ path: '/tmp/ss-final.png' });
  log('TERMINE.');
  await page.waitForTimeout(2000);
  await ctx.close();
})().catch(e => { log('FATAL ' + (e && e.stack || e)); process.exit(1); });
