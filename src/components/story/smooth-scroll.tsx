'use client';
import { useEffect } from 'react';
import type Lenis from 'lenis';
/** Story-only enhancement. Native keyboard, touch and marked nested surfaces retain ownership. */
export function StorySmoothScroll() {
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let instance: Lenis | undefined;
    let generation = 0;
    async function configure() {
      const current = ++generation;
      instance?.destroy();
      instance = undefined;
      if (motion.matches) return;
      const { default: LenisClass } = await import('lenis');
      if (current !== generation || motion.matches) return;
      instance = new LenisClass({
        autoRaf: true,
        smoothWheel: true,
        syncTouch: false,
        duration: 0.6,
        anchors: false,
        prevent: (node) =>
          Boolean(
            node.closest('[data-lenis-prevent], dialog, [role="dialog"], input, textarea, select'),
          ),
      });
    }
    // Native hash navigation preserves URL, focus and reduced-motion behavior.
    const anchor = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link || !instance) return;
      const target = document.getElementById(link.hash.slice(1));
      if (!target) return;
      event.preventDefault();
      history.pushState(null, '', link.hash);
      instance.scrollTo(target, {
        offset: -96,
        onComplete: () => target.focus({ preventScroll: true }),
      });
    };
    void configure().catch(() => {
      /* Native document scroll remains available. */
    });
    const change = () => {
      void configure().catch(() => {});
    };
    motion.addEventListener('change', change);
    document.addEventListener('click', anchor);
    return () => {
      generation++;
      instance?.destroy();
      motion.removeEventListener('change', change);
      document.removeEventListener('click', anchor);
    };
  }, []);
  return null;
}
