'use client';
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Title } from '@/components/ui/title';

type Client = {
  key: string;
  name: string;
  summary: string;
  image: string;
  photo?: string;
  photoAlt?: string;
  href?: string;
  preview?: ReactNode;
};
type FeaturedClient = Client & { photo: string; photoAlt: string };
const descriptions: Record<string, string> = {
  Article:
    'A Universidade de São Paulo (USP) é uma universidade pública dedicada ao ensino, à pesquisa e à extensão, com atuação em diversas áreas do conhecimento.',
  Article_2:
    'O Institut Pasteur atua na pesquisa científica em saúde, com foco em doenças infecciosas, microbiologia e no desenvolvimento do conhecimento para a prevenção de doenças.',
  Article_3:
    'A Superpet é uma feira do setor pet que reúne empresas, marcas e profissionais para apresentar produtos, compartilhar conhecimento e criar oportunidades de negócios.',
};

/** Both credibility rows use the same anchored popover. */
export function ClientDetailsCarousel({ clients }: { clients: FeaturedClient[] }) {
  return <ClientCarousel clients={clients} />;
}

export function ClientCarousel({ clients, media = false }: { clients: Client[]; media?: boolean }) {
  const [active, setActive] = useState<{
    client: Client;
    trigger: HTMLButtonElement;
    id: string;
  } | null>(null);
  const [position, setPosition] = useState({
    left: 12,
    top: 0,
    arrowLeft: 170,
    above: true,
    ready: false,
  });
  const card = useRef<HTMLDivElement>(null);
  const logoTrack = useRef<HTMLDivElement>(null);
  const touchIntent = useRef(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setActive(null), 160);
  };
  const open = (client: Client, trigger: HTMLButtonElement, id: string) => {
    cancelClose();
    if (active?.id === id) return;
    setPosition((p) => ({ ...p, ready: false }));
    setActive({ client, trigger, id });
  };
  useLayoutEffect(() => {
    const track = logoTrack.current;
    if (media || !track) return;
    let disposed = false;
    const measure = () => {
      if (disposed) return;
      const first = track.children[0];
      const clone = track.children[clients.length];
      if (!first || !clone) return;
      // WebKit's max-content track can be wider than its laid-out flex items.
      // The first matching clone is the exact repeat boundary in every engine.
      const distance = clone.getBoundingClientRect().left - first.getBoundingClientRect().left;
      if (distance > 0) track.style.setProperty('--clients-loop-offset', `${-distance}px`);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    Array.from(track.children)
      .slice(0, clients.length)
      .forEach((item) => observer.observe(item));
    track.addEventListener('load', measure, true);
    void document.fonts.ready.then(measure);
    measure();
    return () => {
      disposed = true;
      observer.disconnect();
      track.removeEventListener('load', measure, true);
      track.style.removeProperty('--clients-loop-offset');
    };
  }, [clients, media]);
  useLayoutEffect(() => {
    if (!active || !card.current) return;
    const rect = active.trigger.getBoundingClientRect();
    // Measure layout, independent of the opening transform.
    const { offsetWidth: width, offsetHeight: height } = card.current;
    const above = rect.top - height - 12 >= 96;
    const top = above ? rect.top - height - 12 : rect.bottom + 12;
    const left = Math.max(
      12,
      Math.min(innerWidth - width - 12, rect.left + rect.width / 2 - width / 2),
    );
    setPosition({
      left,
      top: Math.max(12, Math.min(innerHeight - height - 12, top)),
      arrowLeft: Math.max(24, Math.min(width - 24, rect.left + rect.width / 2 - left)),
      above,
      ready: true,
    });
  }, [active]);
  useEffect(() => {
    if (!active) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActive(null);
    };
    const outside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !card.current?.contains(event.target) &&
        !active.trigger.contains(event.target)
      )
        setActive(null);
    };
    const reposition = () => {
      const rect = active.trigger.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > innerHeight) setActive(null);
      else setActive((current) => (current ? { ...current } : null));
    };
    document.addEventListener('keydown', dismiss);
    document.addEventListener('pointerdown', outside);
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      document.removeEventListener('keydown', dismiss);
      document.removeEventListener('pointerdown', outside);
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [active]);
  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );
  return (
    <>
      <div
        className={`${media ? 'impact-press-logos' : 'client-strip'}${active ? ' is-paused' : ''}`}
      >
        <div ref={logoTrack} className={media ? 'media-logo-track' : 'client-track'}>
          {Array.from({ length: media ? 1 : 4 }, (_, repeat) =>
            clients.map((client) => {
              const id = `client-info-${repeat}-${client.key}`;
              return (
                <button
                  type="button"
                  className={
                    media
                      ? 'client-strip-item media-logo-trigger'
                      : 'client-strip-item impact-brand'
                  }
                  aria-label={`${client.name}: ${client.summary}`}
                  key={id}
                  tabIndex={repeat === 0 ? 0 : -1}
                  aria-hidden={repeat > 0 ? true : undefined}
                  aria-describedby={active?.id === id ? id : undefined}
                  aria-expanded={active?.id === id}
                  onPointerDown={(event) => {
                    touchIntent.current = event.pointerType === 'touch';
                  }}
                  onPointerEnter={(event) => {
                    if (event.pointerType !== 'touch') open(client, event.currentTarget, id);
                  }}
                  onPointerLeave={(event) => {
                    if (event.pointerType !== 'touch') scheduleClose();
                  }}
                  onFocus={(event) => {
                    if (!touchIntent.current) open(client, event.currentTarget, id);
                  }}
                  onBlur={scheduleClose}
                  onClick={(event) => {
                    if (touchIntent.current) {
                      cancelClose();
                      touchIntent.current = false;
                      if (active?.id === id) {
                        setActive(null);
                        return;
                      }
                    }
                    open(client, event.currentTarget, id);
                  }}
                >
                  <img
                    className="component-art"
                    src={client.image.replace(/\.svg$/, '-dark.png')}
                    alt=""
                  />
                  {!media && (
                    <span className="client-visible-summary">
                      <span>{client.summary}</span>
                    </span>
                  )}
                </button>
              );
            }),
          )}
        </div>
      </div>
      {active &&
        createPortal(
          <div
            key={active.id}
            ref={card}
            data-ready={position.ready}
            id={active.id}
            aria-label={active.client.href ? active.client.name : undefined}
            role={active.client.href ? 'dialog' : 'tooltip'}
            className="client-tooltip credibility-popover"
            data-side={position.above ? 'above' : 'below'}
            style={{
              transformOrigin: `${position.arrowLeft}px ${position.above ? '100%' : '0%'}`,
              left: position.left,
              top: position.top,
              visibility: position.ready ? 'visible' : 'hidden',
            }}
            onFocus={cancelClose}
            onBlur={scheduleClose}
            onPointerEnter={cancelClose}
            onPointerLeave={scheduleClose}
          >
            <span
              className="client-tooltip-arrow"
              aria-hidden="true"
              style={{ left: position.arrowLeft }}
            />
            <div className="client-tooltip-content">
              {active.client.preview || (
                <>
                  <div className={`client-tooltip-image${active.client.photo ? ' has-photo' : ''}`}>
                    <img
                      src={active.client.photo || active.client.image}
                      alt={active.client.photoAlt || ''}
                    />
                  </div>
                  <div className="client-tooltip-body">
                    <Title as="h3" variant="tooltip">
                      {active.client.name}
                    </Title>
                    <p>{descriptions[active.client.key] || active.client.summary}</p>
                  </div>
                </>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
