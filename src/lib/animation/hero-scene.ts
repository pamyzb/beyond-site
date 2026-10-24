/** Copy only editorial content, without recursively copying effect layers. */
export function cloneHeroScene(hero: HTMLElement, ink = false) {
  const copy = hero.cloneNode(false) as HTMLElement;
  copy.removeAttribute('id');
  copy.setAttribute('aria-hidden', 'true');
  copy.inert = true;
  if (ink) copy.dataset.ink = 'true';
  else {
    copy.removeAttribute('data-ink');
    const backdrop = hero.querySelector(':scope > .figma-art');
    if (backdrop) copy.append(backdrop.cloneNode(true));
  }
  const content = hero.querySelector(':scope > .section-content');
  if (content) copy.append(content.cloneNode(true));
  copy.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
  const video = hero.querySelector<HTMLVideoElement>('.hero-video-word video');
  const duplicate = copy.querySelector('video');
  let canvas: HTMLCanvasElement | null = null;
  if (duplicate) {
    if (ink) {
      duplicate.removeAttribute('src');
      duplicate.preload = 'none';
    } else {
      canvas = document.createElement('canvas');
      duplicate.replaceWith(canvas);
    }
  }
  return { copy, video, canvas, inkVideo: ink ? duplicate : null };
}
