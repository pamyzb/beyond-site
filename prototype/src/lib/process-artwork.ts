import { readFile } from 'node:fs/promises';
import path from 'node:path';

// Split repository-owned artwork without changing its original geometry.
export async function readProcessArtwork() {
  let source = await readFile(path.join(process.cwd(), 'public/assets/figma/processo.svg'), 'utf8');
  const defs = source.match(/<defs>[\s\S]*?<\/defs>/)![0];
  const cards: Record<string, string> = {};
  const mobileCards: Record<string, string> = {};
  const cardFrames: Record<string, [number, number, number, number]> = {
    Article_12: [164, 310, 530, 395],
    Article_13: [758, 440, 530, 380],
    Article_15: [135, 720, 530, 355],
    Article_14: [798, 835, 530, 355],
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
    cards[id] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 7449.59 1440 1148" fill="none">${fragment}</svg>`;
    const frame = cardFrames[id];
    if (frame) mobileCards[id] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${frame.join(' ')}" fill="none" preserveAspectRatio="none">${fragment}</svg>`;
    source = source.slice(0,start) + source.slice(end);
  }
  return { track: source, cards, mobileCards, marker: cards.Container_53 };
}
