#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const DIMENSIONS = ['grammar', 'nav', 'hero', 'sequence', 'close', 'signature'];
const SCHEMA_VERSION = 1;

function fail(message) {
  throw new Error(message);
}

function normalise(value) {
  const source = Array.isArray(value) ? value.join('>') : value;
  return String(source ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function validatePlan(plan) {
  if (!plan || typeof plan !== 'object' || Array.isArray(plan)) fail('plan must be a JSON object');
  if (!normalise(plan.id)) fail('plan.id is required');
  for (const dimension of DIMENSIONS) {
    if (!normalise(plan[dimension])) fail(`plan.${dimension} is required`);
  }
  return {
    id: normalise(plan.id),
    ...Object.fromEntries(DIMENSIONS.map((dimension) => [dimension, normalise(plan[dimension])])),
  };
}

function emptyRegistry() {
  return { schemaVersion: SCHEMA_VERSION, builds: [] };
}

function loadRegistry(file) {
  if (!fs.existsSync(file)) return emptyRegistry();
  let registry;
  try {
    registry = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    fail(`invalid registry JSON at ${file}: ${error.message}`);
  }
  if (registry?.schemaVersion !== SCHEMA_VERSION || !Array.isArray(registry.builds)) {
    fail(`unsupported registry schema at ${file}`);
  }
  return { schemaVersion: SCHEMA_VERSION, builds: registry.builds.map(validatePlan) };
}

function writeRegistry(file, registry) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(registry, null, 2)}\n`, { mode: 0o600 });
  fs.renameSync(temporary, file);
}

function compare(plan, existing) {
  const same = DIMENSIONS.filter((dimension) => plan[dimension] === existing[dimension]);
  const different = DIMENSIONS.filter((dimension) => plan[dimension] !== existing[dimension]);
  return { existing: existing.id, same, different, pass: different.length >= 4 };
}

function checkPlan(plan, registry) {
  const comparisons = registry.builds.map((existing) => compare(plan, existing));
  return {
    pass: comparisons.every((comparison) => comparison.pass),
    requiredDifferences: 4,
    comparisons,
  };
}

function registryPath(argv) {
  const index = argv.indexOf('--registry');
  if (index >= 0 && argv[index + 1]) return path.resolve(argv[index + 1]);
  const home = process.env.BUILD_SITE_HOME
    ? path.resolve(process.env.BUILD_SITE_HOME)
    : path.join(os.homedir(), '.build-site');
  return path.join(home, 'scroll-fingerprints.json');
}

function readPlan(file) {
  if (!file) fail('plan JSON path is required');
  const absolute = path.resolve(file);
  if (!fs.existsSync(absolute)) fail(`plan not found: ${absolute}`);
  try {
    return validatePlan(JSON.parse(fs.readFileSync(absolute, 'utf8')));
  } catch (error) {
    if (error.message.startsWith('plan.')) throw error;
    fail(`invalid plan JSON at ${absolute}: ${error.message}`);
  }
}

function selfTest() {
  const first = validatePlan({
    id: 'first', grammar: 'filmic', nav: 'minimal-bar', hero: 'scrub',
    sequence: ['scrub', 'pin', 'flow'], close: 'pinned-cta', signature: 'trace-rail',
  });
  const collision = validatePlan({
    id: 'collision', grammar: 'filmic', nav: 'minimal-bar', hero: 'scrub',
    sequence: ['scrub', 'pin', 'flow'], close: 'plain-link', signature: 'pull-wordmark',
  });
  const distinct = validatePlan({
    id: 'distinct', grammar: 'editorial', nav: 'chapter-folio', hero: 'title-page',
    sequence: ['flow', 'reveal', 'flow'], close: 'colophon-link', signature: 'survey-drawing',
  });
  const registry = { schemaVersion: SCHEMA_VERSION, builds: [first] };
  if (checkPlan(collision, registry).pass) fail('self-test: collision should fail');
  if (!checkPlan(distinct, registry).pass) fail('self-test: distinct plan should pass');
  if (normalise(['Pin', ' Flow ']) !== 'pin-flow') fail('self-test: sequence normalisation failed');
  console.log('ok scroll registry canaries');
}

async function main() {
  const argv = process.argv.slice(2);
  const command = argv[0];
  if (command === '--self-test') return selfTest();

  const file = registryPath(argv);
  if (command === 'init') {
    if (!fs.existsSync(file)) writeRegistry(file, emptyRegistry());
    console.log(file);
    return;
  }

  const registry = loadRegistry(file);
  if (command === 'list') {
    console.log(JSON.stringify({ registry: file, ...registry }, null, 2));
    return;
  }

  if (command === 'check' || command === 'append') {
    const plan = readPlan(argv[1]);
    if (command === 'append' && registry.builds.some((build) => build.id === plan.id)) {
      fail(`build id already exists: ${plan.id}`);
    }
    const result = checkPlan(plan, registry);
    if (!result.pass) {
      console.error(JSON.stringify({ registry: file, plan: plan.id, ...result }, null, 2));
      process.exitCode = 1;
      return;
    }
    if (command === 'append') {
      registry.builds.push(plan);
      writeRegistry(file, registry);
    }
    console.log(JSON.stringify({ registry: file, plan: plan.id, appended: command === 'append', ...result }, null, 2));
    return;
  }

  console.error(`usage:
  node scroll-registry.mjs init [--registry file]
  node scroll-registry.mjs list [--registry file]
  node scroll-registry.mjs check <plan.json> [--registry file]
  node scroll-registry.mjs append <plan.json> [--registry file]
  node scroll-registry.mjs --self-test`);
  process.exitCode = 1;
}

main().catch((error) => {
  console.error(`ERROR: ${error.message}`);
  process.exitCode = 1;
});
