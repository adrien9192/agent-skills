'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

// Mounts the GSAP engine after hydration, then on every client navigation.
// The engine is imported dynamically to stay out of the initial bundle.
export function MotionProvider() {
  const pathname = usePathname();

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const motionAudit = (window as Window & { __BUILD_SITE_MOTION_AUDIT__?: boolean })
      .__BUILD_SITE_MOTION_AUDIT__ === true;
    if (reduced) {
      document.querySelectorAll<HTMLVideoElement>('video[data-explainer]').forEach((video) => {
        video.removeAttribute('autoplay');
        video.pause();
        video.controls = true;
      });
    }
    // Keep the guard before import: engine.ts registers GSAP plugins at module
    // load, so checking only inside init() would still start the ticker and
    // download the chunk during deterministic QA or reduced motion.
    if (reduced || (navigator.webdriver && !motionAudit)) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;
    import('./engine').then((mod) => {
      if (cancelled) return;
      cleanup = mod.init();
    });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [pathname]);

  return null;
}
