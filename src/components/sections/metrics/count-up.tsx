'use client';
import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/animation/gsap';

export function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLElement>(null);
  const formatted = value.toLocaleString('pt-BR');

  useEffect(() => {
    const element = ref.current!;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const reels = element.querySelectorAll<HTMLElement>('.impact-count-reel');
      // Show the zero position before measuring/animating the visible digit tracks.
      element.dataset.rolling = 'true';
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: element,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
      reels.forEach((reel) => {
        const steps = Number(reel.dataset.steps);
        timeline.fromTo(
          reel,
          { '--digit-offset': 0 },
          {
            '--digit-offset': steps,
            duration: 2.2,
            ease: 'power2.inOut',
          },
          0,
        );
      });
      return () => {
        delete element.dataset.rolling;
      };
    });
    return () => media.revert();
  }, [value, suffix]);

  return (
    <strong className="impact-count" ref={ref} aria-hidden="true">
      {Array.from(formatted).map((character, index) => {
        if (!/\d/.test(character))
          return (
            <i className="impact-count-separator" key={index}>
              {character}
            </i>
          );
        const steps = 10 + Number(character);
        return (
          <i className="impact-count-digit" key={index}>
            <i className="impact-count-final">{character}</i>
            <i className="impact-count-reel" data-steps={steps}>
              {Array.from({ length: steps + 1 }, (_, step) => (
                <i className="impact-count-face" key={step}>
                  {step % 10}
                </i>
              ))}
            </i>
          </i>
        );
      })}
      {suffix}
    </strong>
  );
}
