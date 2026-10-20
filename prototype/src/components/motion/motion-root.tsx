"use client";
import { useRef, type ReactNode } from 'react';
import { ScrollTrigger, useGSAP } from '@/lib/gsap';
import { measureType } from '@/lib/measure-type';
import { ButtonMotion } from './button-motion';
import { animateSectionTitles } from './section-title-motion';

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
    let cleanupTitles: (() => void) | undefined;
    let desiredTheme='';
    const setTheme=(theme:string)=>{
      if(desiredTheme===theme)return;
      desiredTheme=theme;
      root.dataset.scrollTheme=theme;
    };
    const createTrigger=contextSafe(()=>{
      measureType(element);
      cleanupTitles=animateSectionTitles(element);
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
      const heading=appSection.querySelector<HTMLElement>('h2')??appSection;
      const themeTrigger=ScrollTrigger.create({id:'app-scroll-theme',trigger:heading,start:'top 90%',end:'max',
        onEnter:()=>setTheme('dark'),onLeaveBack:()=>setTheme('light'),
        onRefresh:self=>setTheme(self.scroll()>=self.start?'dark':'light')});
      setTheme(themeTrigger.scroll()>=themeTrigger.start?'dark':'light');
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
      cleanupTitles?.();
      window.removeEventListener('pageshow',refresh);
      delete root.dataset.scrollTheme;delete root.dataset.ready;
      if(whatsapp){delete whatsapp.dataset.visible;whatsapp.tabIndex=-1;whatsapp.setAttribute('aria-hidden','true');}
      // useGSAP's context reverts its own triggers/timelines, including Strict Mode remounts.
    };
  },{scope});
  return <div ref={scope} id="site" className="min-h-screen"><div className="theme-wash" aria-hidden="true" /><ButtonMotion />{children}</div>;
}
