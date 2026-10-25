'use client';
import { useEffect, type RefObject } from 'react';
export function useQrHover(root: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const host = root.current!;
    const card = host.querySelector<SVGGElement>('[data-artwork-role="qr-card"]');
    const background = card?.querySelector('rect');
    if (!card || !background) return;
    const fill = background.cloneNode() as SVGRectElement;
    fill.removeAttribute('id');
    fill.classList.add('qr-hover-fill');
    const ns = 'http://www.w3.org/2000/svg';
    const clip = document.createElementNS(ns, 'clipPath');
    clip.id = `${card.id}-hover-reveal`;
    clip.setAttribute('clipPathUnits', 'userSpaceOnUse');
    const circle = document.createElementNS(ns, 'circle');
    circle.classList.add('qr-hover-reveal');
    circle.setAttribute('r', '0');
    clip.appendChild(circle);
    card.prepend(clip);
    fill.setAttribute('clip-path', `url(#${clip.id})`);
    background.after(fill);
    card.classList.add('qr-hover-card');
    let active = false;
    const reset = () => {
      active = false;
      card.removeAttribute('data-hover');
      circle.style.r = '0px';
    };
    // The artwork is decorative and ignores pointer events; measure its card
    // from the document so hovering the separate HTML caption also works.
    const move = (event: PointerEvent) => {
      const box = background.getBoundingClientRect();
      const inside =
        event.pointerType === 'mouse' &&
        box.width > 0 &&
        event.clientX >= box.left &&
        event.clientX <= box.right &&
        event.clientY >= box.top &&
        event.clientY <= box.bottom;
      if (inside === active) return;
      if (!inside) {
        reset();
        return;
      }
      const matrix = background.getScreenCTM();
      if (!matrix) return;
      const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
      const bounds = background.getBBox();
      const radius =
        Math.hypot(
          Math.max(point.x - bounds.x, bounds.x + bounds.width - point.x),
          Math.max(point.y - bounds.y, bounds.y + bounds.height - point.y),
        ) + 2;
      circle.setAttribute('cx', String(point.x));
      circle.setAttribute('cy', String(point.y));
      circle.style.r = `${radius}px`;
      active = true;
      card.setAttribute('data-hover', 'true');
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerleave', reset);
    window.addEventListener('scroll', reset, { passive: true });
    return () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', reset);
      window.removeEventListener('scroll', reset);
      fill.remove();
      clip.remove();
      card.classList.remove('qr-hover-card');
      reset();
    };
  }, []);
}
