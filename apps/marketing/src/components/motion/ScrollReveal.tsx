/**
 * @file Scroll-triggered reveal manager using GSAP and ScrollTrigger.
 * Uses GPU-only transform & opacity animations on data-reveal elements with safe opacity: 1 fallback.
 */

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * @description Automatically applies staggered entrance animations to sections, headings, and cards as they enter the viewport.
 * @returns {null} Controller component.
 */
export function ScrollRevealManager(): null {
  useEffect(() => {
    // Respect reduced-motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const ctx = gsap.context(() => {
      // Find all target sections and card containers marked for reveal
      const revealElements = document.querySelectorAll<HTMLElement>(
        '[data-reveal], [data-reveal-stagger], section h2, section p.max-w-2xl'
      );

      revealElements.forEach((el) => {
        // If element is already set up or within hero viewport, animate smoothly
        gsap.fromTo(
          el,
          {
            opacity: 0,
            y: 28,
            scale: 0.98,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.85,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              once: true,
            },
          }
        );
      });

      // Staggered card groups
      const cardContainers = document.querySelectorAll<HTMLElement>('[data-reveal-group]');
      cardContainers.forEach((container) => {
        const cards = container.children;
        if (cards.length > 0) {
          gsap.fromTo(
            cards,
            {
              opacity: 0,
              y: 32,
              scale: 0.96,
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.75,
              stagger: 0.1,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: container,
                start: 'top 85%',
                once: true,
              },
            }
          );
        }
      });
    });

    return () => {
      ctx.revert();
    };
  }, []);

  return null;
}
