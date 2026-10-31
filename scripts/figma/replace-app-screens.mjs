import { DOMParser, XMLSerializer } from '@xmldom/xmldom';

/** Keep the mockup viewport and animation hooks while replacing only its artwork. */
export function replaceAppScreens(source, screens) {
  if (!source.includes('data-screen-source')) return source;
  const parser = new DOMParser();
  const doc = parser.parseFromString(source.replace(/^\uFEFF/, ''), 'image/svg+xml');
  for (const screen of Array.from(doc.getElementsByTagName('svg'))) {
    const previous = screen.getAttribute('data-screen-source');
    const name = {
      'Acomp2-2-Time-ao-vivo.svg': 'CORRETO2',
      'Lab-B1-Cartoes.svg': 'CORRETO1',
    }[previous];
    if (!name) continue;
    const artwork = parser.parseFromString(
      screens[name].replace(/(id="|href="#|url\(#)([^"\)]+)/g, `$1${name}-$2`),
      'image/svg+xml',
    );
    while (screen.firstChild) screen.removeChild(screen.firstChild);
    for (const child of Array.from(artwork.documentElement.childNodes)) {
      screen.appendChild(doc.importNode(child, true));
    }
    screen.setAttribute('data-screen-source', name);
  }
  return new XMLSerializer().serializeToString(doc);
}
