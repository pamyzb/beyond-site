"use client";
import { useRef, type ReactNode } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { createImpactPaint } from '@/lib/impact-paint';

export function MetricsSection({ clientsContent }: { clientsContent?: ReactNode }) {
  const scope = useRef<HTMLElement>(null);
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      const section = scope.current!;
      const hero = document.getElementById('inicio')?.closest<HTMLElement>('.section-band');
      if (!hero) return;
      // Keep the hero in place while the unchanged clients/metrics block covers it.
      // Taller heroes remain readable before their bottom edge is pinned.
      const trigger = ScrollTrigger.create({
        id: 'hero-impact-layered-pin',
        trigger: hero,
        start: () => `top ${Math.min(0, window.innerHeight - hero.offsetHeight)}px`,
        endTrigger: section,
        end: 'top top',
        pin: true,
        pinSpacing: false,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      });
      const removePaint = createImpactPaint(section);
      return () => { removePaint(); trigger.kill(); };
    });
    return () => media.revert();
  }, { scope });

  return <section ref={scope} id="metricas" className="impact-section" aria-label="Beyond em números">
    <div className="impact-panel">
    <div className="impact-patterns" aria-hidden="true">
      {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(corner =>
        <img key={corner} className={`impact-pattern impact-pattern-${corner}`} src={`/assets/figma/metrics-pattern-${corner}.svg`} alt="" />
      )}
    </div>
    {clientsContent && <div className="impact-clients">{clientsContent}</div>}
    <div className="impact-inner">
      <div className="impact-grid">
        <article className="impact-stat impact-reveal">
          <h3>214.126</h3>
          <p>Usuários ativos nas<br />nossas plataformas.</p>
        </article>
        <img className="impact-divider impact-divider-first impact-reveal" src="/assets/service-agents-team.png" alt="" width="76" height="76" />
          <article className="impact-stat impact-reveal">
            <h3><span>+</span>200</h3>
            <p>Negócios transformados <br />por tecnologia.</p>
          </article>
        <img className="impact-divider impact-divider-second impact-reveal" src="/assets/service-ai-team.png" alt="" width="76" height="76" />
          <article className="impact-stat impact-reveal">
            <h3><span>+</span>50M</h3>
            <p>Em valor recuperado através <br />de eficiência operacional.</p>
          </article>
      </div>
      <div className="impact-press impact-reveal">
        <p>Presença na mídia</p>
        <div className="impact-press-logos">
          <img src="/assets/figma/impact-valor.svg" alt="Valor Econômico" width="109" height="37" />
          <img src="/assets/figma/impact-pegn.svg" alt="Pequenas Empresas & Grandes Negócios" width="109" height="62" />
          <img src="/assets/figma/impact-softex.svg" alt="Top 3 empresas na Softex" width="140" height="50" />
        </div>
      </div>
    </div>
    </div>
  </section>;
}

