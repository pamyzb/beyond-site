import { readFile } from 'node:fs/promises';
import path from 'node:path';

function cardSurface(id: string, fragment: string, frame: [number, number, number, number]) {
  const face = fragment.match(/<rect x="([^"]+)" y="([^"]+)" width="([^"]+)" height="([^"]+)" rx="([^"]+)" transform="rotate\(([^ ]+) ([^ ]+) ([^ ]+)\)" fill="#1F2937" \/>/);
  if (!face) return { fragment, surface: '' };
  const [, x, y, width, , radius, angle, originX, originY] = face;
  const localX = Number(x) - frame[0];
  const localY = Number(y) - frame[1];
  const filterId = `process-${id}-surface-shadow`;
  const surface = `<svg class="process-card-surface" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><filter id="${filterId}" x="-100" y="-100" width="800" height="1000" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feMorphology radius="12" operator="erode" in="SourceAlpha" result="effect1_dropShadow"/><feOffset dy="22"/><feColorMatrix type="matrix" values="0 0 0 0 0.215686 0 0 0 0 0.254902 0 0 0 0 0.317647 0 0 0 1 0"/><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dy="34"/><feGaussianBlur stdDeviation="21"/><feColorMatrix type="matrix" values="0 0 0 0 0.098 0 0 0 0 0.122 0 0 0 0 0.188 0 0 0 0.13 0"/><feBlend mode="normal" in2="effect1_dropShadow" result="effect2_dropShadow"/><feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow" result="shape"/></filter></defs><rect x="${localX}" y="${localY}" width="${width}" rx="${radius}" transform="rotate(${angle} ${Number(originX) - frame[0]} ${Number(originY) - frame[1]})" fill="#1F2937" filter="url(#${filterId})" style="height:calc(100% - ${localY}px)"/></svg>`;
  return { fragment: fragment.replace(face[0], face[0].replace('fill="#1F2937"', 'fill="transparent"')), surface };
}

// Split repository-owned artwork without changing its original geometry.
export async function readProcessArtwork() {
  let source = await readFile(path.join(process.cwd(), 'public/assets/figma/processo.svg'), 'utf8');
  const defs = source.match(/<defs>[\s\S]*?<\/defs>/)![0];
  const cards: Record<string, string> = {};
  const mobileCards: Record<string, string> = {};
  const cardFrames: Record<string, [number, number, number, number]> = {
    // SVG fragments retain the original, document-level Y coordinates.
    Article_12: [164, 7759.59, 530, 395],
    Article_13: [758, 7889.59, 530, 380],
    Article_15: [135, 8169.59, 530, 355],
    Article_14: [798, 8284.59, 530, 355],
  };
  for (const id of ['Article_12', 'Article_13', 'Article_15', 'Article_14', 'Container_53']) {
    const start = source.indexOf(`<g id="${id}"`);
    const tags = /<g\b[^>]*>|<\/g>/g;
    tags.lastIndex = start;
    let depth = 0, end = start;
    for (let match = tags.exec(source); match; match = tags.exec(source)) {
      depth += match[0].startsWith('</') ? -1 : 1;
      if (!depth) { end = tags.lastIndex; break; }
    }
    const fragment = `${source.slice(start,end)}${defs}`.replace(/(id="|href="#|url\(#)([^"\)]+)/g, '$1process-'+id+'-$2');
    const frame = cardFrames[id];
    const surface = frame ? cardSurface(id, fragment, frame) : { fragment, surface: '' };
    cards[id] = `${surface.surface}<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 7449.59 1440 1148" fill="none">${surface.fragment}</svg>`;
    if (frame) mobileCards[id] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${frame.join(' ')}" fill="none" preserveAspectRatio="none">${fragment}</svg>`;
    source = source.slice(0,start) + source.slice(end);
  }
  return { track: source, cards, mobileCards, marker: cards.Container_53 };
}
