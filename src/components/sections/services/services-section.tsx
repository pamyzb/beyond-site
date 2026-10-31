'use client';
import { useRef } from 'react';
import { ArrowLeft, ArrowRight, Bot, Hammer, Wrench } from 'lucide-react';
import type { ScrollTrigger } from '@/lib/animation/gsap';
import { useServicesNavigation } from './use-services-navigation';
import { useServicesJourney } from './use-services-journey';
import { SITE_LINKS } from '@/data/navigation';
import type { ServicesContent } from '@/data/services';
import { SectionHeading } from '@/components/ui/section-heading';
import { ServiceCard } from '@/components/sections/services/service-card';

export function ServicesSection({ content }: { content: ServicesContent }) {
  const scope = useRef<HTMLElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const paintJourney = useRef<() => void>(() => {});
  const scrollJourney = useRef<ScrollTrigger | null>(null);
  const {
    canGoBack,
    atEnd,
    activeGroup,
    groupCount,
    destination,
    updatePagination,
    navigate,
    startDrag,
    moveDrag,
    endDrag,
    suppressClick,
  } = useServicesNavigation({ viewport, rail, scrollJourney });
  useServicesJourney({ scope, viewport, rail, paintJourney, scrollJourney, updatePagination });
  return (
    <section
      ref={scope}
      id="servicos"
      className="services-editorial"
      aria-label={content.ariaLabel}
    >
      <SectionHeading
        label={content.label}
        title={
          <>
            Problemas que a gente <em>{'{resolve}'}</em>
          </>
        }
        subtitle={content.subtitle}
      />
      <div className="services-stage">
        <div
          ref={viewport}
          id="services-carousel"
          className="services-window"
          tabIndex={0}
          role="region"
          aria-roledescription="carrossel"
          aria-label="Serviços"
          onScroll={(event) => {
            updatePagination();
            paintJourney.current();
            if (
              destination.current !== null &&
              Math.abs(event.currentTarget.scrollLeft - destination.current) < 2
            )
              destination.current = null;
          }}
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onLostPointerCapture={endDrag}
          onPointerLeave={(event) => {
            if (!event.currentTarget.hasPointerCapture(event.pointerId)) endDrag(event);
          }}
          onDragStart={(event) => {
            if (window.matchMedia('(max-width: 59.999em)').matches) event.preventDefault();
          }}
          onClickCapture={(event) => {
            if (!suppressClick.current || event.detail === 0) return;
            suppressClick.current = false;
            event.preventDefault();
            event.stopPropagation();
          }}
          onWheel={() => {
            destination.current = null;
          }}
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget) return;
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
            event.preventDefault();
            navigate(
              event.key === 'Home'
                ? 'first'
                : event.key === 'End'
                  ? 'last'
                  : event.key === 'ArrowRight'
                    ? 1
                    : -1,
            );
          }}
        >
          <div ref={rail} className="services-rail">
            <ServiceCard agent {...content.agent} href={SITE_LINKS.agentService} />
            {content.cards.map((card, index) => (
              <ServiceCard
                key={card.id}
                title={card.title}
                description={card.description}
                image={card.image}
                imageClass={`service-image-${index}`}
              />
            ))}
            <svg className="services-route" aria-hidden="true">
              <path />
            </svg>
            <div className="builder builder-one" aria-hidden="true">
              <Bot size={49} strokeWidth={1.5} />
              <Hammer className="builder-tool" size={27} />
            </div>
            <div className="builder builder-two" aria-hidden="true">
              <Bot size={43} strokeWidth={1.5} />
              <Wrench className="builder-tool" size={24} />
            </div>
          </div>
        </div>
        <div className="services-navigation">
          <div className="services-controls">
            <button
              type="button"
              className="button testimonial-arrow services-arrow"
              aria-label="Serviço anterior"
              disabled={!canGoBack}
              aria-controls="services-carousel"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="button-icon" size={24} />
            </button>
            <button
              type="button"
              className="button testimonial-arrow services-arrow"
              aria-label="Próximo serviço"
              disabled={atEnd}
              aria-controls="services-carousel"
              onClick={() => navigate(1)}
            >
              <ArrowRight className="button-icon" size={24} />
            </button>
          </div>
          <div className="services-pagination" role="group" aria-label="Páginas de serviços">
            {Array.from({ length: groupCount }, (_, group) => (
              <button
                key={group}
                type="button"
                aria-label={`Ir para o grupo ${group + 1} de ${groupCount} de serviços`}
                aria-current={activeGroup === group ? 'true' : undefined}
                aria-controls="services-carousel"
                onClick={() => navigate({ group })}
              >
                <span />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
