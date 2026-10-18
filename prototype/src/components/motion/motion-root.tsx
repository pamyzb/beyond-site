"use client";
import { useRef, type ReactNode } from 'react';
import { ScrollTrigger, useGSAP } from '@/lib/gsap';
import { measureType } from '@/lib/measure-type';
import { ButtonMotion } from './button-motion';

/** Owns page-level motion. Section timelines should use their own scoped useGSAP. */
export function MotionRoot({ children }: {children: ReactNode}) {
  const scope=useRef<HTMLDivElement>(null);
  useGSAP((_context,contextSafe)=>{
    const element=scope.current!;
    const root=document.documentElement;
    const appSection=element.querySelector<HTMLElement>('#aplicativo');
    const metricsCounter=element.querySelector<HTMLElement>('#metricas h3');
    const whatsapp=element.querySelector<HTMLAnchorElement>('.floating-whatsapp');
    if(!appSection || !contextSafe)return;
    let disposed=false;
    let refreshFrame=0;
    const syncTheme=()=>{
      const heading=appSection.querySelector<HTMLElement>('h2');
      if(heading)root.dataset.scrollTheme=heading.getBoundingClientRect().top<window.innerHeight?'dark':'light';
    };
    const createTrigger=contextSafe(()=>{
      measureType(element);
      if(metricsCounter&&whatsapp){
        const syncWhatsApp=()=>{
          const visible=metricsCounter.getBoundingClientRect().top<window.innerHeight;
          whatsapp.dataset.visible=String(visible);
          whatsapp.tabIndex=visible?0:-1;
          whatsapp.setAttribute('aria-hidden',String(!visible));
        };
        ScrollTrigger.create({id:'whatsapp-at-metrics',trigger:metricsCounter,start:'top bottom',end:'max',
          onEnter:syncWhatsApp,onLeaveBack:syncWhatsApp,onRefresh:syncWhatsApp});
        syncWhatsApp();
      }
      ScrollTrigger.create({id:'app-scroll-theme',trigger:appSection,
        start:()=>{
          const heading=appSection.querySelector<HTMLElement>('h2');
          const offset=heading?heading.getBoundingClientRect().top-appSection.getBoundingClientRect().top:0;
          return `top+=${offset} bottom`;
        },end:'max',onUpdate:syncTheme,
        onEnter:syncTheme,onLeaveBack:syncTheme,onRefresh:syncTheme});
      syncTheme();
      root.dataset.ready='true';
    });
    // Fonts can change both text bounds and responsive section heights.
    void document.fonts.ready.then(()=>{if(!disposed)createTrigger();});
    const refresh=()=>{
      cancelAnimationFrame(refreshFrame);
      refreshFrame=requestAnimationFrame(()=>ScrollTrigger.refresh());
    };
    const observer=new ResizeObserver(refresh);
    observer.observe(element);
    window.addEventListener('pageshow',refresh);
    return ()=>{
      disposed=true;cancelAnimationFrame(refreshFrame);observer.disconnect();
      window.removeEventListener('pageshow',refresh);
      delete root.dataset.scrollTheme;delete root.dataset.ready;
      if(whatsapp){delete whatsapp.dataset.visible;whatsapp.tabIndex=-1;whatsapp.setAttribute('aria-hidden','true');}
      // useGSAP's context reverts its own triggers/timelines, including Strict Mode remounts.
    };
  },{scope});
  return <div ref={scope} id="site" className="min-h-screen"><ButtonMotion />{children}</div>;
}
