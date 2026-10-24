import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { pruneSvgDefs } from './prune-svg-defs.mjs';

export const PROCESS_IDS = ['Article_12', 'Article_13', 'Article_15', 'Article_14', 'Container_53'];

/** Each independent card keeps only the definitions its own artwork references. */
export function processFragments(source) {
  const doc = new DOMParser().parseFromString(source, 'image/svg+xml');
  const serializer = new XMLSerializer();
  const definitions = doc.getElementsByTagName('defs')[0];
  if (!definitions) throw new Error('Missing process artwork definitions');
  const groups = Array.from(doc.getElementsByTagName('g'));
  return Object.fromEntries(
    PROCESS_IDS.map((id) => {
      const group = groups.find((group) => group.getAttribute('id') === id);
      if (!group) throw new Error(`Missing process artwork ${id}`);
      const packed = pruneSvgDefs(
        `<svg xmlns="http://www.w3.org/2000/svg">${serializer.serializeToString(group)}${serializer.serializeToString(definitions)}</svg>`,
      ).svg;
      return [id, packed.replace(/^<svg\b[^>]*>/, '').replace(/<\/svg>$/, '')];
    }),
  );
}
