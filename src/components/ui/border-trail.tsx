'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/animation/gsap';

/** Decorative light clipped to the rounded border of its positioned parent. */
export function BorderTrail() {
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
        const sync = () => {
          if (visible && !document.hidden) animation.play();
          else animation.pause();
        };
        const observer = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
          sync();
        });
        observer.observe(frame);
        document.addEventListener('visibilitychange', sync);
        return () => {
          observer.disconnect();
          document.removeEventListener('visibilitychange', sync);
          animation.kill();
        };
      });
      return () => media.revert();
    },
    { scope: ref },
  );

  return (
    <span ref={ref} className="agent-border-trail" aria-hidden="true">
      <span className="agent-border-trail-light" />
    </span>
  );
}
