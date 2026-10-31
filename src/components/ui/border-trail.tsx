'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/animation/gsap';

/** Decorative light clipped to the rounded border of its positioned parent. */
export function BorderTrail({ hoverOnly = false }: { hoverOnly?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)', () => {
        const frame = ref.current!;
        const light = frame.querySelector('.agent-border-trail-light');
        const animation = gsap.to(light, {
          offsetDistance: '100%',
          duration: 8,
          repeat: -1,
          ease: 'none',
          paused: true,
        });
        let visible = false;
        let hovered = false;
        const parent = frame.parentElement!;
        const sync = () => {
          if (visible && !document.hidden && (!hoverOnly || hovered)) animation.play();
          else animation.pause();
        };
        const enter = () => {
          hovered = true;
          sync();
        };
        const leave = () => {
          hovered = false;
          sync();
        };
        if (hoverOnly) {
          parent.addEventListener('pointerenter', enter);
          parent.addEventListener('pointerleave', leave);
        }
        const observer = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
          sync();
        });
        observer.observe(frame);
        document.addEventListener('visibilitychange', sync);
        return () => {
          observer.disconnect();
          parent.removeEventListener('pointerenter', enter);
          parent.removeEventListener('pointerleave', leave);
          document.removeEventListener('visibilitychange', sync);
          animation.kill();
        };
      });
      return () => media.revert();
    },
    { scope: ref, dependencies: [hoverOnly], revertOnUpdate: true },
  );

  return (
    <span
      ref={ref}
      className="agent-border-trail"
      data-hover-only={hoverOnly || undefined}
      aria-hidden="true"
    >
      <span className="agent-border-trail-light" />
    </span>
  );
}
