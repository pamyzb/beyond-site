"use client";
import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';

export function AppTitleWord({text}:{text:string}) {
  const word=useRef<HTMLSpanElement>(null);
  useGSAP(()=>{
    const target=word.current!;
    const media=gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)',()=>{
      const path=target.querySelector('path')!;
      const length=path.getTotalLength();
      // Animate SVG attributes in real path units. CSSPlugin can round the
      // former normalized 0–1px offsets, turning the draw into an on/off jump.
      gsap.set(path,{attr:{'stroke-dasharray':`${length} ${length}`,'stroke-dashoffset':length}});
      // Draw once after the title is comfortably visible; retain the finished stroke.
      gsap.timeline({scrollTrigger:{trigger:target.closest('h3')??target,
        start:'top 78%',toggleActions:'play none none none'}})
        .fromTo(path,{attr:{'stroke-dashoffset':length}},{attr:{'stroke-dashoffset':length*.62},duration:.19,ease:'none'})
        .to(path,{attr:{'stroke-dashoffset':length*.60},duration:.035,ease:'none'})
        .to(path,{attr:{'stroke-dashoffset':length*.29},duration:.125,ease:'none'})
        .to(path,{attr:{'stroke-dashoffset':length*.27},duration:.035,ease:'none'})
        .to(path,{attr:{'stroke-dashoffset':0},duration:.14,ease:'none'});
    });
    return ()=>media.revert();
  },{scope:word});
  return <span ref={word} className="app-title-word">{text}
    <svg className="app-title-scribble" viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path d="M2 10 C24 3 66 1 98 4 C80 8 39 12 12 17 C34 12 70 11 94 14" />
    </svg>
  </span>;
}
