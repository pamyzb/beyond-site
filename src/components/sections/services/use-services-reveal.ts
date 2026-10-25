'use client';
import type { RefObject } from 'react';
import { gsap, useGSAP } from '@/lib/animation/gsap';

/** Entrance visibility and decorative tool motion have their own lifecycle. */
export function useServicesReveal({
  scope,
  rail,
}: {
  scope: RefObject<HTMLElement | null>;
  rail: RefObject<HTMLDivElement | null>;
}) {
  useGSAP(
    () => {
      const robots = Array.from(rail.current!.querySelectorAll<HTMLElement>(':scope > .builder'));
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const cards = Array.from(
          rail.current?.querySelectorAll<HTMLElement>(':scope > article') ?? [],
        );
        const revealObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.intersectionRatio >= 0.18) entry.target.classList.add('is-visible');
              else if (!entry.isIntersecting) entry.target.classList.remove('is-visible');
            });
            // Observe the page viewport as well as the carousel's clipping bounds,
            // so cards reveal when scrolling down to services, not while offscreen.
          },
          { rootMargin: '0px 0px -18% 0px', threshold: [0, 0.18] },
        );
        rail.current?.classList.add('services-fade-ready');
        cards.forEach((card) => revealObserver.observe(card));
        const tools = robots.flatMap((robot) =>
          Array.from(robot.querySelectorAll<SVGElement>('.builder-tool')),
        );
        gsap.to(tools, {
          rotation: -35,
          transformOrigin: 'bottom left',
          duration: 0.18,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
        });
        return () => {
          revealObserver.disconnect();
          rail.current?.classList.remove('services-fade-ready');
          cards.forEach((card) => card.classList.remove('is-visible'));
        };
      });

      return () => mm.revert();
    },
    { scope },
  );
}
