'use client';
import { Fragment, useRef } from 'react';
import { gsap, useGSAP } from '@/lib/animation/gsap';
import { rem, type SectionData, type Style } from '@/lib/figma/design';
import { AboutCard } from '@/components/sections/about/about-card';
import { SecondarySectionHeading } from '@/components/ui/secondary-section-heading';

const ids = ['Article_16', 'Article_17', 'Article_18'];
export function AboutSection({ section, icons }: { section: SectionData; icons: string[] }) {
  const scope = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const root = scope.current!;
      const media = gsap.matchMedia();
      media.add('(prefers-reduced-motion:no-preference)', () => {
        const bodies = root.querySelectorAll('.about-card-body');
        bodies.forEach((body, index) =>
          gsap.fromTo(
            body,
            { y: 20, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              ease: 'power3.out',
              delay: index * 0.14,
              scrollTrigger: {
                trigger: body,
                start: 'top 88%',
                toggleActions: 'play none none none',
              },
            },
          ),
        );
      });
      media.add(
        '(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)',
        () => {
          const cleanups = Array.from(root.querySelectorAll('.about-panel-card')).map(
            (card, index) => {
              const glyph = card.querySelector('[data-artwork-role="about-glyph"]');
              if (!glyph) return () => {};
              const motion = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } });
              if (index === 0) {
                motion
                  .to(glyph, {
                    x: -3,
                    y: 1,
                    rotation: -8,
                    transformOrigin: '50% 50%',
                    duration: 0.22,
                  })
                  .to(glyph, { x: 3, y: -1, rotation: 6, duration: 0.32 })
                  .to(glyph, { x: 0, y: 0, rotation: 0, duration: 0.26 });
              } else if (index === 1) {
                const blocks = glyph.querySelectorAll('rect');
                motion.fromTo(
                  blocks,
                  { x: (i) => (i === 3 ? 4 : -2), y: (i) => (i === 3 ? -5 : 3), opacity: 0.3 },
                  { x: 0, y: 0, opacity: 1, stagger: 0.11, duration: 0.36, immediateRender: false },
                );
              } else {
                motion
                  .to(glyph, { x: -1.5, y: 1.5, duration: 0.15 })
                  .to(glyph, { x: 4, y: -4, duration: 0.25, ease: 'power2.out' })
                  .to(glyph, { x: 0, y: 0, duration: 0.4 });
              }
              const enter = () => {
                if (!motion.isActive()) motion.restart();
              };
              card.addEventListener('pointerenter', enter);
              return () => card.removeEventListener('pointerenter', enter);
            },
          );
          return () => cleanups.forEach((cleanup) => cleanup());
        },
      );
      return () => media.revert();
    },
    { scope },
  );
  const heading = section.blocks.find((block) => block.role === 'h2');
  const description = section.blocks.find(
    (block) => block.role === 'p' && !block.ancestors.some((ancestor) => ids.includes(ancestor)),
  );
  return (
    <section
      ref={scope}
      id="sobre"
      aria-label={section.label}
      data-motion="section"
      className={`design-section relative isolate overflow-hidden section-sobre about-animated${section.dark ? ' theme-dark' : ''}`}
      style={{ '--section-height': rem(section.height) } as Style}
    >
      <div className="section-content section-content--sobre">
        {heading && (
          <SecondarySectionHeading
            className="about-heading"
            title={heading.runs.map((run, index) => (
              <Fragment key={`${run.text}-${index}`}>
                {index > 0 && ' '}
                {run.italic ? <em>{run.text.trim()}</em> : run.text.trim()}
              </Fragment>
            ))}
            subtitle={description?.runs.map((run) => run.text.trim()).join(' ')}
          />
        )}
        <div className="about-panel">
          {ids.map((id, index) => (
            <AboutCard key={id} id={id} section={section} icon={icons[index]} />
          ))}
        </div>
      </div>
    </section>
  );
}
