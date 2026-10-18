import { gsap } from '@/lib/gsap';

/** A scroll-scrubbed brush mask over the entire band, including its background. */
export function createImpactPaint(section: HTMLElement) {
  const band = section.closest<HTMLElement>('.section-band');
  if (!band || !CSS.supports('mask-image', 'url("data:image/png;base64,")')) return () => {};

  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 360;
  const context = canvas.getContext('2d');
  if (!context) return () => {};

  const rows = 12;
  const samples = 96;
  const paths = Array.from({ length: rows }, (_, row) =>
    Array.from({ length: samples + 1 }, (_, point) => {
      const fraction = point / samples;
      // Broad diagonal gestures with a gentle bow, like a flexible brush.
      // Alternate direction while keeping adjacent strokes overlapping.
      const travel = row % 2 ? 1 - fraction : fraction;
      const y = -60 + travel * 480;
      const x = -300 + row * 90 + (360 - y) * .65
        + Math.sin(travel * Math.PI) * 24
        + Math.sin(travel * Math.PI * 2 + row * .4) * 4;
      return { x, y };
    }),
  );
  const playhead = { progress: 0 };
  let lastFrame = -1;
  const paint = () => {
    const frame = Math.round(playhead.progress * 240);
    if (frame === lastFrame) return;
    lastFrame = frame;
    if (frame >= 240) {
      band.style.removeProperty('mask-image');
      band.style.removeProperty('-webkit-mask-image');
      return;
    }
    context.resetTransform();
    context.clearRect(0, 0, 600, 360);
    context.strokeStyle = '#fff';
    context.lineCap = 'round';
    context.lineJoin = 'round';
    const progress = frame / 240 * (rows + .35);
    paths.forEach((path, row) => {
      const fraction = Math.min(1, Math.max(0, (progress - row) / 1.35));
      if (!fraction) return;
      const end = fraction * samples;
      context.lineWidth = 112 + Math.sin(row * .7) * 6;
      context.beginPath();
      context.moveTo(path[0].x, path[0].y);
      for (let point = 1; point <= Math.floor(end); point++) {
        context.lineTo(path[point].x, path[point].y);
      }
      const index = Math.floor(end);
      if (index < samples) {
        const part = end - index;
        context.lineTo(path[index].x + (path[index + 1].x - path[index].x) * part,
          path[index].y + (path[index + 1].y - path[index].y) * part);
      }
      context.stroke();
      // Fine bristle trails leave a scribbled edge on the newest pass.
      if (fraction < 1) {
        context.lineWidth = 1.5;
        for (const offset of [-70, 70, 75]) {
          context.beginPath();
          context.moveTo(path[0].x + offset, path[0].y);
          for (let point = 1; point <= Math.floor(end); point++) {
            context.lineTo(path[point].x + offset, path[point].y);
          }
          context.stroke();
        }
      }
    });
    const mask = `url("${canvas.toDataURL()}")`;
    band.style.maskImage = mask;
    band.style.setProperty('-webkit-mask-image', mask);
  };

  band.classList.add('impact-painted-band');
  const tween = gsap.to(playhead, {
    progress: 1, ease: 'none', onUpdate: paint,
    scrollTrigger: {
      id: 'hero-impact-paint', trigger: section,
      start: 'top 95%', end: 'top 104px', scrub: .65,
      invalidateOnRefresh: true,
    },
  });
  paint();
  // A keyboard user can always see the focused client button.
  const revealFocus = () => { playhead.progress = 1; paint(); };
  band.addEventListener('focusin', revealFocus);
  return () => {
    tween.scrollTrigger?.kill();
    tween.kill();
    band.removeEventListener('focusin', revealFocus);
    band.classList.remove('impact-painted-band');
    band.style.removeProperty('mask-image');
    band.style.removeProperty('-webkit-mask-image');
  };
}
