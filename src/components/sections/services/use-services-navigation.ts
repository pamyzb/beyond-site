'use client';
import { useRef, useState, type PointerEvent, type RefObject } from 'react';
import type { ScrollTrigger } from '@/lib/animation/gsap';
type Options = {
  viewport: RefObject<HTMLDivElement | null>;
  rail: RefObject<HTMLDivElement | null>;
  scrollJourney: RefObject<ScrollTrigger | null>;
};
export function useServicesNavigation({ viewport, rail, scrollJourney }: Options) {
  const [canGoBack, setCanGoBack] = useState(false);
  const [atEnd, setAtEnd] = useState(false);
  const [activeGroup, setActiveGroup] = useState(0);
  const [groupCount, setGroupCount] = useState(1);
  const destination = useRef<number | null>(null);
  const drag = useRef<{ pointerId: number; x: number; left: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  function startDrag(event: PointerEvent<HTMLDivElement>) {
    destination.current = null;
    suppressClick.current = false;
    if (
      event.pointerType !== 'mouse' ||
      event.button !== 0 ||
      !window.matchMedia('(hover: none), (pointer: coarse)').matches
    )
      return;
    drag.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      left: event.currentTarget.scrollLeft,
      moved: false,
    };
  }
  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const distance = event.clientX - current.x;
    if (!current.moved && Math.abs(distance) < 6) return;
    if (!current.moved) {
      current.moved = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.classList.add('is-dragging');
    }
    event.preventDefault();
    event.currentTarget.scrollLeft = current.left - distance;
  }
  function endDrag(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    suppressClick.current = current.moved;
    drag.current = null;
    event.currentTarget.classList.remove('is-dragging');
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  }
  function groupPositions() {
    const element = viewport.current,
      cards = rail.current?.querySelectorAll<HTMLElement>(':scope > article');
    if (!element || !cards?.length) return [0];
    const first = cards[0].getBoundingClientRect().left;
    const max = Math.max(0, element.scrollWidth - element.clientWidth);
    const inset = parseFloat(getComputedStyle(element).scrollPaddingLeft) || 0;
    const geometry = Array.from(cards, (card) => {
      const bounds = card.getBoundingClientRect();
      return { left: bounds.left - first, right: bounds.right - first + inset };
    });
    const pages = [0];
    while (pages[pages.length - 1] < max - 2) {
      const current = pages[pages.length - 1];
      const next = geometry.find(
        (card) => card.left > current + 2 && card.right > current + element.clientWidth + 2,
      );
      const position = Math.min(max, next?.left ?? max);
      if (position <= current + 2) break;
      pages.push(position);
    }
    return pages;
  }

  function updatePagination() {
    const element = viewport.current;
    if (!element) return;
    const positions = groupPositions();
    setGroupCount(positions.length);
    setActiveGroup(
      positions.reduce(
        (nearest, position, index) =>
          Math.abs(position - element.scrollLeft) <
          Math.abs(positions[nearest] - element.scrollLeft)
            ? index
            : nearest,
        0,
      ),
    );
    setCanGoBack(element.scrollLeft > 2);
    setAtEnd(element.scrollLeft >= element.scrollWidth - element.clientWidth - 2);
  }
  function navigate(direction: number | 'first' | 'last' | { group: number }) {
    const windowElement = viewport.current;
    const cards = rail.current?.querySelectorAll<HTMLElement>(':scope > article');
    if (!windowElement || !cards?.length) return;
    const max = Math.max(0, windowElement.scrollWidth - windowElement.clientWidth);
    const pages = groupPositions();
    const current = destination.current ?? windowElement.scrollLeft;
    const page = pages.reduce(
      (nearest, position, index) =>
        Math.abs(position - current) < Math.abs(pages[nearest] - current) ? index : nearest,
      0,
    );
    const target =
      typeof direction === 'object'
        ? groupPositions()[direction.group]
        : direction === 'first'
          ? 0
          : direction === 'last'
            ? max
            : pages[Math.max(0, Math.min(pages.length - 1, page + direction))];
    destination.current = target;
    if (scrollJourney.current) {
      const trigger = scrollJourney.current;
      window.scrollTo({
        top: trigger.start + (max ? target / max : 0) * (trigger.end - trigger.start),
        behavior: 'smooth',
      });
      return;
    }
    windowElement.scrollTo({
      left: target,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
    });
  }

  return {
    canGoBack,
    atEnd,
    activeGroup,
    groupCount,
    destination,
    updatePagination,
    navigate,
    startDrag,
    moveDrag,
    endDrag,
    suppressClick,
  };
}
