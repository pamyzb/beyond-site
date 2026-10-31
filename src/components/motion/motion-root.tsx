'use client';
import { useRef, type ReactNode } from 'react';
import { ScrollTrigger, useGSAP } from '@/lib/animation/gsap';
import { ButtonMotion } from '@/components/motion/button-motion';
import { animateSectionTitles } from '@/components/motion/section-title-motion';
import { animateAboutCards } from '@/components/sections/about/animate-about-cards';
import { animateAgentDelivery } from '@/components/motion/agent-delivery-motion';
import { animateAgentRoles } from '@/components/motion/agent-role-motion';

/** Owns page-level motion. Section timelines should use their own scoped useGSAP. */
export function MotionRoot({
  children,
  themeTrigger = '#app-project-title',
  themeStart = 'top bottom',
  themeMobileStart,
  themeReverse = false,
  whatsappTrigger = '#metricas h3',
}: {
  children: ReactNode;
  themeTrigger?: string;
  themeStart?: 'top bottom' | 'top top' | 'top 35%';
  themeMobileStart?: 'top bottom' | 'top top' | 'top 35%';
  themeReverse?: boolean;
  whatsappTrigger?: string;
}) {
  const scope = useRef<HTMLDivElement>(null);
  useGSAP(
    (_context, contextSafe) => {
      const element = scope.current!;
      const root = document.documentElement;
      const appProjectTitle = element.querySelector<HTMLElement>(themeTrigger);
      const metricsCounter = element.querySelector<HTMLElement>(whatsappTrigger);
      const whatsapp = element.querySelector<HTMLAnchorElement>('.floating-whatsapp');
      if (!appProjectTitle || !contextSafe) return;
      let disposed = false;
      let refreshFrame = 0;
      let cleanupTitles: (() => void) | undefined;
      let cleanupAgentCards: (() => void) | undefined;
      let cleanupAgentDelivery: (() => void) | undefined;
      let cleanupAgentRoles: (() => void) | undefined;
      let desiredTheme = '';
      const mobile = matchMedia('(max-width: 37.499em)');
      const currentThemeStart = () =>
        mobile.matches && themeMobileStart ? themeMobileStart : themeStart;
      const setTheme = (theme: string) => {
        if (desiredTheme === theme) return;
        desiredTheme = theme;
        root.dataset.scrollTheme = theme;
      };
      const syncTheme = () => {
        setTheme(
          appProjectTitle.getBoundingClientRect().top <=
            (currentThemeStart() === 'top top'
              ? 0
              : window.innerHeight * (currentThemeStart() === 'top 35%' ? 0.35 : 1))
            ? themeReverse
              ? 'light'
              : 'dark'
            : themeReverse
              ? 'dark'
              : 'light',
        );
      };
      syncTheme();
      window.addEventListener('scroll', syncTheme, { passive: true });
      window.addEventListener('resize', syncTheme);
      const createTrigger = contextSafe(() => {
        cleanupTitles = animateSectionTitles(element);
        const journey = element.querySelector<HTMLElement>('.agent-delivery-journey');
        if (journey) cleanupAgentDelivery = animateAgentDelivery(journey);
        const agentCards = element.querySelector<HTMLElement>('.agent-challenge-list');
        if (agentCards) cleanupAgentCards = animateAboutCards(agentCards);
        const agentRoles = element.querySelector<HTMLElement>('.agent-role-diagram');
        if (agentRoles) cleanupAgentRoles = animateAgentRoles(agentRoles);
        if (metricsCounter && whatsapp) {
          const syncWhatsApp = () => {
            const visible = metricsCounter.getBoundingClientRect().top < window.innerHeight;
            whatsapp.dataset.visible = String(visible);
            whatsapp.tabIndex = visible ? 0 : -1;
            whatsapp.setAttribute('aria-hidden', String(!visible));
          };
          ScrollTrigger.create({
            id: 'whatsapp-at-metrics',
            trigger: metricsCounter,
            start: 'top bottom',
            end: 'max',
            onEnter: syncWhatsApp,
            onLeaveBack: syncWhatsApp,
            onRefresh: syncWhatsApp,
          });
          syncWhatsApp();
        }
        const themeTrigger = ScrollTrigger.create({
          id: 'app-scroll-theme',
          trigger: appProjectTitle,
          start: currentThemeStart,
          end: 'max',
          onEnter: syncTheme,
          onLeaveBack: syncTheme,
          onRefresh: syncTheme,
        });
        syncTheme();
        root.dataset.ready = 'true';
      });
      // Fonts can change both text bounds and responsive section heights.
      void document.fonts.ready.then(() => {
        if (!disposed) createTrigger();
      });
      const refresh = () => {
        cancelAnimationFrame(refreshFrame);
        refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
      };
      const observer = new ResizeObserver(refresh);
      observer.observe(element);
      window.addEventListener('pageshow', refresh);
      return () => {
        disposed = true;
        cancelAnimationFrame(refreshFrame);
        observer.disconnect();
        cleanupTitles?.();
        cleanupAgentCards?.();
        cleanupAgentRoles?.();
        cleanupAgentDelivery?.();
        window.removeEventListener('pageshow', refresh);
        window.removeEventListener('scroll', syncTheme);
        window.removeEventListener('resize', syncTheme);
        delete root.dataset.scrollTheme;
        delete root.dataset.ready;
        if (whatsapp) {
          delete whatsapp.dataset.visible;
          whatsapp.tabIndex = -1;
          whatsapp.setAttribute('aria-hidden', 'true');
        }
        // useGSAP's context reverts its own triggers/timelines, including Strict Mode remounts.
      };
    },
    {
      scope,
      dependencies: [themeTrigger, themeStart, themeMobileStart, themeReverse, whatsappTrigger],
      revertOnUpdate: true,
    },
  );
  return (
    <div ref={scope} id="site" className="min-h-screen">
      <div className="theme-wash" aria-hidden="true" />
      <ButtonMotion />
      {children}
    </div>
  );
}
