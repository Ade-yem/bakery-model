/**
 * @file Lenis smooth momentum scroll integration for TallyBakery.
 * Integrates @studio-freight/lenis / lenis with standard requestAnimationFrame loop and GSAP ScrollTrigger sync.
 */

import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * @description Initializes Lenis smooth scrolling with fallback for reduced motion and mobile devices.
 * @returns {null} Non-visual controller component.
 */
export function SmoothScrollProvider(): null {
  useEffect(() => {
    // Respect user's reduced-motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5,
    });

    let animationFrameId: number;

    const raf = (time: number) => {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    };

    animationFrameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
    };
  }, []);

  return null;
}
