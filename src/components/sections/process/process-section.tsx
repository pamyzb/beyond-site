'use client';
import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/animation/gsap';
import { rem, type SectionData, type Style } from '@/lib/figma/design';
import { ProcessCard } from '@/components/sections/process/process-card';
import { SectionHeading } from '@/components/ui/section-heading';
import { HeadingRuns } from '@/components/ui/heading-runs';
import type { ProcessArtwork } from '@/lib/server/process-artwork';

const cards = [
  { id: 'Article_12', x: 164, y: 310, width: 530, height: 395 },
  { id: 'Article_13', x: 758, y: 440, width: 530, height: 380 },
  { id: 'Article_15', x: 135, y: 720, width: 530, height: 355 },
  { id: 'Article_14', x: 798, y: 835, width: 530, height: 355 },
];
export function ProcessSection({
  section,
  artwork,
}: {
  section: SectionData;
  artwork: ProcessArtwork;
}) {
  const scope = useRef<HTMLElement>(null);
  const headingBlocks = section.blocks.filter((block) =>
    block.ancestors.some((ancestor) => ancestor.startsWith('section-title')),
  );
  const headingLabel = headingBlocks.find((block) => block.role === 'label');
  const headingTitle = headingBlocks.find((block) => block.role === 'h2');
  const headingSubtitle = headingBlocks.find((block) => block.role === 'p');
  useGSAP(
    () => {
      const root = scope.current!;
      const targets = Array.from(root.querySelectorAll<HTMLElement>('.process-card-entry')).sort(
        (first, second) => Number(first.dataset.step) - Number(second.dataset.step),
      );
      const svg = root.querySelector<SVGSVGElement>('.process-route-layer svg')!;
      const markerSvg = root.querySelector<SVGSVGElement>('.process-marker-layer svg')!;
      const marker = markerSvg.querySelector<SVGGElement>('[data-artwork-role="process-marker"]')!;
      const route = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      route.setAttribute('class', 'process-route');
      route.setAttribute('fill', 'none');
      route.setAttribute('stroke', '#4B5563');
      route.setAttribute('stroke-width', '1.5');
      route.setAttribute('stroke-dasharray', '5 9');
      svg.appendChild(route);
      const anchor = (
        target: HTMLElement,
        side: 'left' | 'right' | 'top' | 'bottom',
        fraction: number,
      ) => {
        const face = target.querySelector<SVGGraphicsElement>('.process-card-surface rect');
        const matrix = face?.getScreenCTM();
        if (face && matrix) {
          const box = face.getBBox();
          // Use the actual rotated edge, with a small overlap beneath the face.
          return new DOMPoint(
            side === 'left'
              ? box.x + 2
              : side === 'right'
                ? box.x + box.width - 2
                : box.x + box.width * fraction,
            side === 'top'
              ? box.y + 2
              : side === 'bottom'
                ? box.y + box.height - 2
                : box.y + box.height * fraction,
          ).matrixTransform(matrix);
        }
        const box = target.getBoundingClientRect();
        return {
          x:
            side === 'left'
              ? box.left
              : side === 'right'
                ? box.right
                : box.left + box.width * fraction,
          y:
            side === 'top'
              ? box.top
              : side === 'bottom'
                ? box.bottom
                : box.top + box.height * fraction,
        };
      };
      const measure = () => {
        const bounds = root.getBoundingClientRect();
        svg.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
        markerSvg.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
        // These entry and exit points retain the intentional hand-drawn flow
        // of the reference: 1 → 2 descends, 2 → 3 bends back, then 3 → 4 exits.
        const connections = [
          { from: 'right', fromY: 0.35, to: 'left', toY: 0.52 },
          { from: 'left', fromY: 0.54, to: 'right', toY: 0.38 },
          { from: 'right', fromY: 0.48, to: 'left', toY: 0.45 },
        ] as const;
        const parts = targets.slice(0, -1).map((target, index) => {
          const next = targets[index + 1];
          const stacked = getComputedStyle(targets[0].parentElement!).display === 'contents';
          const connection = stacked
            ? {
                from: 'bottom' as const,
                fromY: index % 2 ? 0.35 : 0.65,
                to: 'top' as const,
                toY: index % 2 ? 0.65 : 0.35,
              }
            : connections[index];
          const start = anchor(target, connection.from, connection.fromY);
          const end = anchor(next, connection.to, connection.toY);
          const sx = start.x - bounds.left,
            sy = start.y - bounds.top,
            ex = end.x - bounds.left,
            ey = end.y - bounds.top;
          if (stacked) {
            const bend = Math.max(16, (ey - sy) * 0.5);
            return `M${sx} ${sy} C${sx} ${sy + bend},${ex} ${ey - bend},${ex} ${ey}`;
          }
          const bend = Math.max(56, Math.min(150, Math.abs(ex - sx) * 0.42));
          const direction = connection.from === 'right' ? 1 : -1;
          return `M${sx} ${sy} C${sx + bend * direction} ${sy},${ex - bend * direction} ${ey},${ex} ${ey}`;
        });
        route.setAttribute('d', parts.join(' '));
      };
      const place = (progress: number) => {
        const point = route.getPointAtLength(route.getTotalLength() * progress);
        // The imported marker's centre is at these original Figma coordinates.
        const scale = Math.min(1, Math.max(0.65, targets[0].getBoundingClientRect().width / 530));
        marker.setAttribute(
          'transform',
          `translate(${point.x} ${point.y}) scale(${scale}) translate(-649.05 -7913.4)`,
        );
      };
      measure();
      place(0);
      const resize = new ResizeObserver(() => {
        measure();
        ScrollTrigger.refresh();
      });
      resize.observe(root);
      targets.forEach((target) => resize.observe(target));
      // Refresh also runs after layout/font changes, including reduced motion.
      ScrollTrigger.addEventListener('refresh', measure);
      const media = gsap.matchMedia();
      media.add(
        { motion: '(prefers-reduced-motion:no-preference)', compact: '(max-width:89.999em)' },
        (context) => {
          if (!context.conditions?.motion) return;
          const position = { progress: 0 };
          const entrance = gsap.timeline({
            scrollTrigger: {
              trigger: targets[0],
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
            onUpdate: () => {
              // Keep the connectors attached while the cards slide into place.
              measure();
              place(position.progress);
            },
          });
          if (context.conditions.compact) {
            targets.forEach((target, index) => {
              gsap.fromTo(
                target,
                { x: index % 2 === 0 ? -80 : 80, opacity: 0 },
                {
                  x: 0,
                  opacity: 1,
                  duration: 1.65,
                  ease: 'power4.out',
                  scrollTrigger: {
                    trigger: target,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                  },
                  onUpdate: () => {
                    measure();
                    place(position.progress);
                  },
                },
              );
            });
          } else {
            entrance.fromTo(
              targets,
              { x: (index) => (index % 2 === 0 ? -160 : 160), opacity: 0 },
              { x: 0, opacity: 1, duration: 1.65, ease: 'power4.out', stagger: 0.16 },
              0,
            );
          }
          entrance.fromTo(
            [svg, markerSvg],
            { opacity: 0 },
            { opacity: 1, duration: 1, ease: 'power2.out' },
            0.4,
          );
          const tween = gsap.to(position, {
            progress: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: root,
              start: 'top 25%',
              end: 'bottom 65%',
              scrub: 0.65,
              invalidateOnRefresh: true,
              onRefresh: () => {
                measure();
                place(position.progress);
              },
            },
            onUpdate: () => place(position.progress),
          });
          return () => {
            entrance.kill();
            tween.kill();
          };
        },
      );
      media.add(
        '(min-width:1440px) and (hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)',
        () => {
          const cleanups = Array.from(
            root.querySelectorAll<HTMLElement>('.process-card-entry'),
          ).map((target) => {
            const face = target.querySelector<SVGGElement>('[data-artwork-role="process-face"]');
            const filterId = face?.getAttribute('filter')?.match(/url\(#(.+)\)/)?.[1];
            const filter = filterId
              ? target.querySelector<SVGFilterElement>(`filter[id="${filterId}"]`)
              : null;
            if (!filter) return () => {};
            const offsets = filter.querySelectorAll('feOffset');
            const blur = filter.querySelector('feGaussianBlur');
            // Animate the existing solid grey shadow, rather than adding a dark halo.
            const hover = gsap
              .timeline({ paused: true, defaults: { duration: 0.45, ease: 'power2.out' } })
              .to(offsets[0], { attr: { dx: 2, dy: 27 } }, 0)
              .to(offsets[1], { attr: { dx: 2, dy: 38 } }, 0);
            if (blur) hover.to(blur, { attr: { stdDeviation: 22 } }, 0);
            const enter = () => hover.play();
            const leave = () => hover.reverse();
            target.addEventListener('pointerenter', enter);
            target.addEventListener('pointerleave', leave);
            return () => {
              target.removeEventListener('pointerenter', enter);
              target.removeEventListener('pointerleave', leave);
            };
          });
          return () => cleanups.forEach((cleanup) => cleanup());
        },
      );
      return () => {
        resize.disconnect();
        ScrollTrigger.removeEventListener('refresh', measure);
        route.remove();
        media.revert();
      };
    },
    { scope },
  );
  return (
    <section
      ref={scope}
      id="processo"
      aria-label={section.label}
      data-motion="section"
      className={`design-section relative isolate overflow-hidden section-processo process-animated${section.dark ? ' theme-dark' : ''}`}
      style={{ '--section-height': rem(section.height) } as Style}
    >
      <div className="process-route-layer" aria-hidden="true">
        <svg />
      </div>
      <div
        className="process-marker-layer"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: artwork.marker }}
      />
      <div className="section-content section-content--processo">
        {headingLabel && headingTitle && (
          <SectionHeading
            className="process-section-heading"
            label={headingLabel.runs.map((run) => run.text.trim()).join(' ')}
            title={<HeadingRuns runs={headingTitle.runs} />}
            subtitle={headingSubtitle?.runs.map((run) => run.text.trim()).join(' ')}
          />
        )}
        <div className="process-card-column process-card-column--left">
          {[0, 2].map((index) => {
            const card = cards[index];
            return (
              <ProcessCard
                key={card.id}
                card={card}
                index={index}
                section={section}
                artwork={artwork.cards[card.id]}
              />
            );
          })}
        </div>
        <div className="process-card-column process-card-column--right">
          {[1, 3].map((index) => {
            const card = cards[index];
            return (
              <ProcessCard
                key={card.id}
                card={card}
                index={index}
                section={section}
                artwork={artwork.cards[card.id]}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
