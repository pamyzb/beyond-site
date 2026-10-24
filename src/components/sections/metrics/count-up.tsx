'use client';
import { useEffect, useRef } from 'react';

export function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = ref.current!;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const format = (number: number) => number.toLocaleString('pt-BR') + suffix;
    let frame = 0;
    const finish = () => {
      cancelAnimationFrame(frame);
      element.textContent = format(value);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        if (reduced.matches) {
          finish();
          return;
        }
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / 1600);
          element.textContent = format(Math.round(value * (1 - Math.pow(1 - progress, 3))));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    observer.observe(element);
    reduced.addEventListener('change', finish);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      reduced.removeEventListener('change', finish);
    };
  }, [value, suffix]);
  return (
    <strong className="impact-count" ref={ref} aria-hidden="true">
      {value.toLocaleString('pt-BR')}
      {suffix}
    </strong>
  );
}
