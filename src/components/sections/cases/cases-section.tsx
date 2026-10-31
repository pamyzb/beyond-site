'use client';
import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
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
  const entranceFinished = useRef(false);
  const progressBar = useRef<HTMLSpanElement>(null);
  const stackPlayback = useRef<gsap.core.Tween | null>(null);
  const stackTimeline = useRef<gsap.core.Timeline | null>(null);
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
    stackPlayback.current?.kill();
    stackTimeline.current?.progress(1);
    entryTimeline.current?.progress(1);
    direction.current = index > active ? 1 : -1;
    setRevealed((current) => Math.max(current, index));
    setActive(index);
    if (focus) tabRefs.current[index]?.focus();
  };
  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add('(max-width: 59.999em) and (prefers-reduced-motion: no-preference)', () => {
        const windows = gsap.utils.toArray<HTMLElement>('.case-sequence-window', scope.current!);
        const insetFrame = () =>
          `inset(0 ${getComputedStyle(scope.current!).paddingLeft} round 1.5rem)`;
        const sequence = scope.current!.querySelector<HTMLElement>('.case-mobile-sequence')!;
        windows.forEach((window, index) => {
          gsap.set(window, { zIndex: index + 1 });
          gsap.fromTo(
            window,
            { clipPath: insetFrame },
            {
              clipPath: 'inset(0 0px round 0rem)',
              ease: 'none',
              scrollTrigger: {
                trigger: window,
                start: 'top 75%',
                end: 'top 80px',
                scrub: true,
                invalidateOnRefresh: true,
              },
            },
          );
          // Read tall windows completely before the following window covers them.
          // Pin at the bottom, leaving natural scrolling through each case intact.
          if (index < windows.length - 1) {
            ScrollTrigger.create({
              trigger: window,
              start: 'bottom bottom',
              endTrigger: sequence,
              end: 'bottom bottom',
              pin: true,
              pinSpacing: false,
              invalidateOnRefresh: true,
            });
          }
        });
        const finalWindow = windows[windows.length - 1];
        gsap.fromTo(
          finalWindow,
          { clipPath: 'inset(0 0px round 0rem)' },
          {
            clipPath: insetFrame,
            immediateRender: false,
            ease: 'none',
            scrollTrigger: {
              trigger: finalWindow,
              start: 'bottom bottom',
              end: 'bottom 70%',
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );
      });
      media.add(
        '(min-width: 60em) and (min-height: 48em) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
        () => {
          if (entranceFinished.current) return;
          const cards = gsap.utils.toArray<HTMLElement>('.case-stack-card', scope.current!);
          gsap.set(cards, {
            x: 0,
            y: 0,
            xPercent: 110,
            yPercent: -24,
            rotation: -6,
            transformOrigin: '50% 100%',
            autoAlpha: 1,
          });
          gsap.set(progressBar.current, { scaleX: 1 / projects.length });
          let finalEntryHolding = false;
          // The scroll controller advances this paused timeline only forwards.
          // Once finished, it no longer owns any card or tab state.
          const timeline = gsap.timeline({
            paused: true,
            onComplete: () => {
              if (entranceFinished.current) return;
              finalEntryHolding = false;
              entranceFinished.current = true;
              previousActive.current = projects.length - 1;
              // Commit the matching panel before removing the window covering it.
              // Otherwise the previous project can flash for a frame.
              flushSync(() => setActive(projects.length - 1));
              gsap.set(cards, { autoAlpha: 0 });
              gsap.set(progressBar.current, { scaleX: 1 });
            },
          });
          // Pasteur reveals in place before the next window arrives.
          cards.forEach((card, index) => {
            timeline.fromTo(
              card,
              { x: 0, y: 0, xPercent: 110, yPercent: -24, rotation: -6 },
              {
                x: 0,
                y: 0,
                xPercent: 0,
                yPercent: 0,
                rotation: 0,
                duration: 1.25,
                ease: 'power2.out',
              },
            );
            timeline.call(() => {
              gsap.set(progressBar.current, { scaleX: (index + 2) / projects.length });
            });
            timeline.addLabel(`case-${index + 1}`);
          });
          let triggeredCase = 0;
          const releaseForAnchor = (event: Event) => {
            const targetId = (event as CustomEvent<{ targetId: string }>).detail?.targetId;
            const target = targetId ? document.getElementById(targetId) : null;
            if (
              !target ||
              !(scope.current!.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING)
            )
              return;
            finalEntryHolding = false;
            stackPlayback.current?.kill();
            timeline.progress(1);
          };
          window.addEventListener('site:anchor-navigation', releaseForAnchor);
          const scrollController = ScrollTrigger.create({
            trigger: scope.current!.querySelector('.case-stack'),
            start: 'top 100px',
            end: '+=640',
            pin: true,
            onUpdate: (self) => {
              // A link to a later section must bypass the reading hold. Only
              // retain scroll while the visitor is within this pinned sequence.
              if (self.scroll() > self.end) {
                finalEntryHolding = false;
                if (!entranceFinished.current) {
                  stackPlayback.current?.kill();
                  timeline.progress(1);
                }
                return;
              }
              const finalEntryPosition = self.start + (self.end - self.start) * 0.65;
              if (finalEntryHolding && self.scroll() > finalEntryPosition) {
                window.scrollTo({ top: finalEntryPosition, behavior: 'instant' });
              }
              if (entranceFinished.current) return;
              // Leave an initial reading interval with Pasteur fully in view.
              const next = self.progress >= 0.65 ? 2 : self.progress >= 0.25 ? 1 : 0;
              if (next <= triggeredCase) return;
              triggeredCase = next;
              if (next === 2) {
                // Keep the final window visible while its independent animation lands.
                finalEntryHolding = true;
                if (self.scroll() > finalEntryPosition)
                  window.scrollTo({ top: finalEntryPosition, behavior: 'instant' });
              }
              entryTimeline.current?.progress(1);
              stackPlayback.current?.kill();
              stackPlayback.current = timeline.tweenTo(`case-${next}`, { ease: 'none' });
            },
          });
          const holdWheel = (event: WheelEvent) => {
            if (finalEntryHolding && event.deltaY > 0) event.preventDefault();
          };
          const holdKeyboard = (event: KeyboardEvent) => {
            if (
              finalEntryHolding &&
              ['ArrowDown', 'PageDown', 'End', ' '].includes(event.key) &&
              !(
                event.target instanceof HTMLElement &&
                event.target.closest('input, textarea, select, [contenteditable="true"]')
              )
            )
              event.preventDefault();
          };
          window.addEventListener('wheel', holdWheel, { passive: false });
          window.addEventListener('keydown', holdKeyboard);
          stackTimeline.current = timeline;
          return () => {
            finalEntryHolding = false;
            window.removeEventListener('site:anchor-navigation', releaseForAnchor);
            window.removeEventListener('wheel', holdWheel);
            window.removeEventListener('keydown', holdKeyboard);
            scrollController.kill();
            stackPlayback.current?.kill();
            setRevealed(2);
          };
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
          const browser = scope.current!.querySelector('.case-stack > .case-browser');
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
            .from(
              panel.current!.querySelector('.case-visual'),
              { y: 10, scale: 0.985, opacity: 0, duration: 0.95, ease: 'sine.out' },
              0.24,
            )
            .from(
              panel.current!.querySelectorAll('.case-story > *'),
              { y: 8, opacity: 0, duration: 0.8, stagger: 0.07, ease: 'sine.out' },
              0.34,
            )
            .from(
              panel.current!.querySelector('.case-testimonial'),
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
      // Only panel content animates when a visitor selects a tab.
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
          timeline
            .fromTo(
              '.case-visual',
              { x: -direction.current * 70, opacity: 0 },
              { x: 0, opacity: 1, duration: 0.75 },
              0,
            )
            .fromTo(
              panel.current!.querySelectorAll('.case-story > *'),
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
      <div className="case-mobile-sequence">
        {projects.map((sequenceProject, index) => (
          <div className="case-sequence-step" key={names[index]}>
            <article
              key={names[index]}
              className="case-browser case-sequence-window"
              aria-label={names[index]}
            >
              <div className="case-browser-toolbar">
                <div className="case-window-dots" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </div>
                <span className="case-sequence-favicon" aria-hidden="true">
                  <CaseTabIcon index={index} />
                </span>
                <span className="case-sequence-name">{names[index]}</span>
              </div>
              <CasePanel active={index} project={sequenceProject} cta={cta} sequence />
            </article>
          </div>
        ))}
      </div>
      <div className="case-stack">
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
        {projects.slice(1).map((stackProject, offset) => (
          <div
            key={names[offset + 1]}
            className="case-browser case-stack-card"
            aria-hidden="true"
            inert
          >
            <div className="case-browser-toolbar">
              <div className="case-window-dots">
                <i />
                <i />
                <i />
              </div>
              <div className="case-navigation">
                <button type="button" tabIndex={-1}>
                  <ChevronLeft size={18} strokeWidth={1.7} />
                </button>
                <button type="button" tabIndex={-1} disabled={offset + 1 === projects.length - 1}>
                  <ChevronRight size={18} strokeWidth={1.7} />
                </button>
              </div>
              <div className="case-tabs">
                {names.map((name, index) => (
                  <div key={name} className="case-tab" aria-selected={index === offset + 1}>
                    <CaseTabIcon index={index} />
                    <span className="case-tab-label">{name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="case-stack-panel">
              <CasePanel active={offset + 1} project={stackProject} cta={cta} />
            </div>
          </div>
        ))}
        <div className="case-scroll-progress" aria-hidden="true">
          <span
            ref={progressBar}
            style={{ transform: `scaleX(${(active + 1) / projects.length})` }}
          />
        </div>
      </div>
    </section>
  );
}
