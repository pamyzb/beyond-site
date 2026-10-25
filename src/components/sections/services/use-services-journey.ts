'use client';
import type { RefObject } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/animation/gsap';
type Options = {
  scope: RefObject<HTMLElement | null>;
  viewport: RefObject<HTMLDivElement | null>;
  rail: RefObject<HTMLDivElement | null>;
  paintJourney: RefObject<() => void>;
  scrollJourney: RefObject<ScrollTrigger | null>;
  updatePagination: () => void;
};
export function useServicesJourney({
  scope,
  viewport,
  rail,
  paintJourney,
  scrollJourney,
  updatePagination,
}: Options) {
  useGSAP(
    () => {
      const track = rail.current!;
      const element = viewport.current!;
      const path = track.querySelector<SVGPathElement>('.services-route path')!;
      const svg = path.ownerSVGElement!;
      const robots = Array.from(track.querySelectorAll<HTMLElement>(':scope > .builder'));
      const reduced = matchMedia('(prefers-reduced-motion: reduce)');
      const compactMedia = matchMedia('(max-width: 89.999em), (hover: none), (pointer: coarse)');
      let length = 0;
      let outlineLength = 0;
      let construction: gsap.core.Timeline | undefined;
      let traveling = false;
      let cardBounds: { left: number; right: number; top: number; bottom: number }[] = [];
      const journey = { distance: 0 };
      let robotStartDistances = [0, 0];
      const robotOffset = (point: DOMPoint) => {
        const card = cardBounds.find(
          (bounds) => point.x >= bounds.left - 24 && point.x <= bounds.right + 24,
        );
        if (card && point.y > card.bottom) return 30;
        if (card && point.y < card.top) return -30;
        return -26;
      };
      const placeRobots = () => {
        const joining = journey.distance < robotStartDistances[1];
        robots.forEach((robot, index) => {
          const distance = Math.max(
            0,
            Math.min(
              length,
              joining
                ? index === 0
                  ? journey.distance
                  : robotStartDistances[1]
                : journey.distance,
            ),
          );
          const point = path.getPointAtLength(distance);
          const spacing = joining ? 39 : 72;
          const before = path.getPointAtLength(Math.max(0, distance - 12));
          const after = path.getPointAtLength(Math.min(length, distance + 12));
          const onVerticalSegment =
            !joining && Math.abs(after.y - before.y) > Math.abs(after.x - before.x);
          let x = point.x + (onVerticalSegment ? 0 : index * spacing);
          let y = point.y + robotOffset(point) + (onVerticalSegment ? index * spacing : 0);
          if (compactMedia.matches && cardBounds.length) {
            // The SVG route can lag behind native scrolling. Choose the card
            // from the actual viewport, never from that delayed route position.
            const center = element.scrollLeft + element.clientWidth / 2;
            const card = cardBounds.reduce((nearest, candidate) => {
              const gap = (bounds: (typeof cardBounds)[number]) =>
                Math.max(bounds.left - center, 0, center - bounds.right);
              return gap(candidate) < gap(nearest) ? candidate : nearest;
            });
            const halfWidth = Math.max(...robots.map((builder) => builder.offsetWidth)) / 2;
            const pairSpacing = 72;
            const visibleLeft = element.scrollLeft + halfWidth + 12;
            const visibleRight =
              element.scrollLeft + element.clientWidth - halfWidth - pairSpacing - 12;
            const start = Math.max(
              visibleLeft,
              Math.min(
                visibleRight,
                Math.max(
                  card.left + halfWidth,
                  Math.min(card.right - halfWidth - pairSpacing, point.x),
                ),
              ),
            );
            x = start + index * pairSpacing;
            y = card.top - 38;
          }
          gsap.set(robot, {
            left: 0,
            top: 0,
            x,
            y,
            xPercent: -50,
            yPercent: -50,
          });
        });
      };
      const followJourney = (distance: number) =>
        gsap.to(journey, {
          distance,
          duration: 0.45,
          ease: 'power2.out',
          overwrite: 'auto',
          onUpdate: placeRobots,
        });
      const paint = () => {
        if (!length) return;
        // Native swipes update the viewport before the journey tween catches up.
        if (compactMedia.matches) placeRobots();
        const max = element.scrollWidth - element.clientWidth;
        const progress = max > 0 ? Math.max(0, Math.min(1, element.scrollLeft / max)) : 0;
        if (progress <= 0.001) {
          path.style.strokeDasharray = String(length);
          path.style.strokeDashoffset = String(reduced.matches ? 0 : length);
          if (traveling) {
            traveling = false;
            gsap.killTweensOf(journey);
            robots.forEach((robot) => {
              gsap.killTweensOf(robot);
            });
            journey.distance = robotStartDistances[0];
            placeRobots();
            construction?.restart();
          }
          return;
        }
        if (!traveling) {
          traveling = true;
          construction?.pause();
          journey.distance = robotStartDistances[0];
          placeRobots();
        }
        // Once the card outline is drawn, every bit of carousel progress advances
        // directly into the route to the next service.
        const joinProgress = 0.18;
        const compact = false;
        const head = compact
          ? outlineLength + (length - outlineLength) * progress
          : progress < joinProgress
            ? robotStartDistances[0] +
              (robotStartDistances[1] - robotStartDistances[0]) * (progress / joinProgress)
            : robotStartDistances[1] +
              (length - robotStartDistances[1]) * ((progress - joinProgress) / (1 - joinProgress));
        path.style.strokeDasharray = String(length);
        const dashOffset = reduced.matches ? 0 : length - Math.max(outlineLength, head);
        // Native horizontal scrolling can move several cards between frames.
        // Tween the drawn segment so the route visibly grows into each contour.
        if (compact && !reduced.matches)
          gsap.to(path, {
            strokeDashoffset: dashOffset,
            duration: 0.48,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        else path.style.strokeDashoffset = String(dashOffset);
        followJourney(head);
      };
      paintJourney.current = paint;
      const measure = () => {
        const cards = Array.from(track.querySelectorAll<HTMLElement>(':scope > article'));
        cardBounds = cards.map((card) => ({
          left: card.offsetLeft,
          right: card.offsetLeft + card.offsetWidth,
          top: card.offsetTop,
          bottom: card.offsetTop + card.offsetHeight,
        }));
        const agentCard = cards[0];
        if (!agentCard) return;
        const radius = Math.min(28, agentCard.offsetWidth / 2, agentCard.offsetHeight / 2);
        const left = agentCard.offsetLeft - 1,
          top = agentCard.offsetTop - 1;
        const right = agentCard.offsetLeft + agentCard.offsetWidth + 1,
          bottom = agentCard.offsetTop + agentCard.offsetHeight + 1;
        const middle = (top + bottom) / 2;
        // A single line closes the agent card before continuing through every other card.
        let d = `M ${right} ${middle} V ${bottom - radius} Q ${right} ${bottom} ${right - radius} ${bottom} H ${left + radius} Q ${left} ${bottom} ${left} ${bottom - radius} V ${top + radius} Q ${left} ${top} ${left + radius} ${top} H ${right - radius} Q ${right} ${top} ${right} ${top + radius} V ${middle}`;
        outlineLength = 2 * (right - left + (bottom - top)) - (8 - 2 * Math.PI) * radius;
        let previous = { x: right, y: middle };
        // Small screens retain the agent-card outline only. The longer route is
        // reserved for the spacious desktop canvas.
        if (true) {
          const routePoints = [previous];
          cards.slice(1).forEach((card, index) => {
            const x = card.offsetLeft - 12;
            const cardRight = card.offsetLeft + card.offsetWidth + 12;
            const y =
              (index + 1) % 2 === 0 ? card.offsetTop - 42 : card.offsetTop + card.offsetHeight + 42;
            const turn = (previous.x + x) / 2;
            routePoints.push(
              { x: turn, y: previous.y },
              { x: turn, y },
              { x, y },
              { x: cardRight, y },
            );
            previous = { x: cardRight, y };
          });
          for (let index = 1; index < routePoints.length - 1; index++) {
            const previousPoint = routePoints[index - 1],
              point = routePoints[index],
              next = routePoints[index + 1];
            const before = Math.hypot(point.x - previousPoint.x, point.y - previousPoint.y);
            const after = Math.hypot(next.x - point.x, next.y - point.y);
            const corner = Math.min(22, before / 2, after / 2);
            if (!before || !after) continue;
            d += ` L ${point.x - ((point.x - previousPoint.x) / before) * corner} ${point.y - ((point.y - previousPoint.y) / before) * corner} Q ${point.x} ${point.y} ${point.x + ((next.x - point.x) / after) * corner} ${point.y + ((next.y - point.y) / after) * corner}`;
          }
          const finalPoint = routePoints[routePoints.length - 1];
          d += ` L ${finalPoint.x} ${finalPoint.y}`;
        }
        svg.setAttribute('width', String(track.scrollWidth));
        svg.setAttribute('height', String(track.offsetHeight));
        path.setAttribute('d', d);
        length = path.getTotalLength();
        const nearestDistance = (target: { x: number; y: number }) => {
          let closest = 0,
            closestDistance = Infinity;
          for (let index = 0; index <= 360; index++) {
            const distance = (outlineLength * index) / 360;
            const point = path.getPointAtLength(distance);
            const squared = (point.x - target.x) ** 2 + (point.y - target.y) ** 2;
            if (squared < closestDistance) {
              closestDistance = squared;
              closest = distance;
            }
          }
          return closest;
        };
        robotStartDistances = [
          nearestDistance({ x: left + (right - left) * 0.78, y: top }),
          Math.max(0, outlineLength - 64),
        ];
        if (!traveling) {
          journey.distance = robotStartDistances[0];
          placeRobots();
        }
        paint();
        updatePagination();
      };
      measure();
      const observer = new ResizeObserver(measure);
      observer.observe(track);
      observer.observe(element);
      track.querySelectorAll(':scope > article').forEach((card) => observer.observe(card));
      reduced.addEventListener('change', paint);
      const mm = gsap.matchMedia();
      // The scroll-pinned journey needs enough horizontal and vertical room to
      // read the cards. Tablets and smaller screens retain native scrolling.
      mm.add(
        '(min-width: 90em) and (min-height: 48em) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
        () => {
          const element = viewport.current!;
          element.classList.add('is-scroll-driven');
          const tween = gsap.to(element, {
            scrollLeft: () => element.scrollWidth - element.clientWidth,
            ease: 'none',
            onUpdate: paint,
            scrollTrigger: {
              trigger: '.services-stage',
              start: 'top 96px',
              end: () => `+=${element.scrollWidth - element.clientWidth}`,
              pin: true,
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          });
          scrollJourney.current = tween.scrollTrigger!;
          return () => {
            scrollJourney.current = null;
            element.classList.remove('is-scroll-driven');
          };
        },
      );
      // This first segment introduces the agent card on every motion-enabled
      // layout. On touch devices it is driven by the user's horizontal swipe;
      // desktop adds the pinned page-scroll controller above.
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        construction = gsap.timeline({
          repeat: -1,
          yoyo: true,
          repeatDelay: 0.15,
          scrollTrigger: {
            trigger: '.service-agents',
            start: 'top bottom',
            end: 'bottom top',
            toggleActions: 'play pause resume pause',
          },
        });
        construction.fromTo(
          path,
          { strokeDasharray: () => length, strokeDashoffset: () => length },
          {
            strokeDashoffset: () => length - outlineLength,
            duration: 3.6,
            ease: 'power2.inOut',
            autoRound: false,
          },
        );
      });
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const cards = Array.from(
          rail.current?.querySelectorAll<HTMLElement>(':scope > article') ?? [],
        );
        const revealObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.intersectionRatio >= 0.18) entry.target.classList.add('is-visible');
              else if (!entry.isIntersecting) entry.target.classList.remove('is-visible');
            });
            // Observe the page viewport as well as the carousel's clipping bounds,
            // so cards reveal when scrolling down to services, not while offscreen.
          },
          { rootMargin: '0px 0px -18% 0px', threshold: [0, 0.18] },
        );
        rail.current?.classList.add('services-fade-ready');
        cards.forEach((card) => revealObserver.observe(card));
        const tools = robots.flatMap((robot) =>
          Array.from(robot.querySelectorAll<SVGElement>('.builder-tool')),
        );
        gsap.to(tools, {
          rotation: -35,
          transformOrigin: 'bottom left',
          duration: 0.18,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
        });
        return () => {
          revealObserver.disconnect();
          rail.current?.classList.remove('services-fade-ready');
          cards.forEach((card) => card.classList.remove('is-visible'));
        };
      });
      return () => {
        observer.disconnect();
        reduced.removeEventListener('change', paint);
        paintJourney.current = () => {};
        mm.revert();
      };
    },
    { scope },
  );
}
