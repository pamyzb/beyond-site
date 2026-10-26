'use client';
import type { RefObject } from 'react';
import { servicesRoute, type CardBounds } from '@/lib/animation/services-geometry';
import { useServicesReveal } from './use-services-reveal';
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
  useServicesReveal({ scope, rail });
  useGSAP(
    () => {
      const track = rail.current!;
      const element = viewport.current!;
      const path = track.querySelector<SVGPathElement>('.services-route path')!;
      const svg = path.ownerSVGElement!;
      const robots = Array.from(track.querySelectorAll<HTMLElement>(':scope > .builder'));
      const reduced = matchMedia('(prefers-reduced-motion: reduce)');
      const compactMedia = matchMedia('(max-width: 59.999em), (hover: none), (pointer: coarse)');
      let length = 0;
      let outlineLength = 0;
      let construction: gsap.core.Timeline | undefined;
      let traveling = false;
      let cardBounds: CardBounds[] = [];
      let activeCard = -1;
      let settleTimer: ReturnType<typeof setTimeout> | undefined;
      let compactTween: gsap.core.Tween | undefined;
      const showCompactCard = () => {
        if (!compactMedia.matches || !cardBounds.length) return;
        const viewportBounds = element.getBoundingClientRect();
        if (viewportBounds.top >= window.innerHeight || viewportBounds.bottom <= 0) return;
        const center = element.scrollLeft + element.clientWidth / 2;
        const index = cardBounds.reduce(
          (best, card, i) =>
            Math.abs((card.left + card.right) / 2 - center) <
            Math.abs((cardBounds[best].left + cardBounds[best].right) / 2 - center)
              ? i
              : best,
          0,
        );
        if (index === activeCard) return;
        activeCard = index;
        compactTween?.kill();
        const { left: l, right: r, top: t, bottom: b } = cardBounds[index];
        const radius = 28;
        path.setAttribute(
          'd',
          `M ${l + radius} ${t} H ${r - radius} Q ${r} ${t} ${r} ${t + radius} V ${b - radius} Q ${r} ${b} ${r - radius} ${b} H ${l + radius} Q ${l} ${b} ${l} ${b - radius} V ${t + radius} Q ${l} ${t} ${l + radius} ${t} Z`,
        );
        const perimeter = path.getTotalLength();
        gsap.set(path, {
          opacity: 1,
          strokeDasharray: perimeter,
          strokeDashoffset: reduced.matches ? 0 : perimeter,
        });
        robots.forEach((robot, i) =>
          gsap.set(robot, {
            left: 0,
            top: 0,
            x: r - 100 + i * 56,
            y: t - 28,
            xPercent: -50,
            yPercent: -50,
            scale: 0.8,
            opacity: 1,
          }),
        );
        if (!reduced.matches) {
          compactTween = gsap.to(path, {
            strokeDashoffset: 0,
            duration: 1.4,
            ease: 'power2.inOut',
          });
        }
      };
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
            const agent = cardBounds[0];
            x = agent.right - 100 + index * 56;
            y = agent.top - 28;
          }
          gsap.set(robot, {
            left: 0,
            top: 0,
            x,
            y,
            xPercent: -50,
            yPercent: -50,
            scale: compactMedia.matches ? 0.8 : 1,
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
        if (compactMedia.matches && cardBounds.length) {
          // Keep navigation anchored while cards of different heights slide past.
          const bottom = Math.max(...cardBounds.map((card) => card.bottom));
          const padding = parseFloat(getComputedStyle(track).paddingBottom) || 0;
          element.style.height = `${Math.ceil(bottom + padding)}px`;
          clearTimeout(settleTimer);
          gsap.set([path, ...robots], { opacity: 0 });
          activeCard = -1;
          settleTimer = setTimeout(showCompactCard, 140);
          return;
        } else element.style.removeProperty('height');
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
        const head =
          progress < joinProgress
            ? robotStartDistances[0] +
              (robotStartDistances[1] - robotStartDistances[0]) * (progress / joinProgress)
            : robotStartDistances[1] +
              (length - robotStartDistances[1]) * ((progress - joinProgress) / (1 - joinProgress));
        path.style.strokeDasharray = String(length);
        const dashOffset = reduced.matches ? 0 : length - Math.max(outlineLength, head);
        path.style.strokeDashoffset = String(dashOffset);
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
        const { d, outlineLength: outline, left, right, top } = servicesRoute(cardBounds);
        outlineLength = outline;
        svg.setAttribute('width', String(track.scrollWidth));
        svg.setAttribute('height', String(track.offsetHeight));
        if (compactMedia.matches) {
          svg.style.removeProperty('clip-path');
          activeCard = -1;
          paint();
          updatePagination();
          return;
        }
        clearTimeout(settleTimer);
        compactTween?.kill();
        gsap.killTweensOf(journey);
        gsap.set([path, ...robots], { opacity: 1 });
        if (compactMedia.matches) {
          const card = cardBounds[0];
          svg.style.clipPath = `inset(${Math.max(0, card.top - 3)}px ${Math.max(0, track.scrollWidth - card.right - 3)}px ${Math.max(0, track.offsetHeight - card.bottom - 3)}px ${Math.max(0, card.left - 3)}px)`;
        } else svg.style.removeProperty('clip-path');
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
      const visibilityObserver = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) showCompactCard();
      });
      visibilityObserver.observe(element);
      let measureFrame = 0;
      const observer = new ResizeObserver(() => {
        cancelAnimationFrame(measureFrame);
        measureFrame = requestAnimationFrame(measure);
      });
      observer.observe(track);
      observer.observe(element);
      track.querySelectorAll(':scope > article').forEach((card) => observer.observe(card));
      reduced.addEventListener('change', paint);
      compactMedia.addEventListener('change', measure);
      const mm = gsap.matchMedia();
      // The scroll-pinned journey needs enough horizontal and vertical room to
      // read the cards. Compact pointer layouts can use the same journey;
      // touch devices and short viewports retain native scrolling.
      mm.add(
        '(min-width: 60em) and (min-height: 48em) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
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
      mm.add(
        '(min-width: 60em) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
        () => {
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
        },
      );
      return () => {
        clearTimeout(settleTimer);
        compactTween?.kill();
        cancelAnimationFrame(measureFrame);
        observer.disconnect();
        visibilityObserver.disconnect();
        reduced.removeEventListener('change', paint);
        compactMedia.removeEventListener('change', measure);
        element.style.removeProperty('height');
        svg.style.removeProperty('clip-path');
        paintJourney.current = () => {};
        mm.revert();
      };
    },
    { scope },
  );
}
