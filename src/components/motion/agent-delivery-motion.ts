import { gsap, ScrollTrigger } from '@/lib/animation/gsap';

export function animateAgentDelivery(root: HTMLElement) {
  const svg = root.querySelector<SVGSVGElement>('svg')!;
  const paths = svg.querySelectorAll('path');
  const builder = root.querySelector<HTMLElement>('.agent-delivery-builder')!;
  const position = { progress: 0 };
  const place = () => {
    const point = paths[0].getPointAtLength(paths[0].getTotalLength() * position.progress);
    gsap.set(builder, { x: point.x, y: point.y, xPercent: -50, yPercent: -50 });
  };
  const numbers = Array.from(root.querySelectorAll<HTMLElement>('.agent-delivery-number'));
  const measure = () => {
    const bounds = root.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
    const points = numbers.map((node) => {
      const r = node.getBoundingClientRect();
      return { x: r.left - bounds.left + r.width / 2, y: r.top - bounds.top + r.height / 2 };
    });
    let d = `M ${points[0].x} ${points[0].y}`;
    points.slice(1).forEach((p, i) => {
      const a = points[i];
      const middle = (a.y + p.y) / 2;
      d += ` C ${a.x} ${middle}, ${p.x} ${middle}, ${p.x} ${p.y}`;
    });
    paths.forEach((path) => path.setAttribute('d', d));
    place();
  };
  measure();
  const observer = new ResizeObserver(measure);
  observer.observe(root);
  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.fromTo(
      position,
      { progress: 0 },
      {
        progress: 1,
        onUpdate: place,
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          start: 'top 65%',
          end: 'bottom 65%',
          scrub: 0.5,
          onRefresh: measure,
        },
      },
    );
  });
  ScrollTrigger.addEventListener('refresh', measure);
  return () => {
    observer.disconnect();
    media.revert();
    ScrollTrigger.removeEventListener('refresh', measure);
  };
}
