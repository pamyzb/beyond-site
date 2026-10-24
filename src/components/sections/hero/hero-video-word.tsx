'use client';
import { useEffect, useRef } from 'react';
import { HERO_MEDIA } from '@/data/hero-media';

export function HeroVideoWord() {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current!;
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    const sync = () => {
      if (media.matches || document.hidden || !visible) video.pause();
      else {
        if (!video.getAttribute('src')) video.src = HERO_MEDIA.blue;
        void video.play().catch(() => {});
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(video.parentElement!);
    media.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    return () => {
      media.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
      observer.disconnect();
      video.pause();
    };
  }, []);
  return (
    <span className="hero-video-word" role="img" aria-label="negócios">
      <video ref={ref} muted loop playsInline preload="none" aria-hidden="true" />
    </span>
  );
}
