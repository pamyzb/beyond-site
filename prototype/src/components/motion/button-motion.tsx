"use client";
import { useEffect } from 'react';

/** One delegated listener keeps the fill origin at the pointer's entry point. */
export function ButtonMotion() {
  useEffect(() => {
    const selector = '.button-link, .button, .menu-toggle';
    const enter = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !(event.target instanceof Element)) return;
      const button = event.target.closest<HTMLElement>(selector);
      if (!button || (event.relatedTarget instanceof Node && button.contains(event.relatedTarget))) return;
      const rect = button.getBoundingClientRect();
      const surface = getComputedStyle(button, '::after');
      const left = parseFloat(surface.left) || 0;
      const top = parseFloat(surface.top) || 0;
      const width = parseFloat(surface.width) || rect.width;
      const height = parseFloat(surface.height) || rect.height;
      const x = Math.max(0, Math.min(width, event.clientX - rect.left - left));
      const y = Math.max(0, Math.min(height, event.clientY - rect.top - top));
      button.style.setProperty('--fill-x', `${x}px`);
      button.style.setProperty('--fill-y', `${y}px`);
      button.style.setProperty('--fill-radius', `${Math.hypot(Math.max(x, width-x), Math.max(y, height-y)) + 2}px`);
    };
    document.addEventListener('pointerover', enter);
    return () => document.removeEventListener('pointerover', enter);
  }, []);
  return null;
}
