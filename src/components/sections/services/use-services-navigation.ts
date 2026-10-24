'use client';
import { useRef, useState, type RefObject } from 'react';
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
  const destination = useRef<number | null>(null);
  function groupPositions() {
    const element = viewport.current,
      cards = rail.current?.querySelectorAll<HTMLElement>(':scope > article');
    if (!element || !cards?.length) return [0, 0, 0];
    const first = cards[0].getBoundingClientRect().left;
    const max = Math.max(0, element.scrollWidth - element.clientWidth);
    return [0, 2, 4].map((index) =>
      Math.min(max, cards[index].getBoundingClientRect().left - first),
    );
  }
  function updatePagination() {
    const element = viewport.current;
    if (!element) return;
    const positions = groupPositions();
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
    const first = cards[0].getBoundingClientRect().left;
    const max = Math.max(0, windowElement.scrollWidth - windowElement.clientWidth);
    const inset = parseFloat(getComputedStyle(windowElement).scrollPaddingLeft) || 0;
    const geometry = Array.from(cards, (card) => {
      const bounds = card.getBoundingClientRect();
      return { left: bounds.left - first, right: bounds.right - first + inset };
    });
    // Advance past fully visible cards, keeping partially visible ones in the next page.
    const pages = [0];
    while (pages[pages.length - 1] < max - 2) {
      const currentPage = pages[pages.length - 1];
      const nextCard = geometry.find(
        (card) =>
          card.left > currentPage + 2 && card.right > currentPage + windowElement.clientWidth + 2,
      );
      const nextPage = Math.min(max, nextCard?.left ?? max);
      if (nextPage <= currentPage + 2) break;
      pages.push(nextPage);
    }
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
        top: trigger.start + (target / max) * (trigger.end - trigger.start),
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

  return { canGoBack, atEnd, activeGroup, destination, updatePagination, navigate };
}
