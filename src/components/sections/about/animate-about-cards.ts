import { gsap } from '@/lib/animation/gsap';

export function animateAboutCards(root: HTMLElement) {
  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion:no-preference)', () => {
    const cleanups: (() => void)[] = [];
    root.querySelectorAll<HTMLElement>('.about-panel-card').forEach((card) => {
      const strokes = Array.from(card.querySelectorAll<SVGGeometryElement>('.lucide > *')).filter(
        (stroke) => typeof stroke.getTotalLength === 'function',
      );
      if (!strokes.length) return;
      const drawing = gsap.fromTo(
        strokes,
        {
          strokeDasharray: (_, stroke: SVGGeometryElement) => stroke.getTotalLength(),
          strokeDashoffset: (_, stroke: SVGGeometryElement) => stroke.getTotalLength(),
        },
        {
          strokeDashoffset: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power2.inOut',
          scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none none' },
        },
      );
      const replay = () => {
        if (!drawing.isActive()) drawing.restart();
      };
      card.addEventListener('pointerenter', replay);
      cleanups.push(() => card.removeEventListener('pointerenter', replay));
    });
    const bodies = root.querySelectorAll('.about-card-body');
    bodies.forEach((body, index) =>
      gsap.fromTo(
        body,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          delay: index * 0.14,
          scrollTrigger: {
            trigger: body,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        },
      ),
    );
    return () => cleanups.forEach((cleanup) => cleanup());
  });
  media.add('(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)', () => {
    const cleanups = Array.from(root.querySelectorAll('.about-panel-card')).map((card, index) => {
      const glyph = card.querySelector('[data-artwork-role="about-glyph"], .lucide');
      if (!glyph) return () => {};
      const motion = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } });
      if (index === 0) {
        motion
          .to(glyph, {
            x: -3,
            y: 1,
            rotation: -8,
            transformOrigin: '50% 50%',
            duration: 0.22,
          })
          .to(glyph, { x: 3, y: -1, rotation: 6, duration: 0.32 })
          .to(glyph, { x: 0, y: 0, rotation: 0, duration: 0.26 });
      } else if (index === 1 && !glyph.classList.contains('lucide')) {
        const blocks = glyph.querySelectorAll('rect');
        motion.fromTo(
          blocks,
          { x: (i) => (i === 3 ? 4 : -2), y: (i) => (i === 3 ? -5 : 3), opacity: 0.3 },
          { x: 0, y: 0, opacity: 1, stagger: 0.11, duration: 0.36, immediateRender: false },
        );
      } else {
        motion
          .to(glyph, { x: -1.5, y: 1.5, duration: 0.15 })
          .to(glyph, { x: 4, y: -4, duration: 0.25, ease: 'power2.out' })
          .to(glyph, { x: 0, y: 0, duration: 0.4 });
      }
      const enter = () => {
        if (!motion.isActive()) motion.restart();
      };
      card.addEventListener('pointerenter', enter);
      return () => card.removeEventListener('pointerenter', enter);
    });
    return () => cleanups.forEach((cleanup) => cleanup());
  });
  return () => media.revert();
}
