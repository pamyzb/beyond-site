import { DOMParser, XMLSerializer } from '@xmldom/xmldom';

/** SVG 1.1-compatible placement: Safari does not reliably transform nested svg viewports. */
export function normalizePhoneScreens(source) {
  if (!source.includes('data-screen-source')) return source;
  const doc = new DOMParser().parseFromString(source.replace(/^\uFEFF/, ''), 'image/svg+xml');
  for (const screen of Array.from(doc.getElementsByTagName('svg'))) {
    if (!screen.hasAttribute('data-screen-source') || !screen.hasAttribute('transform')) continue;
    const group = doc.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('transform', screen.getAttribute('transform'));
    screen.removeAttribute('transform');
    screen.parentNode.insertBefore(group, screen);
    group.appendChild(screen);
  }
  return new XMLSerializer().serializeToString(doc);
}
