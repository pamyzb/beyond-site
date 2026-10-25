'use client';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { SectionData } from '@/lib/figma/design';
import {
  TestimonialTextCard,
  TestimonialVideoCard,
} from '@/components/sections/testimonials/testimonial-card';
import { useTestimonialCarousel } from './use-testimonial-carousel';

export function TestimonialCarousel({
  section,
  videoSrc,
}: {
  section: SectionData;
  videoSrc?: string;
}) {
  const {
    scope,
    track,
    pagination,
    glassCanvas,
    active,
    notice,
    playing,
    setPlaying,
    setNotice,
    interactionProps,
    viewportProps,
    previous,
    next,
    selectPage,
  } = useTestimonialCarousel();
  const original = section.blocks.filter((b) => b.ancestors.includes('Container_43'));
  const [quote, name, role] = original.map((b) => b.runs.map((r) => r.text).join(' '));
  const labels = ['Texto', 'Vídeo', 'Texto'];
  return (
    <div
      ref={scope}
      className="testimonial-carousel"
      role="region"
      aria-roledescription="carrossel"
      aria-label="Depoimentos de clientes"

      {...interactionProps}
    >
      <div
        className="testimonial-viewport"

        {...viewportProps}
      >
        <div className="testimonial-reading-window">
          <div ref={track} className="testimonial-track">
            {labels.map((label, index) => (
              <article
                key={index}
                className="testimonial-slide"
                aria-label={`${index + 1} de 3: ${label}${index === 2 ? ' (prévia repetida)' : ''}`}
                aria-hidden={active !== index}
                inert={active !== index}
              >
                <div
                  className={`testimonial-surface ${index === 1 ? 'testimonial-video' : 'testimonial-text'}`}
                >
                  {index === 1 ? (
                    <TestimonialVideoCard
                      quote={quote}
                      name={name}
                      role={role}
                      videoSrc={videoSrc}
                      playing={playing}
                      notice={notice}
                      onPlay={() => (videoSrc ? setPlaying(true) : setNotice(true))}
                      onEnded={() => setPlaying(false)}
                    />
                  ) : (
                    <TestimonialTextCard quote={quote} name={name} role={role} />
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
        <canvas ref={glassCanvas} className="testimonial-glass-canvas" aria-hidden="true" hidden />
      </div>
      <button
        type="button"
        className="button testimonial-arrow testimonial-prev"
        aria-label="Depoimento anterior"
        onClick={previous}
      >
        <ArrowLeft className="button-icon" size={24} />
      </button>
      <button
        type="button"
        className="button testimonial-arrow testimonial-next"
        aria-label="Próximo depoimento"
        onClick={next}
      >
        <ArrowRight className="button-icon" size={24} />
      </button>
      <div ref={pagination} className="testimonial-pagination" aria-label="Escolher depoimento">
        {labels.map((label, i) => (
          <button
            key={i}
            className="button button-lime"
            type="button"
            aria-label={`Depoimento ${i + 1}: ${label}`}
            aria-current={active === i ? 'true' : undefined}
            onClick={() => selectPage(i)}
          >
            <span className="testimonial-page-highlight" aria-hidden="true" />
            <span className="testimonial-page-number">{String(i + 1).padStart(2, '0')}</span>
          </button>
        ))}
      </div>
      <span className="testimonial-announcement" aria-live="polite">
        {active + 1} de 3 · {active === 1 ? 'Prévia em vídeo' : 'Depoimento em texto'}
      </span>
    </div>
  );
}
