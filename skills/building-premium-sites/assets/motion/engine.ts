import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

// Lenis lives for the whole session (not recreated on every navigation).
let lenis: Lenis | null = null;
let firstRun = true;

// ---------------------------------------------------------------------------
// PER-BRAND RETUNING: every animation constant lives here. To adapt the engine
// to a new identity (snappier, wider, different radius), touch ONLY these two
// blocks — no literal is scattered further down.
// ---------------------------------------------------------------------------
const EASE = 'expo.out';
const TUNING = {
  reveal: { y: 42, duration: 0.85, stagger: 0.09, start: 'top 90%' },
  split: { yPercent: 55, duration: 0.75, stagger: 0.035, start: 'top 92%' },
  counter: { duration: 1.4, start: 'top 88%' },
  staggerGroup: { y: 26, duration: 0.7, stagger: 0.07, start: 'top 85%' },
  parallaxDefault: 0.15,
  // wipe.radius = radius of [data-wipe] visuals: align it with the design system --radius.
  wipe: { radius: '22px', duration: 1.05, start: 'top 88%' },
  marquee: { defaultDuration: 30, maxBoost: 4, velocityDivisor: 400, boostThreshold: 1.15 },
  magnetic: { defaultStrength: 0.28, clampX: 22, clampY: 14, duration: 0.4 },
  tilt: { maxDeg: 7, duration: 0.5, perspective: 900 },
  routeEntrance: { y: 14, duration: 0.45 },
} as const;

// Conventional design-system selectors. If they differ in the target project,
// adapt them HERE — otherwise the engine becomes a silent no-op (no error, just
// zero animation).
const SELECTORS = {
  reveal: '.scroll-reveal',
  heading: 'main h1, #main-content h1',
  magnetic: '[data-magnetic], .btn-primary, .cta-pill',
  main: 'main-content', // id (without #) of the main content
} as const;

function ensureLenis() {
  if (lenis) return;
  lenis = new Lenis({ autoRaf: false, anchors: true });
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.on('scroll', ScrollTrigger.update);
}

// Progressive scroll reveal: blocks fade in as they enter the viewport. The
// engine takes over .scroll-reveal (the CSS fallback is disabled by
// html.gsap-motion). Reveals containing the h1 stay visible: the h1 is already
// animated word by word by splitHeading, avoiding a double animation.
function revealBlocks(scope: Document) {
  const items = Array.from(scope.querySelectorAll<HTMLElement>(SELECTORS.reveal)).filter(
    // h1 = already animated by splitHeading; [data-wipe] = already revealed by wipes().
    (el) => !el.querySelector('h1') && !el.querySelector('[data-wipe]'),
  );
  if (!items.length) return;
  gsap.set(items, { autoAlpha: 0, y: TUNING.reveal.y });
  ScrollTrigger.batch(items, {
    start: TUNING.reveal.start,
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, { autoAlpha: 1, y: 0, duration: TUNING.reveal.duration, ease: EASE, stagger: TUNING.reveal.stagger, overwrite: true }),
  });
}

// Reveals the main h1 word by word. autoSplit handles the re-split once fonts
// load; aria:"auto" keeps a readable aria-label on the heading.
function splitHeading(scope: Document) {
  const targets = new Set<HTMLElement>();
  const h1 = scope.querySelector<HTMLElement>(SELECTORS.heading);
  if (h1) targets.add(h1);
  scope.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => targets.add(el));

  const splits: SplitText[] = [];
  targets.forEach((el) => {
    // Neutralise the ancestor's CSS reveal to avoid a double animation.
    const wrapper = el.closest<HTMLElement>(SELECTORS.reveal);
    if (wrapper) wrapper.style.animation = 'none';
    splits.push(
      SplitText.create(el, {
        type: 'words',
        aria: 'auto',
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.words, {
            yPercent: TUNING.split.yPercent,
            autoAlpha: 0,
            duration: TUNING.split.duration,
            ease: EASE,
            stagger: TUNING.split.stagger,
            scrollTrigger: { trigger: el, start: TUNING.split.start, once: true },
          }),
      }),
    );
  });
  return splits;
}

// Counters: animates the first number found in the text, preserving prefix,
// suffix and the French decimal comma. E.g. "15+ ans", "+120 %", "4,8".
function counters(scope: Document) {
  scope.querySelectorAll<HTMLElement>('[data-counter]').forEach((el) => {
    const original = el.textContent ?? '';
    const match = original.match(/(\d+(?:[.,]\d+)?)/);
    if (!match || match.index === undefined) return;
    const raw = match[1];
    const decimals = raw.includes(',') || raw.includes('.') ? raw.split(/[.,]/)[1].length : 0;
    const comma = raw.includes(',');
    const target = parseFloat(raw.replace(',', '.'));
    const prefix = original.slice(0, match.index);
    const suffix = original.slice(match.index + raw.length);
    const state = { value: 0 };
    gsap.to(state, {
      value: target,
      duration: TUNING.counter.duration,
      ease: EASE,
      scrollTrigger: { trigger: el, start: TUNING.counter.start, once: true },
      onUpdate: () => {
        let text = state.value.toFixed(decimals);
        if (comma) text = text.replace('.', ',');
        el.textContent = `${prefix}${text}${suffix}`;
      },
      onComplete: () => {
        el.textContent = original;
      },
    });
  });
}

// Staggered entrance of the direct children of a [data-stagger] group.
function staggerGroups(scope: Document) {
  scope.querySelectorAll<HTMLElement>('[data-stagger]').forEach((group) => {
    const items = Array.from(group.children) as HTMLElement[];
    if (items.length < 2) return;
    gsap.from(items, {
      y: TUNING.staggerGroup.y,
      autoAlpha: 0,
      duration: TUNING.staggerGroup.duration,
      ease: EASE,
      stagger: TUNING.staggerGroup.stagger,
      scrollTrigger: { trigger: group, start: TUNING.staggerGroup.start, once: true },
    });
  });
}

// Subtle parallax: data-parallax="0.2" = 20% of vertical drift while scrolling.
function parallax(scope: Document) {
  scope.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
    const speed = parseFloat(el.dataset.parallax || String(TUNING.parallaxDefault));
    if (!speed) return;
    gsap.to(el, {
      yPercent: speed * -100,
      ease: 'none',
      scrollTrigger: { trigger: el.parentElement ?? el, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
}

// Wipe reveal (clip-path) of visuals tagged [data-wipe], the horizontal
// companion to the progressive scroll reveal. The corner radius is preserved
// during the animation via `round`.
function wipes(scope: Document) {
  scope.querySelectorAll<HTMLElement>('[data-wipe]').forEach((el) => {
    gsap.set(el, { clipPath: `inset(0% 100% 0% 0% round ${TUNING.wipe.radius})` });
    gsap.to(el, {
      clipPath: `inset(0% 0% 0% 0% round ${TUNING.wipe.radius})`,
      duration: TUNING.wipe.duration,
      ease: EASE,
      scrollTrigger: { trigger: el, start: TUNING.wipe.start, once: true },
    });
  });
}

// GSAP marquees: continuous loop + speed boost driven by scroll velocity,
// paused on hover (desktop). Takes over from the CSS fallback animation.
function marquees(scope: Document, fine: boolean, signal: AbortSignal) {
  scope.querySelectorAll<HTMLElement>('[data-marquee]').forEach((track) => {
    const duration = parseFloat(track.dataset.marquee || String(TUNING.marquee.defaultDuration));
    const reverse = 'marqueeReverse' in track.dataset;
    track.style.animation = 'none';
    const tween = gsap.fromTo(
      track,
      { xPercent: reverse ? -50 : 0 },
      { xPercent: reverse ? 0 : -50, repeat: -1, ease: 'none', duration },
    );
    ScrollTrigger.create({
      trigger: track,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        const boost = gsap.utils.clamp(1, TUNING.marquee.maxBoost, 1 + Math.abs(self.getVelocity()) / TUNING.marquee.velocityDivisor);
        if (boost > TUNING.marquee.boostThreshold) {
          tween.timeScale(boost);
          gsap.to(tween, { timeScale: 1, duration: 1.2, ease: 'power2.out', overwrite: true });
        }
      },
    });
    if (fine) {
      track.addEventListener('pointerenter', () => gsap.to(tween, { timeScale: 0, duration: 0.35, overwrite: true }), { signal });
      track.addEventListener('pointerleave', () => gsap.to(tween, { timeScale: 1, duration: 0.5, overwrite: true }), { signal });
    }
  });
}

// Magnetic CTAs (fine pointer / desktop only). The CSS transition on transform
// is removed so the GSAP movement is not smoothed twice.
function magnetic(scope: Document, signal: AbortSignal) {
  const targets = scope.querySelectorAll<HTMLElement>(SELECTORS.magnetic);
  targets.forEach((el) => {
    el.style.transitionProperty = 'box-shadow, background, border-color, color';
    const strength = parseFloat(el.dataset.magnetic || String(TUNING.magnetic.defaultStrength));
    const xTo = gsap.quickTo(el, 'x', { duration: TUNING.magnetic.duration, ease: EASE });
    const yTo = gsap.quickTo(el, 'y', { duration: TUNING.magnetic.duration, ease: EASE });
    el.addEventListener(
      'pointermove',
      (event) => {
        const rect = el.getBoundingClientRect();
        const relX = event.clientX - rect.left - rect.width / 2;
        const relY = event.clientY - rect.top - rect.height / 2;
        xTo(gsap.utils.clamp(-TUNING.magnetic.clampX, TUNING.magnetic.clampX, relX * strength));
        yTo(gsap.utils.clamp(-TUNING.magnetic.clampY, TUNING.magnetic.clampY, relY * strength));
      },
      { signal },
    );
    el.addEventListener(
      'pointerleave',
      () => {
        xTo(0);
        yTo(0);
      },
      { signal },
    );
  });
}

// Light 3D tilt on cards tagged [data-tilt].
function tilt(scope: Document, signal: AbortSignal) {
  scope.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
    el.style.transitionProperty = 'box-shadow, background, border-color';
    gsap.set(el, { transformPerspective: TUNING.tilt.perspective });
    const rxTo = gsap.quickTo(el, 'rotationX', { duration: TUNING.tilt.duration, ease: EASE });
    const ryTo = gsap.quickTo(el, 'rotationY', { duration: TUNING.tilt.duration, ease: EASE });
    el.addEventListener(
      'pointermove',
      (event) => {
        const rect = el.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        rxTo(py * -TUNING.tilt.maxDeg);
        ryTo(px * TUNING.tilt.maxDeg);
      },
      { signal },
    );
    el.addEventListener(
      'pointerleave',
      () => {
        rxTo(0);
        ryTo(0);
      },
      { signal },
    );
  });
}

// Short content fade on client-side navigations (never on first load, so SSR
// rendering and LCP are left untouched).
function routeEntrance() {
  const main = document.getElementById(SELECTORS.main);
  if (!main) return;
  gsap.fromTo(main, { autoAlpha: 0.001, y: TUNING.routeEntrance.y }, { autoAlpha: 1, y: 0, duration: TUNING.routeEntrance.duration, ease: EASE, clearProps: 'all' });
}

export function init(): () => void {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const motionAudit = (window as Window & { __BUILD_SITE_MOTION_AUDIT__?: boolean })
    .__BUILD_SITE_MOTION_AUDIT__ === true;
  if (reduced) {
    // Autoplaying explainer videos honour the reduced-motion preference too.
    document.querySelectorAll<HTMLVideoElement>('video[data-explainer]').forEach((video) => {
      video.removeAttribute('autoplay');
      video.pause();
      video.controls = true;
    });
  }
  // Ordinary QA / Axe captures stay deterministic. The dedicated scroll audit
  // sets this flag before application code loads so it can exercise the real
  // timeline without weakening the default webdriver guard.
  if (reduced || (navigator.webdriver && !motionAudit)) return () => {};

  const fine = window.matchMedia('(pointer: fine)').matches;
  ensureLenis();
  document.documentElement.classList.add('gsap-motion');

  const controller = new AbortController();
  let splits: SplitText[] = [];

  const ctx = gsap.context(() => {
    if (!firstRun) routeEntrance();
    firstRun = false;
    revealBlocks(document);
    wipes(document);
    marquees(document, fine, controller.signal);
    splits = splitHeading(document);
    counters(document);
    staggerGroups(document);
    parallax(document);
    if (fine) {
      magnetic(document, controller.signal);
      tilt(document, controller.signal);
    }
    ScrollTrigger.refresh();
  });

  return () => {
    controller.abort();
    splits.forEach((split) => split.revert());
    ctx.revert();
  };
}
