#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

function fail(message) {
  throw new Error(message);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: 'utf8', ...options });
  if (result.error || result.status !== 0) {
    const detail = (result.stderr || result.stdout || result.error?.message || '').trim();
    fail(`${path.basename(command)} failed${detail ? `: ${detail}` : ''}`);
  }
  return result.stdout;
}

function windowsCandidates() {
  const base = path.join(os.homedir(), 'AppData', 'Local', 'Microsoft', 'WinGet', 'Packages');
  if (!fs.existsSync(base)) return [];
  const found = [];
  for (const packageName of fs.readdirSync(base)) {
    if (!/^Gyan\.FFmpeg/i.test(packageName)) continue;
    const packageDir = path.join(base, packageName);
    for (const release of fs.readdirSync(packageDir)) {
      const executable = path.join(packageDir, release, 'bin', 'ffmpeg.exe');
      if (fs.existsSync(executable)) found.push(executable);
    }
  }
  return found;
}

function probeCandidate(candidate) {
  const result = spawnSync(candidate, ['-hide_banner', '-filters'], { encoding: 'utf8' });
  if (result.error || result.status !== 0) return null;
  const filterCount = result.stdout.split(/\r?\n/).filter(Boolean).length;
  return { executable: candidate, filterCount };
}

function pickFfmpeg() {
  const candidates = [
    process.env.BUILD_SITE_FFMPEG,
    'ffmpeg',
    ...windowsCandidates(),
    '/opt/homebrew/bin/ffmpeg',
    '/usr/local/bin/ffmpeg',
    '/usr/bin/ffmpeg',
    '/snap/bin/ffmpeg',
  ].filter(Boolean);
  let best = null;
  for (const candidate of [...new Set(candidates)]) {
    const probe = probeCandidate(candidate);
    if (!probe) continue;
    if (!best || probe.filterCount > best.filterCount) best = probe;
    if (probe.filterCount > 200) break;
  }
  if (!best || best.filterCount <= 200) {
    fail('no full ffmpeg build found; install one or set BUILD_SITE_FFMPEG');
  }
  const encoders = run(best.executable, ['-hide_banner', '-encoders']);
  if (!/\blibx264\b/.test(encoders)) fail(`${best.executable} has no libx264 encoder`);
  return best;
}

function parseInteger(value, label, { min, max }) {
  if (!/^\d+$/.test(String(value ?? ''))) fail(`${label} must be an integer`);
  const parsed = Number(value);
  if (parsed < min || parsed > max) fail(`${label} must be between ${min} and ${max}`);
  return parsed;
}

function option(argv, name, fallback = null) {
  const index = argv.indexOf(name);
  return index >= 0 && argv[index + 1] ? argv[index + 1] : fallback;
}

function parse(argv) {
  const mobile = argv.includes('--mobile');
  const input = argv[0];
  const output = argv[1];
  const defaults = mobile
    ? { height: 720, gop: 4, crf: 24 }
    : { height: 1080, gop: 8, crf: 20 };
  return {
    input,
    output,
    mobile,
    poster: option(argv, '--poster'),
    height: parseInteger(option(argv, '--height', defaults.height), 'height', { min: 240, max: 2160 }),
    gop: parseInteger(option(argv, '--gop', defaults.gop), 'gop', { min: 1, max: 30 }),
    crf: parseInteger(option(argv, '--crf', process.env.BUILD_SITE_CRF || defaults.crf), 'crf', { min: 0, max: 51 }),
  };
}

function selfTest() {
  const desktop = parse(['in.mp4', 'out.mp4']);
  const mobile = parse(['in.mp4', 'out.mp4', '--mobile']);
  if (desktop.height !== 1080 || desktop.gop !== 8 || desktop.crf !== 20) fail('desktop defaults changed');
  if (mobile.height !== 720 || mobile.gop !== 4 || mobile.crf !== 24) fail('mobile defaults changed');
  let rejected = false;
  try { parse(['in.mp4', 'out.mp4', '--gop', '0']); } catch { rejected = true; }
  if (!rejected) fail('invalid GOP canary was accepted');
  console.log('ok scroll video encoder canaries');
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv[0] === '--self-test') return selfTest();
  if (argv[0] === '--probe') {
    console.log(JSON.stringify(pickFfmpeg(), null, 2));
    return;
  }

  const options = parse(argv);
  if (!options.input || !options.output) {
    console.error(`usage:
  node encode-scroll-video.mjs <input> <output> [--mobile] [--height px] [--gop frames] [--crf n] [--poster poster.jpg]
  node encode-scroll-video.mjs --probe
  node encode-scroll-video.mjs --self-test`);
    process.exitCode = 1;
    return;
  }

  const input = path.resolve(options.input);
  const output = path.resolve(options.output);
  if (!fs.existsSync(input)) fail(`input not found: ${input}`);
  fs.mkdirSync(path.dirname(output), { recursive: true });

  const ffmpeg = pickFfmpeg();
  run(ffmpeg.executable, [
    '-y', '-hide_banner', '-loglevel', 'error', '-i', input,
    '-an',
    '-vf', `fps=30,scale=-2:${options.height}:flags=lanczos,format=yuv420p`,
    '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow', '-crf', String(options.crf),
    '-g', String(options.gop), '-keyint_min', String(options.gop), '-sc_threshold', '0',
    '-movflags', '+faststart', output,
  ]);

  if (options.poster) {
    const poster = path.resolve(options.poster);
    fs.mkdirSync(path.dirname(poster), { recursive: true });
    run(ffmpeg.executable, [
      '-y', '-hide_banner', '-loglevel', 'error', '-i', output,
      '-frames:v', '1', '-q:v', '2', poster,
    ]);
  }

  console.log(JSON.stringify({
    output,
    bytes: fs.statSync(output).size,
    poster: options.poster ? path.resolve(options.poster) : null,
    height: options.height,
    fps: 30,
    gop: options.gop,
    crf: options.crf,
    ffmpeg: ffmpeg.executable,
    filters: ffmpeg.filterCount,
  }, null, 2));
}

main().catch((error) => {
  console.error(`ERROR: ${error.message}`);
  process.exitCode = 1;
});

