// Kitesurf — Cloudflare's agent-oriented browser, reached over the Browser Run
// REST API. Fetches a page AFTER its JavaScript has run, from outside your
// network, without starting a local Chromium.
//
// WHAT IT IS FOR, AND WHAT IT IS NOT. On the Workers Free plan the quota is
// **one request every 10 seconds** and **10 minutes of browser time per day**
// (measured 2026-08-07 against the published limits, and confirmed by a 429 on
// a 3-second interval). That budget does not audit a 40-page site: keep the
// local Playwright run for that. Kitesurf earns its place where an outside
// vantage point is the point, and the page count is small:
//
//   - a smoke test that must render JS, from a machine that is not yours
//   - checking what a site serves to a visitor outside your network
//   - a screenshot of a live page without a local browser
//
// Credentials live in ~/.config/cloudflare/browser-run.env, mode 600, outside
// any repository. Nothing here reads a token from the command line, so it never
// lands in shell history.
//
// Usage:
//   node kitesurf.mjs content  <url>            # rendered HTML to stdout
//   node kitesurf.mjs screenshot <url> <out.png>
//   node kitesurf.mjs quota                     # what the account has left

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const ENV = join(homedir(), '.config/cloudflare/browser-run.env');

function credentials() {
  if (!existsSync(ENV)) {
    console.error(`✗ ${ENV} absent. Create it with CF_ACCOUNT_ID and CF_BROWSER_RUN_TOKEN,`);
    console.error('  then chmod 600. The token needs exactly one permission: Account · Browser Run · Edit.');
    process.exit(1);
  }
  const env = Object.fromEntries(
    readFileSync(ENV, 'utf8').split('\n')
      .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
      .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
  );
  if (!env.CF_ACCOUNT_ID || !env.CF_BROWSER_RUN_TOKEN) {
    console.error(`✗ ${ENV} lacks CF_ACCOUNT_ID or CF_BROWSER_RUN_TOKEN.`);
    process.exit(1);
  }
  return env;
}

const attendre = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * One call, with the wait the free tier requires rather than a blind retry.
 * A 429 here is a quota statement, not a transient blip: hammering it just
 * spends the daily budget on refusals.
 */
async function appeler(chemin, corps, { binaire = false, essais = 3 } = {}) {
  const { CF_ACCOUNT_ID: id, CF_BROWSER_RUN_TOKEN: token } = credentials();
  const url = `https://api.cloudflare.com/client/v4/accounts/${id}/browser-run/${chemin}?browser=kitesurf`;

  for (let n = 0; n < essais; n++) {
    const r = await fetch(url, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify(corps),
    });

    if (r.status === 429) {
      if (n === essais - 1) {
        console.error('✗ Rate limit. Free tier allows one request every 10 seconds and 10 minutes per day.');
        console.error('  Either wait, or run the local Playwright audit instead.');
        process.exit(2);
      }
      // The published floor is 10s; go slightly past it rather than racing it.
      await attendre(11_000 * (n + 1));
      continue;
    }

    if (binaire) {
      if (!r.ok) { console.error(`✗ HTTP ${r.status}`); process.exit(1); }
      return Buffer.from(await r.arrayBuffer());
    }

    const d = await r.json();
    if (!d.success) {
      console.error('✗', JSON.stringify(d.errors));
      process.exit(1);
    }
    return d.result;
  }
}

const [commande, cible, sortie] = process.argv.slice(2);

if (commande === 'content') {
  if (!cible) { console.error('usage: kitesurf.mjs content <url>'); process.exit(1); }
  process.stdout.write(await appeler('content', { url: cible }));
} else if (commande === 'screenshot') {
  if (!cible || !sortie) { console.error('usage: kitesurf.mjs screenshot <url> <out.png>'); process.exit(1); }
  const png = await appeler('screenshot', { url: cible, viewport: { width: 1440, height: 900 } }, { binaire: true });
  writeFileSync(sortie, png);
  console.log(`${sortie} · ${(png.length / 1024).toFixed(0)} Ko`);
} else if (commande === 'quota') {
  // No quota endpoint exists; the honest answer is to say so rather than to
  // print a number nobody measured.
  console.log('Browser Run publishes no quota endpoint. Free tier: 3 concurrent browsers,');
  console.log('one request per 10 seconds on Quick Actions, 10 minutes of browser time per day.');
  console.log('Consumption is visible in the dashboard under Workers & Pages, Browser Run.');
} else {
  console.error('usage: kitesurf.mjs <content|screenshot|quota> [url] [out.png]');
  process.exit(1);
}
