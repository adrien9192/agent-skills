#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const round = (value, digits = 3) => Number(Number(value).toFixed(digits));

function fail(message) {
  throw new Error(message);
}

function option(argv, name, fallback = null) {
  const index = argv.indexOf(name);
  return index >= 0 && argv[index + 1] ? argv[index + 1] : fallback;
}

function parseInteger(value, label, min, max) {
  if (!/^\d+$/.test(String(value))) fail(`${label} must be an integer`);
  const parsed = Number(value);
  if (parsed < min || parsed > max) fail(`${label} must be between ${min} and ${max}`);
  return parsed;
}

function analyse(groups, { reducedMotion = false, viewportWidth = 1440 } = {}) {
  const findings = [];

  for (const group of groups) {
    let unchangedTransitions = 0;
    let maxUnchangedTransitions = 0;
    for (let index = 1; index < group.samples.length; index += 1) {
      const before = group.samples[index - 1];
      const after = group.samples[index];
      if (!before.hold && !after.hold && before.signature === after.signature) {
        unchangedTransitions += 1;
        maxUnchangedTransitions = Math.max(maxUnchangedTransitions, unchangedTransitions);
      } else {
        unchangedTransitions = 0;
      }
    }
    if (!reducedMotion && maxUnchangedTransitions >= 2) {
      findings.push({ code: 'DEAD_SCROLL', act: group.act, consecutiveTransitions: maxUnchangedTransitions });
    }

    const cues = new Map();
    const videos = new Map();
    const pans = new Map();
    for (const sample of group.samples) {
      for (const cue of sample.cues) {
        cues.set(cue.id, Math.max(cues.get(cue.id) ?? 0, cue.opacity));
      }
      for (const video of sample.videos) {
        const values = videos.get(video.id) ?? [];
        if (video.visible) values.push(video.currentTime);
        videos.set(video.id, values);
      }
      for (const pan of sample.pans) {
        const value = pans.get(pan.id) ?? { overflow: pan.overflow, positions: [] };
        value.overflow = Math.max(value.overflow, pan.overflow);
        value.positions.push(pan.x);
        pans.set(pan.id, value);
      }
    }

    for (const [id, peakOpacity] of cues) {
      if (peakOpacity < 0.98) findings.push({ code: 'CUE_NEVER_PEAKS', act: group.act, cue: id, peakOpacity: round(peakOpacity) });
    }

    if (!reducedMotion) {
      for (const [id, times] of videos) {
        if (times.length >= 3 && Math.max(...times) - Math.min(...times) < 0.05) {
          findings.push({ code: 'FROZEN_CLIP', act: group.act, video: id, visibleSamples: times.length });
        }
      }
      for (const [id, pan] of pans) {
        if (pan.overflow < viewportWidth * 0.5) {
          findings.push({ code: 'PAN_NO_OVERFLOW', act: group.act, pan: id, overflow: round(pan.overflow) });
          continue;
        }
        if (Math.max(...pan.positions) - Math.min(...pan.positions) < 10) {
          findings.push({ code: 'PAN_NO_TRAVEL', act: group.act, pan: id });
        }
      }
    }
  }

  return findings;
}

function selfTest() {
  const sample = (signature, overrides = {}) => ({
    signature,
    hold: false,
    cues: [{ id: 'headline', opacity: 1 }],
    videos: [{ id: 'hero', visible: true, currentTime: Number(signature) || 0 }],
    pans: [],
    ...overrides,
  });
  const healthy = [{ act: 'healthy', samples: [sample('0'), sample('1'), sample('2')] }];
  if (analyse(healthy).length) fail('healthy canary produced a finding');

  const dead = [{ act: 'dead', samples: [sample('x'), sample('x'), sample('x')] }];
  if (!analyse(dead).some((finding) => finding.code === 'DEAD_SCROLL')) fail('dead-scroll canary was missed');

  const hold = [{ act: 'hold', samples: [sample('x', { hold: true }), sample('x', { hold: true }), sample('x', { hold: true })] }];
  if (analyse(hold).some((finding) => finding.code === 'DEAD_SCROLL')) fail('authored hold was rejected');

  const weakCue = [{ act: 'weak', samples: [sample('0', { cues: [{ id: 'weak', opacity: 0.7 }] }), sample('1', { cues: [{ id: 'weak', opacity: 0.8 }] })] }];
  if (!analyse(weakCue).some((finding) => finding.code === 'CUE_NEVER_PEAKS')) fail('weak-cue canary was missed');

  const frozen = [{ act: 'frozen', samples: [0, 1, 2].map((index) => sample(String(index), { videos: [{ id: 'clip', visible: true, currentTime: 0 }] })) }];
  if (!analyse(frozen).some((finding) => finding.code === 'FROZEN_CLIP')) fail('frozen-clip canary was missed');

  const pan = [{ act: 'pan', samples: [0, 1, 2].map((index) => sample(String(index), { videos: [], pans: [{ id: 'rail', overflow: 100, x: index * 50 }] })) }];
  if (!analyse(pan, { viewportWidth: 1440 }).some((finding) => finding.code === 'PAN_NO_OVERFLOW')) fail('pan-overflow canary was missed');

  console.log('ok scroll audit canaries');
}

function chromeCandidates() {
  return [
    process.env.AUDIT_SCROLL_CHROME,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/snap/bin/chromium',
  ].filter((candidate) => candidate && fs.existsSync(candidate));
}

function loadChromium() {
  try {
    return createRequire(path.join(process.cwd(), 'package.json'))('playwright').chromium;
  } catch {
    try {
      return createRequire(path.join(process.cwd(), 'package.json'))('playwright-core').chromium;
    } catch {
      fail('playwright not found; run this from the site project after installing playwright');
    }
  }
}

async function settle(page, timeoutMs = 3500) {
  const started = Date.now();
  let previous = '';
  let stable = 0;
  while (Date.now() - started < timeoutMs) {
    const current = await page.evaluate(() => JSON.stringify({
      states: [...document.querySelectorAll('[data-scroll-verify-state]')]
        .map((element) => element.getAttribute('data-scroll-verify-state')),
      videos: [...document.querySelectorAll('video[data-scroll-scrub]')]
        .map((video) => `${video.seeking}:${video.currentTime.toFixed(3)}`),
    }));
    if (current === previous && !current.includes('true:')) stable += 1;
    else stable = 0;
    if (stable >= 2) return;
    previous = current;
    await page.waitForTimeout(80);
  }
}

async function collectSample(page, actIndex, actId, y) {
  await page.evaluate((scrollY) => window.scrollTo({ top: scrollY, behavior: 'instant' }), y);
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await settle(page);

  return page.evaluate(({ index, id, position }) => {
    const act = [...document.querySelectorAll('[data-scroll-act]')][index];
    const visible = (element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth
        && style.display !== 'none' && style.visibility !== 'hidden';
    };
    const transformX = (element) => {
      const transform = getComputedStyle(element).transform;
      if (!transform || transform === 'none') return 0;
      const matrix = new DOMMatrixReadOnly(transform);
      return matrix.m41;
    };
    const states = [...document.querySelectorAll('[data-scroll-verify-state]')]
      .filter(visible)
      .map((element, stateIndex) => ({
        id: element.id || `state-${stateIndex}`,
        value: element.getAttribute('data-scroll-verify-state') || '',
        hold: element.getAttribute('data-scroll-verify-hold') === 'true',
      }));
    const cues = [...act.querySelectorAll('[data-scroll-cue]')].map((element, cueIndex) => ({
      id: element.id || `${id}-cue-${cueIndex}`,
      opacity: Number(getComputedStyle(element).opacity),
    }));
    const videos = [...act.querySelectorAll('video[data-scroll-scrub]')].map((video, videoIndex) => ({
      id: video.id || `${id}-video-${videoIndex}`,
      visible: visible(video),
      currentTime: video.currentTime,
      readyState: video.readyState,
    }));
    const pans = [...act.querySelectorAll('[data-scroll-pan]')].map((track, panIndex) => ({
      id: track.id || `${id}-pan-${panIndex}`,
      overflow: Math.max(0, track.scrollWidth - (track.parentElement?.clientWidth || innerWidth)),
      x: transformX(track),
    }));
    const signature = JSON.stringify({
      states: states.map(({ id: stateId, value }) => [stateId, value]),
      cues: cues.map((cue) => [cue.id, Number(cue.opacity.toFixed(3))]),
      videos: videos.map((video) => [video.id, Number(video.currentTime.toFixed(3)), video.readyState]),
      pans: pans.map((pan) => [pan.id, Math.round(pan.x)]),
    });
    return {
      y: position,
      signature,
      hold: states.some((state) => state.hold) || act.getAttribute('data-scroll-verify-hold') === 'true',
      cues,
      videos,
      pans,
    };
  }, { index: actIndex, id: actId, position: y });
}

async function createContactSheet(chromium, executablePath, frames, output) {
  const browser = await chromium.launch(executablePath ? { executablePath, headless: true } : { channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  const cards = frames.map((frame) => {
    const data = fs.readFileSync(frame.file).toString('base64');
    return `<figure><img src="data:image/png;base64,${data}"><figcaption>${frame.label}</figcaption></figure>`;
  }).join('');
  await page.setContent(`<!doctype html><style>
    body{margin:0;padding:20px;background:#111;color:#eee;font:14px system-ui}
    main{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
    figure{margin:0;background:#222;border:1px solid #444}img{display:block;width:100%;height:auto}
    figcaption{padding:7px 9px}
  </style><main>${cards}</main>`);
  await page.screenshot({ path: output, fullPage: true });
  await browser.close();
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv[0] === '--self-test') return selfTest();

  const url = option(argv, '--url', 'http://localhost:3000');
  const output = path.resolve(option(argv, '--out', 'lab/scroll'));
  const width = parseInteger(option(argv, '--width', '1440'), 'width', 320, 3840);
  const height = parseInteger(option(argv, '--height', '900'), 'height', 320, 2160);
  const perAct = parseInteger(option(argv, '--per-act', '6'), 'per-act', 3, 12);
  const reducedMotion = argv.includes('--reduced-motion');
  const expectedTitle = option(argv, '--expect-title');
  const expectedAsset = option(argv, '--expect-asset');
  fs.mkdirSync(output, { recursive: true });

  const chromium = loadChromium();
  const executablePath = chromeCandidates()[0] || null;
  const browser = await chromium.launch(executablePath ? { executablePath, headless: true } : { channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    reducedMotion: reducedMotion ? 'reduce' : 'no-preference',
  });
  if (!reducedMotion) {
    await context.addInitScript(() => { window.__BUILD_SITE_MOTION_AUDIT__ = true; });
  }
  const page = await context.newPage();
  const runtimeErrors = [];
  page.on('console', (message) => { if (message.type() === 'error') runtimeErrors.push(`console: ${message.text()}`); });
  page.on('pageerror', (error) => runtimeErrors.push(`page: ${error.message}`));
  page.on('requestfailed', (request) => runtimeErrors.push(`request: ${request.url()} ${request.failure()?.errorText || ''}`));

  const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
  if (!response?.ok()) fail(`${url} returned ${response?.status() ?? 'no response'}`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForSelector('[data-scroll-experience]', { timeout: 15000 });
  await page.waitForTimeout(400);

  const title = await page.title();
  if (expectedTitle && !title.includes(expectedTitle)) fail(`wrong served page: title "${title}" does not include "${expectedTitle}"`);
  if (expectedAsset) {
    const asset = await context.request.get(new URL(expectedAsset, url).href);
    if (!asset.ok()) fail(`expected asset returned ${asset.status()}: ${expectedAsset}`);
  }

  const acts = await page.evaluate((samples) => {
    const fractions = Array.from({ length: samples }, (_, index) => 0.02 + (index / (samples - 1)) * 0.96);
    const max = document.documentElement.scrollHeight - innerHeight;
    return [...document.querySelectorAll('[data-scroll-act]')].map((act, index) => {
      const rect = act.getBoundingClientRect();
      const top = rect.top + scrollY;
      const height = Math.max(act.offsetHeight, rect.height);
      const kind = act.getAttribute('data-scroll-kind') || 'custom';
      const pinned = ['pin', 'scrub', 'pan'].includes(kind);
      const positions = fractions.map((fraction) => pinned
        ? top + Math.max(1, height - innerHeight) * fraction
        : top - innerHeight + (height + innerHeight) * fraction);
      if (kind === 'scrub') {
        positions.push(top - innerHeight * 0.25, top + height - innerHeight * 0.75);
      }
      return {
        index,
        id: act.getAttribute('data-scroll-act') || `act-${index}`,
        kind,
        positions: [...new Set(positions.map((position) => Math.max(0, Math.min(max, Math.round(position)))))]
          .sort((a, b) => a - b),
      };
    });
  }, perAct);
  if (!acts.length) fail('no [data-scroll-act] found inside the scroll experience');

  const groups = [];
  const frames = [];
  let frameIndex = 0;
  for (const act of acts) {
    const samples = [];
    for (const y of act.positions) {
      const sample = await collectSample(page, act.index, act.id, y);
      samples.push(sample);
      const filename = `${String(frameIndex).padStart(3, '0')}-${act.id}.png`.replace(/[^a-zA-Z0-9._-]/g, '-');
      const file = path.join(output, filename);
      await page.screenshot({ path: file });
      frames.push({ file, label: `${act.id} · y=${y}` });
      frameIndex += 1;
    }
    groups.push({ act: act.id, kind: act.kind, samples });
  }

  await context.close();
  await browser.close();

  const findings = analyse(groups, { reducedMotion, viewportWidth: width });
  findings.push(...runtimeErrors.map((message) => ({ code: 'RUNTIME_ERROR', message })));
  const report = { ok: findings.length === 0, url, title, width, height, reducedMotion, acts: acts.map(({ id, kind }) => ({ id, kind })), findings, groups };
  fs.writeFileSync(path.join(output, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  await createContactSheet(chromium, executablePath, frames, path.join(output, 'sheet.png'));

  if (findings.length) {
    console.error(JSON.stringify({ ok: false, title, findings, report: path.join(output, 'report.json'), sheet: path.join(output, 'sheet.png') }, null, 2));
    process.exitCode = 1;
    return;
  }
  console.log(JSON.stringify({ ok: true, title, acts: acts.length, frames: frames.length, report: path.join(output, 'report.json'), sheet: path.join(output, 'sheet.png') }, null, 2));
}

main().catch((error) => {
  console.error(`ERROR: ${error.message}`);
  process.exitCode = 1;
});

