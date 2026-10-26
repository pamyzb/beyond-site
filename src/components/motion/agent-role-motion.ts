import { gsap, ScrollTrigger } from '@/lib/animation/gsap';

/** Only the level crossing the reading zone owns the green outline. */
export function animateAgentRoles(diagram: HTMLElement) {
  const media = gsap.matchMedia();
  media.add(
    {
      motion: '(prefers-reduced-motion: no-preference)',
      reduced: '(prefers-reduced-motion: reduce)',
    },
    (context) => {
      const cards = Array.from(diagram.querySelectorAll<HTMLElement>('.agent-role'));
      const outlines = cards.map((card) =>
        card.querySelector<SVGRectElement>('.agent-role-outline rect')!,
      );
      let active = -1;
      let drawing: gsap.core.Tween | undefined;
      const select = (index: number) => {
        if (index === active) return;
        drawing?.kill();
        active = index;
        gsap.set(outlines, { opacity: 0, strokeDashoffset: 1000 });
        cards.forEach((card, i) => card.toggleAttribute('data-active', i === index));
        if (index < 0) return;
        gsap.set(outlines[index], { opacity: 1 });
        if (context.conditions?.reduced) {
          gsap.set(outlines[index], { strokeDashoffset: 0 });
        } else {
          drawing = gsap.to(outlines[index], {
            strokeDashoffset: 0,
            duration: 1.2,
            ease: 'power2.inOut',
          });
        }
      };
      const sync = () => {
        const readingLine = window.innerHeight * 0.65;
        let index = -1;
        cards.forEach((card, i) => {
          if (card.getBoundingClientRect().top <= readingLine) index = i;
        });
        if (diagram.getBoundingClientRect().bottom < window.innerHeight * 0.35) index = -1;
        select(index);
      };
      gsap.set(outlines, { opacity: 0, strokeDashoffset: 1000 });
      const trigger = ScrollTrigger.create({
        trigger: diagram,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: sync,
        onRefresh: sync,
      });
      sync();
      return () => {
        drawing?.kill();
        trigger.kill();
        cards.forEach((card) => card.removeAttribute('data-active'));
      };
    },
  );
  return () => media.revert();
}
