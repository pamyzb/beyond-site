'use client';

import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ReceiptText, MessagesSquare, Users, Factory } from 'lucide-react';
import { Title } from '@/components/ui/title';
import { BorderTrail } from '@/components/ui/border-trail';
import { gsap, useGSAP } from '@/lib/animation/gsap';

interface CarouselItem {
  title: string;
  description: string;
}

export function CircularCarousel({ items }: { items: readonly CarouselItem[] }) {
  const icons = [ReceiptText, MessagesSquare, Users, Factory];
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(active);
  activeRef.current = active;
  const updateLayout = useRef<((animate: boolean) => void) | null>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const go = (index: number) => setActive((index + items.length) % items.length);

  useGSAP(
    () => {
      const element = root.current!;
      const stage = element.querySelector<HTMLElement>('.circular-carousel-stage')!;
      const cards = Array.from(stage.querySelectorAll<HTMLElement>('.circular-carousel-card'));
      if (!cards.length) return;
      const media = gsap.matchMedia();
      media.add(
        {
          reduced: '(prefers-reduced-motion: reduce)',
          motion: '(prefers-reduced-motion: no-preference)',
        },
        (context) => {
          const layout = (animate: boolean) => {
            const radius = Math.max(0, (stage.clientWidth - cards[0].offsetWidth) / 2);
            stage.style.height = `${Math.max(...cards.map((card) => card.offsetHeight)) + 90}px`;
            cards.forEach((card, index) => {
              let offset = (index - activeRef.current + items.length) % items.length;
              if (offset > items.length / 2) offset -= items.length;
              const angle = (offset * Math.PI) / 2;
              const front = offset === 0;
              gsap.set(card, { zIndex: front ? 3 : 1 });
              gsap.to(card, {
                x: Math.sin(angle) * radius,
                y: front ? 0 : (1 - Math.cos(angle)) * 60,
                scale: front ? 1 : 0.82,
                autoAlpha: Math.abs(offset) > 1 ? 0 : 1,
                duration: animate && !context.conditions?.reduced ? 0.65 : 0,
                ease: 'power3.out',
                overwrite: true,
              });
            });
          };
          updateLayout.current = layout;
          layout(false);
          let layoutFrame = 0;
          const observer = new ResizeObserver(() => {
            cancelAnimationFrame(layoutFrame);
            layoutFrame = requestAnimationFrame(() => layout(false));
          });
          observer.observe(stage);
          cards.forEach((card) => observer.observe(card));
          return () => {
            cancelAnimationFrame(layoutFrame);
            observer.disconnect();
            updateLayout.current = null;
          };
        },
      );
      return () => media.revert();
    },
    { scope: root, dependencies: [items.length], revertOnUpdate: true },
  );

  useGSAP(
    () => {
      updateLayout.current?.(true);
    },
    { scope: root, dependencies: [active] },
  );

  if (!items.length) return null;
  return (
    <div
      ref={root}
      className="circular-carousel"
      role="region"
      aria-roledescription="carrossel"
      aria-label="Áreas de aplicação"
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          event.preventDefault();
          go(active + (event.key === 'ArrowRight' ? 1 : -1));
        }
      }}
    >
      <div
        className="circular-carousel-stage"
        onTouchStart={(event) => {
          touch.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
        }}
        onTouchEnd={(event) => {
          if (!touch.current) return;
          const dx = event.changedTouches[0].clientX - touch.current.x;
          const dy = event.changedTouches[0].clientY - touch.current.y;
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(active + (dx < 0 ? 1 : -1));
          touch.current = null;
        }}
      >
        {items.map((item, index) => (
          <article
            className="circular-carousel-card"
            key={item.title}
            data-active={index === active}
            aria-hidden={index !== active}
          >
            {index === active && <BorderTrail />}
            <span className="circular-carousel-number" aria-hidden="true">
              {(() => {
                const Icon = icons[index % icons.length];
                return <Icon strokeWidth={1.75} />;
              })()}
            </span>
            <Title as="h3" variant="service" data-motion="static">
              {item.title}
            </Title>
            <p>{item.description}</p>
            {index !== active && (
              <button
                type="button"
                className="circular-carousel-select"
                tabIndex={-1}
                aria-label={`Selecionar ${item.title}`}
                onClick={() => go(index)}
              />
            )}
          </article>
        ))}
      </div>
      <div className="circular-carousel-controls">
        <button
          type="button"
          className="button testimonial-arrow"
          onClick={() => go(active - 1)}
          aria-label="Aplicação anterior"
        >
          <ArrowLeft className="button-icon" size={24} aria-hidden="true" />
        </button>
        <div className="services-pagination" role="group" aria-label="Selecionar aplicação">
          {items.map((item, index) => (
            <button
              type="button"
              key={item.title}
              aria-label={item.title}
              aria-current={index === active ? 'true' : undefined}
              onClick={() => go(index)}
            >
              <span />
            </button>
          ))}
        </div>
        <button
          type="button"
          className="button testimonial-arrow"
          onClick={() => go(active + 1)}
          aria-label="Próxima aplicação"
        >
          <ArrowRight className="button-icon" size={24} aria-hidden="true" />
        </button>
      </div>
      <p className="testimonial-announcement" aria-live="polite" aria-atomic="true">
        {String(active + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')} ·{' '}
        {items[active].title}
      </p>
    </div>
  );
}
