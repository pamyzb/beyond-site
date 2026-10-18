import { readFile } from 'node:fs/promises';
import path from 'node:path';

// Split repository-owned artwork without changing its original geometry.
export async function readProcessArtwork() {
  let source = await readFile(path.join(process.cwd(), 'public/assets/figma/processo.svg'), 'utf8');
  const defs = source.match(/<defs>[\s\S]*?<\/defs>/)![0];
  const cards: Record<string, string> = {};
  for (const id of ['Article_12', 'Article_13', 'Article_15', 'Article_14', 'Container_53']) {
    const start = source.indexOf(`<g id="${id}"`);
    const tags = /<g\b[^>]*>|<\/g>/g;
    tags.lastIndex = start;
    let depth = 0, end = start;
    for (let match = tags.exec(source); match; match = tags.exec(source)) {
      depth += match[0].startsWith('</') ? -1 : 1;
      if (!depth) { end = tags.lastIndex; break; }
    }
    cards[id] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 7449.59 1440 1148" fill="none">${source.slice(start,end)}${defs}</svg>`.replace(/(id="|href="#|url\(#)([^"\)]+)/g, '$1process-'+id+'-$2');
    source = source.slice(0,start) + source.slice(end);
  }
  return { track: source, cards, marker: cards.Container_53 };
}
