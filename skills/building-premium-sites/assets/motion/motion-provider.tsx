'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

// Mounts the GSAP engine after hydration, then on every client navigation.
// The engine is imported dynamically to stay out of the initial bundle.
export function MotionProvider() {
  const pathname = usePathname();

  useEffect(() => {
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
