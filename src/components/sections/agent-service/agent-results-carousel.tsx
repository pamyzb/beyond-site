'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useTestimonialCarousel } from '../testimonials/use-testimonial-carousel';
import './agent-results.css';

export type AgentResultCase = {
  name: string;
  logo: string;
  segment: string;
  revenue: string;
  savings: string;
  metrics: readonly string[];
  quote: string;
};

/** The shared movement deliberately retains the Home's three-position model. */
export function AgentResultsCarousel({ items }: { items: readonly AgentResultCase[] }) {
  const {
    scope,
    track,
    pagination,
    glassCanvas,
    active,
    interactionProps,
    viewportProps,
    previous,
    next,
    selectPage,
  } = useTestimonialCarousel({ desktopScroll: true });

  return (
    <div
      ref={scope}
      className="testimonial-carousel agent-results-carousel"
      role="region"
      aria-roledescription="carrossel"
      aria-label="Cases"
      tabIndex={0}
      {...interactionProps}
    >
      <div className="testimonial-viewport" {...viewportProps}>
        <div className="testimonial-reading-window">
          <div ref={track} className="testimonial-track">
            {items.map((item, index) => (
              <article
                key={item.name}
                className="testimonial-slide"
                aria-roledescription="slide"
                aria-label={`${index + 1} de 3: ${item.name}`}
                aria-hidden={active !== index}
                inert={active !== index}
              >
                <div className="testimonial-surface agent-result-surface">
                  <div className="agent-result-layout">
                    <div className="agent-result-company">
                      <img
                        className="agent-result-logo"
                        src={item.logo}
                        alt=""
                        width={200}
                        height={80}
                      />
                      <p className="agent-result-segment">{item.segment}</p>
                      <p className="agent-result-revenue">
                        <span>Faturamento anual</span>
                        {item.revenue}
                      </p>
                    </div>
                    <div className="agent-result-copy">
                      <p className="agent-result-savings">
                        <strong>{item.savings}</strong>
                        <span>de economia na folha</span>
                      </p>
                      <blockquote>“{item.quote}”</blockquote>
                      <ul className="agent-result-metrics" aria-label="Outros indicadores">
                        {item.metrics.map((metric) => (
                          <li key={metric}>{metric}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
        <canvas ref={glassCanvas} className="testimonial-glass-canvas" aria-hidden="true" hidden />
      </div>
      <div className="agent-results-controls">
        <button
          type="button"
          className="button testimonial-arrow testimonial-prev"
          aria-label="Case anterior"
          onClick={previous}
        >
          <ArrowLeft className="button-icon" size={24} aria-hidden="true" />
        </button>
        <div ref={pagination} className="testimonial-pagination" aria-label="Escolher case">
          {items.map((item, index) => (
            <button
              key={item.name}
              className="button button-lime"
              type="button"
              aria-label={`Case ${index + 1}: ${item.name}`}
              aria-current={active === index ? 'true' : undefined}
              onClick={() => selectPage(index)}
            >
              <span className="testimonial-page-highlight" aria-hidden="true" />
              <span className="testimonial-page-number">{String(index + 1).padStart(2, '0')}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          className="button testimonial-arrow testimonial-next"
          aria-label="Próximo case"
          onClick={next}
        >
          <ArrowRight className="button-icon" size={24} aria-hidden="true" />
        </button>
      </div>
      <span className="testimonial-announcement" aria-live="polite">
        {active + 1} de 3 · {items[active]?.name}
      </span>
    </div>
  );
}
