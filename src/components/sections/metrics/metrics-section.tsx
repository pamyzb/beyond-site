'use client';
import { useRef, type PointerEvent } from 'react';
import { ClientDetailsCarousel } from '@/components/sections/metrics/client-carousel';
import { ButtonLink } from '@/components/ui/button';
import { CountUp } from '@/components/sections/metrics/count-up';
import { Title } from '@/components/ui/title';
import { gsap, SplitText, useGSAP } from '@/lib/animation/gsap';

const clients = [
  {
    key: 'Article_2',
    name: 'Institut Pasteur',
    summary: 'Pesquisa científica em saúde',
    image: '/assets/clientes/pasteur-logo.png',
    photo: '/assets/clientes/pasteur-photo.jpg',
    photoAlt: 'Fachada do Institut Pasteur',
  },
  {
    key: 'mediapro',
    name: 'Grup Mediapro',
    summary: 'Produção audiovisual e mídia esportiva',
    image: '/assets/clientes/mediapro-logo.png',
    photo: '/assets/clientes/mediapro-photo.jpg',
    photoAlt: 'Sala de controle audiovisual do Grup Mediapro',
  },
  {
    key: 'Article',
    name: 'Universidade de São Paulo',
    summary: 'Ensino, pesquisa e extensão',
    image: '/assets/clientes/usp-logo.png',
    photo: '/assets/clientes/usp-photo.jpg',
    photoAlt: 'Placa da Universidade de São Paulo',
  },
  {
    key: 'capital',
    name: 'CM Capital',
    summary: 'Serviços financeiros e investimentos',
    image: '/assets/clientes/capital-logo.png',
    photo: '/assets/clientes/capital-photo.jpg',
    photoAlt: 'Recepção da CM Capital',
  },
  {
    key: 'shc',
    name: 'SHC',
    summary: 'Sociedade Hípica Catarinense',
    image: '/assets/clientes/shc-logo.png',
    photo: '/assets/clientes/shc-photo.jpg',
    photoAlt: 'Vista das instalações da Sociedade Hípica Catarinense',
  },
  {
    key: 'Article_3',
    name: 'Superpet',
    summary: 'Feira de negócios do setor pet',
    image: '/assets/clientes/superpet-logo.png',
    photo: '/assets/clientes/superpet-photo.jpg',
    photoAlt: 'Mascote na feira Superpet',
  },
];

export function MetricsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const section = sectionRef.current!;
      const media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)', () => {
        const reveal = (selector: string, triggerSelector: string, stagger = 0) => {
          const targets = section.querySelectorAll<HTMLElement>(selector);
          const trigger = section.querySelector(triggerSelector);
          if (!targets.length || !trigger) return;
          gsap.fromTo(
            targets,
            { y: '1.25rem', opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.7,
              stagger,
              ease: 'power2.out',
              clearProps: 'transform,opacity',
              scrollTrigger: {
                trigger,
                start: 'top 90%',
                toggleActions: 'play none none none',
              },
            },
          );
        };
        const splits: SplitText[] = [];
        section
          .querySelectorAll<HTMLElement>('#clients-heading, .impact-press > p')
          .forEach((text) => {
            const split = SplitText.create(text, { type: 'chars', tag: 'span', aria: 'auto' });
            splits.push(split);
            gsap.set(split.chars, { display: 'inline', opacity: 0 });
            const typing = gsap.timeline({
              scrollTrigger: {
                trigger: text,
                start: 'top 90%',
                toggleActions: 'play none none none',
              },
            });
            split.chars.forEach((character, index) => {
              typing.set(character, { opacity: 1 }, 0.15 + index * 0.045);
            });
          });
        // Animate the outer wrapper, leaving the continuously moving logo track untouched.
        reveal('.client-inline-carousel', '.client-inline-carousel');
        reveal('.impact-press', '.impact-press');
        reveal('.impact-press-logos > *, .impact-press-link', '.impact-press', 0.07);
        return () => splits.forEach((split) => split.revert());
      });
      return () => media.revert();
    },
    { scope: sectionRef },
  );
  const tiltBounds = useRef(new WeakMap<HTMLElement, DOMRect>());

  function resetTilt(event: PointerEvent<HTMLElement>) {
    event.currentTarget.style.removeProperty('--metric-tilt-x');
    event.currentTarget.style.removeProperty('--metric-tilt-y');
    tiltBounds.current.delete(event.currentTarget);
  }

  function moveTilt(event: PointerEvent<HTMLElement>) {
    const card = event.currentTarget;
    if (
      event.pointerType !== 'mouse' ||
      !window.matchMedia(
        '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
      ).matches
    ) {
      resetTilt(event);
      return;
    }
    // Keep the initial bounds: measuring a rotated card feeds its transform back into the tilt.
    let bounds = tiltBounds.current.get(card);
    if (!bounds) {
      bounds = card.getBoundingClientRect();
      tiltBounds.current.set(card, bounds);
    }
    const x = Math.max(-0.5, Math.min(0.5, (event.clientX - bounds.left) / bounds.width - 0.5));
    const y = Math.max(-0.5, Math.min(0.5, (event.clientY - bounds.top) / bounds.height - 0.5));
    // Basic tilt, rotationFactor 16, reversed direction.
    card.style.setProperty('--metric-tilt-x', `${y * 16}deg`);
    card.style.setProperty('--metric-tilt-y', `${-x * 16}deg`);
  }

  const tiltEvents = {
    onPointerMove: moveTilt,
    onPointerLeave: resetTilt,
    onPointerCancel: resetTilt,
  };

  return (
    <section
      ref={sectionRef}
      id="metricas"
      className="impact-section impact-figma"
      data-motion="static"
      aria-label="Beyond em números"
    >
      <div className="impact-patterns" aria-hidden="true">
        {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => (
          <img
            key={corner}
            className={`impact-pattern impact-pattern-${corner}`}
            src={
              corner === 'top-right'
                ? '/assets/metricas/padroes/vector 2.svg'
                : corner === 'bottom-left'
                  ? '/assets/metricas/padroes/vector 1.svg'
                  : `/assets/metricas/metrics-pattern-${corner}.svg`
            }
            alt=""
          />
        ))}
      </div>{' '}
      <section className="impact-brands" id="clientes" aria-labelledby="clients-heading">
        <Title id="clients-heading" variant="metrics-label" data-motion="static">
          Empresas que <em>{'{crescem}'}</em> com a Beyond
        </Title>
        <ClientDetailsCarousel clients={clients} />
      </section>
      <section className="impact-metrics-wrap" aria-label="Indicadores e destaque na mídia">
        <div className="impact-panel">
          <div className="impact-inner">
            {' '}
            <div className="impact-grid">
              <article className="impact-stat" {...tiltEvents}>
                <Title as="h3" variant="metric-stat" data-motion="static" aria-label="214.126">
                  <span className="impact-live-dot" aria-hidden="true" />
                  <CountUp value={214126} />
                </Title>
                <p>Usuários ativos nas nossas plataformas</p>
              </article>
              <article className="impact-stat" {...tiltEvents}>
                <Title as="h3" variant="metric-stat" data-motion="static" aria-label="Mais de 200">
                  <span aria-hidden="true">+</span>
                  <CountUp value={200} />
                </Title>
                <p>Negócios transformados por tecnologia</p>
              </article>
              <article className="impact-stat" {...tiltEvents}>
                <Title
                  as="h3"
                  variant="metric-stat"
                  data-motion="static"
                  aria-label="Mais de 50 milhões"
                >
                  <span aria-hidden="true">+</span>
                  <CountUp value={50} suffix="M" />
                </Title>
                <p>
                  Em valor recuperado através de eficiência
                  <br className="impact-desktop-break" /> operacional
                </p>
              </article>
            </div>
            <div className="impact-press">
              <p>
                DESTAQUE NA <span className="impact-press-accent">{'{MÍDIA}'}</span>
              </p>
              <div className="impact-press-logos">
                <img
                  src="/assets/metricas/imprensa/estadao.png"
                  alt="Estadão"
                  width="140"
                  height="48"
                />
                <img
                  src="/assets/metricas/imprensa/pegn.png"
                  alt="Pequenas Empresas & Grandes Negócios"
                  width="150"
                  height="60"
                />
                <img
                  src="/assets/metricas/imprensa/valor.png"
                  alt="Valor Econômico"
                  width="130"
                  height="48"
                />
                <a
                  className="impact-press-profile"
                  href="https://softdex.com.br/empresa/beyond-the-bytes"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Beyond the Bytes na Softdex (abre em nova aba)"
                >
                  <img
                    src="/assets/metricas/imprensa/softex.png"
                    alt="Top 3 software house na Softdex"
                    width="180"
                    height="56"
                  />
                </a>
              </div>
              <ButtonLink className="impact-press-link" href="#blog">
                Ver matérias
                <span className="impact-press-arrow" aria-hidden="true" />
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}
