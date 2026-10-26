'use client';
import { Fragment, useRef } from 'react';
import { useGSAP } from '@/lib/animation/gsap';
import { rem, type SectionData, type Style } from '@/lib/figma/design';
import { AboutCard } from '@/components/sections/about/about-card';
import { SecondarySectionHeading } from '@/components/ui/secondary-section-heading';

import { animateAboutCards } from './animate-about-cards';

const ids = ['Article_16', 'Article_17', 'Article_18'];
export function AboutSection({ section, icons }: { section: SectionData; icons: string[] }) {
  const scope = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const root = scope.current!;
      return animateAboutCards(root);
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
