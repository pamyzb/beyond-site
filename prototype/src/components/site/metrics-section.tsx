"use client";
import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';

export function MetricsSection() {
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
        // Release before services enters the viewport when metrics is shorter
        // than the screen, so the pinned hero cannot remain behind services.
        end: () => `top ${Math.max(0, window.innerHeight - section.offsetHeight)}px`,
        pin: true,
        pinSpacing: false,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      });
      return () => { trigger.kill(); };
    });
    return () => media.revert();
  }, { scope });

  return <section ref={scope} id="metricas" className="impact-section impact-compact" aria-label="Beyond em números">
    <div className="impact-panel">
    <div className="impact-patterns" aria-hidden="true">
      {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(corner =>
        <img key={corner} className={`impact-pattern impact-pattern-${corner}`} src={`/assets/figma/metrics-pattern-${corner}.svg`} alt="" />
      )}
    </div>
    <div className="impact-inner">
      <div className="impact-brands" id="clientes">
        <h2>Empresas que crescem com a Beyond</h2>
        <div className="impact-brand-strip">
          {[
            ['Institut Pasteur', 'Nº 1 no mundo em vacinas', 'client-pasteur-dark.png'],
            ['Grup Mediapro', 'Donos da LaLiga e Champions', 'impact-mediapro.png'],
            ['USP', 'Nº 1 da América Latina', 'client-usp-dark.png'],
            ['Capital', 'Maior corretora independente', 'impact-capital.png'],
            ['SHC', 'Clube hípico com +17 mil sócios', 'impact-shc.png'],
            ['Superpet', 'Maior feira de negócios pet', 'client-superpet-dark.png'],
          ].map(([name, description, file]) => <div className="impact-brand" key={name}>
            <img src={`/assets/figma/${file}`} alt={name} />
            <p>{description}</p>
          </div>)}
        </div>
      </div>
      <div className="impact-grid">
        <article className="impact-stat">
          <h3>200 mil<span>+</span></h3>
          <p>Usuários ativos</p>
        </article>
        <article className="impact-stat">
          <h3><small>R$</small>100<small>milhões</small><span>+</span></h3>
          <p>Transacionados nas nossas plataformas</p>
        </article>
        <article className="impact-stat">
          <h3>200<span>+</span></h3>
          <p>Empresas atendidas</p>
        </article>
      </div>
      <div className="impact-press impact-reveal">
        <p>Presença na mídia</p>
        <div className="impact-press-logos">
          <img src="/assets/figma/impact-estadao.png" alt="Estadão" width="120" height="37" />
          <img src="/assets/figma/impact-valor.svg" alt="Valor Econômico" width="109" height="37" />
          <img src="/assets/figma/impact-pegn.svg" alt="Pequenas Empresas & Grandes Negócios" width="109" height="62" />
          <img src="/assets/figma/impact-softex.svg" alt="Top 3 empresas na Softex" width="140" height="50" />
        </div>
      </div>
    </div>
    </div>
  </section>;
}

