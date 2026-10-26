'use client';
import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/animation/gsap';
import type { CasesContent } from '@/data/cases';
import { CasePanel, CaseTabIcon } from '@/components/sections/cases/case-panel';
import { SectionHeading } from '@/components/ui/section-heading';

export function CasesSection({ content }: { content: CasesContent }) {
  const scope = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const direction = useRef(1);
  const entryTimeline = useRef<gsap.core.Timeline | null>(null);
  const previousActive = useRef(0);
  const scrollCase = useRef(0);
  const [active, setActive] = useState(0);
  const [revealed, setRevealed] = useState(2);
  const { label, heading, intro, names, projects, cta } = content;
  const project = projects[active];
  const [headingStart, headingAccent] = heading.split('{');
  useEffect(() => {
    const tabs = scope.current?.querySelector<HTMLElement>('.case-tabs');
    if (!tabs) return;
    let disposed = false;
    let measureFrame = 0;
    const measure = () => {
      if (disposed) return;
      delete tabs.dataset.iconsOnly;
      if (tabs.scrollWidth > tabs.clientWidth + 1) tabs.dataset.iconsOnly = 'true';
    };
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(measureFrame);
      measureFrame = requestAnimationFrame(measure);
    });
    observer.observe(tabs);
    measure();
    void document.fonts.ready.then(measure);
    return () => {
      disposed = true;
      cancelAnimationFrame(measureFrame);
      observer.disconnect();
    };
  }, [names, revealed, active]);
  const select = (index: number, focus = false) => {
    if (index < 0 || index >= projects.length || index === active) return;
    entryTimeline.current?.progress(1);
    direction.current = index > active ? 1 : -1;
    setRevealed((current) => Math.max(current, index));
    setActive(index);
    if (focus) tabRefs.current[index]?.focus();
  };
  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add(
        '(min-width: 60em) and (min-height: 48em) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
        () => {
          setRevealed(0);
          ScrollTrigger.create({
            trigger: scope.current!.querySelector('.case-browser'),
            start: 'top 100px',
            end: () => `+=${innerHeight * 2.4}`,
            pin: true,
            onRefresh: (self) =>
              setRevealed((current) =>
                Math.max(current, Math.min(2, Math.floor(self.progress * 3))),
              ),
            onUpdate: (self) => {
              const next = Math.min(2, Math.floor(self.progress * 3));
              setRevealed((current) => Math.max(current, next));
              if (next === scrollCase.current) return;
              direction.current = next > scrollCase.current ? 1 : -1;
              scrollCase.current = next;
              entryTimeline.current?.progress(1);
              setActive(next);
            },
          });
          return () => setRevealed(2);
        },
      );
      media.add(
        {
          motion: '(prefers-reduced-motion: no-preference)',
          compact:
            '(max-width: 59.999em), (max-height: 47.999em), (hover: none), (pointer: coarse)',
        },
        (context) => {
          if (!context.conditions?.motion) return;
          const browser = scope.current!.querySelector('.case-browser');
          if (context.conditions.compact) {
            const groups = panel.current!.querySelectorAll<HTMLElement>(
              '.case-visual, .case-story > *, .case-testimonial',
            );
            groups.forEach((group) => {
              gsap.from(group, {
                y: 10,
                opacity: 0,
                duration: 0.95,
                ease: 'sine.out',
                scrollTrigger: {
                  trigger: group,
                  start: 'top 85%',
                  toggleActions: 'play none none none',
                },
              });
            });
            return;
          }
          const characters = gsap.utils.toArray<HTMLElement>(
            '.case-quote-character',
            panel.current!,
          );
          gsap.set(characters, { opacity: 0 });
          entryTimeline.current = gsap
            .timeline({
              defaults: { ease: 'power3.out' },
              scrollTrigger: {
                trigger: browser,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
            })
            .from('.case-browser-toolbar', { opacity: 0, duration: 0.7 }, 0)
            .from(
              '.case-visual',
              { y: 10, scale: 0.985, opacity: 0, duration: 0.95, ease: 'sine.out' },
              0.24,
            )
            .from(
              '.case-story > *',
              { y: 8, opacity: 0, duration: 0.8, stagger: 0.07, ease: 'sine.out' },
              0.34,
            )
            .from(
              '.case-testimonial',
              { y: 6, opacity: 0, duration: 0.85, ease: 'sine.out' },
              0.55,
            );
          characters.forEach((character, index) =>
            entryTimeline.current!.set(character, { opacity: 1 }, 0.85 + index * 0.025),
          );
        },
        scope,
      );
      return () => media.revert();
    },
    { scope },
  );
  useGSAP(
    () => {
      // The scroll timeline owns the first entrance; tabs keep their own transition.
      if (previousActive.current === active) return;
      previousActive.current = active;
      const media = gsap.matchMedia();
      media.add(
        '(prefers-reduced-motion: no-preference)',
        () => {
          const characters = gsap.utils.toArray<HTMLElement>(
            '.case-quote-character',
            panel.current!,
          );
          gsap.set(characters, { opacity: 0 });
          const timeline = gsap.timeline({ defaults: { ease: 'sine.out' } });
          gsap.fromTo(
            tabRefs.current[active],
            { x: -120, y: -20, opacity: 0 },
            { x: 0, y: 0, opacity: 1, duration: 0.65, ease: 'power3.out' },
          );
          timeline
            .fromTo(
              '.case-visual',
              { x: -direction.current * 70, opacity: 0 },
              { x: 0, opacity: 1, duration: 0.75 },
              0,
            )
            .fromTo(
              '.case-story > *',
              { y: 8, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.6, stagger: 0.055 },
              0.06,
            )
            .fromTo('.case-testimonial', { opacity: 0 }, { opacity: 1, duration: 0.65 }, 0.18);
          characters.forEach((character, index) =>
            timeline.set(character, { opacity: 1 }, 0.45 + index * 0.025),
          );
        },
        panel,
      );
      return () => media.revert();
    },
    { scope: panel, dependencies: [active], revertOnUpdate: true },
  );
  return (
    <section
      ref={scope}
      id="cases"
      className="design-section section-cases cases-editorial"
      aria-label={content.ariaLabel}
    >
      <div className="impact-patterns" aria-hidden="true">
        {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => (
          <img
            key={corner}
            className={`impact-pattern impact-pattern-${corner}`}
            src={`/assets/metricas/metrics-pattern-${corner}.svg`}
            alt=""
          />
        ))}
      </div>
      <SectionHeading
        label={label}
        title={
          <>
            {headingStart}
            <em>{`{${headingAccent ?? ''}`}</em>
          </>
        }
        subtitle={intro}
      />
      <div className="case-browser">
        <div className="case-browser-toolbar">
          <div className="case-window-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <nav className="case-navigation" aria-label="Navegação entre projetos">
            <button
              type="button"
              aria-label="Projeto anterior"
              disabled={active === 0}
              onClick={() => select(active - 1)}
            >
              <ChevronLeft size={18} strokeWidth={1.7} />
            </button>
            <button
              type="button"
              aria-label="Próximo projeto"
              disabled={active === 2}
              onClick={() => select(active + 1)}
            >
              <ChevronRight size={18} strokeWidth={1.7} />
            </button>
          </nav>
          <div className="case-tabs" role="tablist" aria-label="Cases">
            {names.map((name, index) => (
              <button
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                key={name}
                className="case-tab"
                hidden={index > Math.max(revealed, active)}
                id={`case-tab-${index}`}
                type="button"
                role="tab"
                aria-label={name}
                title={name}
                aria-selected={active === index}
                aria-controls="case-panel"
                tabIndex={active === index ? 0 : -1}
                onClick={() => select(index)}
                onKeyDown={(event) => {
                  const next =
                    event.key === 'ArrowRight'
                      ? (active + 1) % 3
                      : event.key === 'ArrowLeft'
                        ? (active + 2) % 3
                        : event.key === 'Home'
                          ? 0
                          : event.key === 'End'
                            ? 2
                            : null;
                  if (next !== null) {
                    event.preventDefault();
                    select(next, true);
                  }
                }}
              >
                <CaseTabIcon index={index} /> <span className="case-tab-label">{name}</span>
              </button>
            ))}
          </div>
        </div>
        <div ref={panel} id="case-panel" role="tabpanel" aria-labelledby={`case-tab-${active}`}>
          <CasePanel active={active} project={project} cta={cta} />
        </div>
      </div>
    </section>
  );
}
