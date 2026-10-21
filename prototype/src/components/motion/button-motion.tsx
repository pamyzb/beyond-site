"use client";
import { useEffect } from 'react';

/** One delegated listener keeps the fill origin at the pointer's entry point. */
export function ButtonMotion() {
  useEffect(() => {
    const selector = '.button-link, .button, .menu-toggle, .qr-instructions';
    const enter = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !(event.target instanceof Element)) return;
      const button = event.target.closest<HTMLElement>(selector);
      if (!button || (event.relatedTarget instanceof Node && button.contains(event.relatedTarget))) return;
      const rect = button.getBoundingClientRect();
      // The QR callout uses ::after for a decorative line, while its hover
      // fill is a real child. Measure the card itself so the reveal starts at
      // the pointer rather than getting constrained to that small line.
      const isQrCallout = button.matches('.qr-instructions');
      const surface = isQrCallout ? null : getComputedStyle(button, '::after');
      const left = surface ? parseFloat(surface.left) || 0 : 0;
      const top = surface ? parseFloat(surface.top) || 0 : 0;
      const width = surface ? parseFloat(surface.width) || rect.width : rect.width;
      const height = surface ? parseFloat(surface.height) || rect.height : rect.height;
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
