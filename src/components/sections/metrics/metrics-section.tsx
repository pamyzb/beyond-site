'use client';
import type { SectionData } from '@/lib/figma/design';
import { BlogCard } from '@/components/sections/blog/blog-card';
import { useRef, type PointerEvent } from 'react';
import {
  ClientDetailsCarousel,
  ClientCarousel,
} from '@/components/sections/metrics/client-carousel';
import { CountUp } from '@/components/sections/metrics/count-up';
import { Title } from '@/components/ui/title';
import { ButtonLink } from '@/components/ui/button';
import { gsap, ScrollTrigger, SplitText, useGSAP } from '@/lib/animation/gsap';

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

export function MetricsSection({ blogSection }: { blogSection: SectionData }) {
  const sectionRef = useRef<HTMLElement>(null);
  const anchorScroll = useRef<gsap.core.Tween | null>(null);
  useGSAP(
    () => {
      const section = sectionRef.current!;
      const media = gsap.matchMedia();
      media.add('(max-width: 37.499em) and (prefers-reduced-motion: no-preference)', () => {
        section.querySelectorAll<HTMLElement>('.impact-stat').forEach((card) => {
          gsap.fromTo(
            card,
            { '--mobile-card-tilt': '-1deg' },
            {
              '--mobile-card-tilt': '1deg',
              ease: 'none',
              scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true },
            },
          );
        });
      });
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
                start: 'top 85%',
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
        reveal('#clientes', '#clientes');
        reveal('.impact-press', '.impact-press');
        reveal('.impact-press-logos, .impact-press-link', '.impact-press', 0.07);
        return () => splits.forEach((split) => split.revert());
      });
      return () => {
        anchorScroll.current?.kill();
        media.revert();
      };
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
                ? '/assets/metricas/padroes/vector 1.svg'
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
                <Title
                  as="h3"
                  variant="metric-stat"
                  data-motion="static"
                  aria-label="Mais de 100 milhões em valor recuperado"
                >
                  <span aria-hidden="true">+</span>
                  <CountUp value={100} suffix="M" />
                </Title>
                <p>Em valor recuperado</p>
              </article>
              <article className="impact-stat impact-stat-users" {...tiltEvents}>
                <Title
                  as="h3"
                  variant="metric-stat"
                  data-motion="static"
                  aria-label="200 mil usuários ativos no mês"
                >
                  <span className="impact-live-dot" aria-hidden="true" />
                  <CountUp value={200} suffix=" mil" />
                </Title>
                <p>Usuários ativos no mês</p>
              </article>
              <article className="impact-stat" {...tiltEvents}>
                <Title as="h3" variant="metric-stat" data-motion="static">
                  Top 3
                </Title>
                <p className="impact-softdex-caption">
                  na{' '}
                  <span className="impact-softdex-logo">
                    <img
                      src="/assets/metricas/imprensa/softdex-logo.png"
                      alt="Softdex"
                      width="120"
                      height="38"
                    />
                  </span>
                </p>
              </article>
            </div>
            <div className="impact-press">
              <p>
                Destaque na <span className="impact-press-accent">{'{mídia}'}</span>
              </p>
              <ClientCarousel
                media
                clients={[
                  {
                    key: 'estadao',
                    name: 'Estadão',
                    summary: 'Conteúdo no blog da Beyond.',
                    href: '#blog-post-0-0',
                    preview: (
                      <BlogCard
                        card={{ key: 'Article_19', art: 'blog-19', width: 204, height: 34 }}
                        blocks={blogSection.blocks.filter((b) =>
                          b.ancestors.includes('Article_19'),
                        )}
                        href="#blog-post-0-0"
                        id="press-preview-estadao"
                        layout="preview"
                      />
                    ),
                    image: '/assets/metricas/imprensa/estadao.png',
                  },
                  {
                    key: 'pegn',
                    name: 'Pequenas Empresas & Grandes Negócios',
                    summary: 'Conteúdo no blog da Beyond.',
                    href: '#blog-post-0-1',
                    preview: (
                      <BlogCard
                        card={{ key: 'Article_20', art: 'blog-20', width: 170, height: 25 }}
                        blocks={blogSection.blocks.filter((b) =>
                          b.ancestors.includes('Article_20'),
                        )}
                        href="#blog-post-0-1"
                        id="press-preview-pegn"
                        layout="preview"
                      />
                    ),
                    image: '/assets/metricas/imprensa/pegn.png',
                  },
                  {
                    key: 'valor',
                    name: 'Valor Econômico',
                    summary: 'Conteúdo no blog da Beyond.',
                    href: '#blog-post-0-3',
                    preview: (
                      <BlogCard
                        card={{ key: 'Article_21', art: 'blog-21', width: 136, height: 34 }}
                        blocks={blogSection.blocks.filter((b) =>
                          b.ancestors.includes('Article_21'),
                        )}
                        href="#blog-post-0-3"
                        id="press-preview-valor"
                        layout="preview"
                      />
                    ),
                    image: '/assets/metricas/imprensa/valor.png',
                  },
                ]}
              />
              <ButtonLink
                variant="tertiary-dark"
                className="impact-media-link impact-press-link"
                href="#blog"
                onClick={(event) => {
                  if (
                    event.button !== 0 ||
                    event.metaKey ||
                    event.ctrlKey ||
                    event.shiftKey ||
                    event.altKey
                  )
                    return;
                  const target = document.getElementById('blog');
                  if (!target) return;
                  event.preventDefault();
                  window.dispatchEvent(
                    new CustomEvent('site:anchor-navigation', { detail: { targetId: 'blog' } }),
                  );
                  // Settle pinned sections before jumping: refresh restores its
                  // saved scroll position on the following animation frame.
                  ScrollTrigger.refresh();
                  requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                      if (location.hash !== '#blog') history.pushState(null, '', '#blog');
                      anchorScroll.current?.kill();
                      if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
                        target.scrollIntoView({ behavior: 'instant', block: 'start' });
                        ScrollTrigger.update();
                        return;
                      }
                      const position = { y: window.scrollY };
                      const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
                      const destination =
                        target.getBoundingClientRect().top + window.scrollY - margin;
                      const cancel = () => anchorScroll.current?.kill();
                      const cleanup = () => {
                        window.removeEventListener('wheel', cancel);
                        window.removeEventListener('touchstart', cancel);
                      };
                      window.addEventListener('wheel', cancel, { passive: true });
                      window.addEventListener('touchstart', cancel, { passive: true });
                      anchorScroll.current = gsap.to(position, {
                        y: destination,
                        duration: 1.25,
                        ease: 'power2.inOut',
                        onUpdate: () => {
                          window.scrollTo({ top: position.y, behavior: 'instant' });
                          ScrollTrigger.update();
                        },
                        onComplete: cleanup,
                        onInterrupt: cleanup,
                      });
                    });
                  });
                }}
              >
                Ver matérias <span className="impact-press-arrow" aria-hidden="true" />
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}
