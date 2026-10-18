"use client";
import { useEffect, useRef } from 'react';

export function HeroVideoWord() {
  const ref=useRef<HTMLVideoElement>(null);
  useEffect(()=>{
    const video=ref.current!;
    const media=matchMedia('(prefers-reduced-motion: reduce)');
    const sync=()=>{if(media.matches||document.hidden)video.pause();else void video.play().catch(()=>{});};
    sync();
    media.addEventListener('change',sync);
    document.addEventListener('visibilitychange',sync);
    return ()=>{media.removeEventListener('change',sync);document.removeEventListener('visibilitychange',sync);};
  },[]);
  return <span className="hero-video-word" role="img" aria-label="negócios">
    <video ref={ref} src="/assets/hero-section/abstract_blue_waves_loop_v2.mp4" autoPlay muted loop playsInline preload="auto" aria-hidden="true" />
  </span>;
}
