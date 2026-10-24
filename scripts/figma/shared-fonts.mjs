import { createHash } from 'node:crypto';

const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const descriptor = (rule, name) =>
  rule.match(new RegExp(`(?:\\{|;)\\s*${name}\\s*:\\s*([^;}]+)`, 'i'))?.[1].trim();

/** Inline SVG inherits document fonts. Remove only byte-identical, matching faces. */
export function stripSharedSvgFonts(svg, fonts) {
  const shared = new Map(fonts.map((font) => [hash(font.bytes), font]));
  let removedFonts = 0;
  let removedBytes = 0;
  const result = svg.replace(/<style\b([^>]*)>([\s\S]*?)<\/style>/g, (_, attributes, css) => {
    const remaining = css.replace(/@font-face\s*\{[^{}]*\}/g, (rule) => {
      const encoded = rule.match(/data:font\/ttf;base64,([A-Za-z0-9+/=]+)/)?.[1];
      if (!encoded || descriptor(rule, 'unicode-range')) return rule;
      const font = shared.get(hash(Buffer.from(encoded, 'base64')));
      if (!font) return rule;
      const family = descriptor(rule, 'font-family')?.replace(/^['"]|['"]$/g, '');
      if (
        family !== font.family ||
        descriptor(rule, 'font-weight') !== font.weight ||
        (descriptor(rule, 'font-style') ?? 'normal') !== font.style
      )
        return rule;
      removedFonts++;
      removedBytes += Buffer.byteLength(rule);
      return '';
    });
    return remaining.trim() ? `<style${attributes}>${remaining}</style>` : '';
  });
  return { svg: result, removedFonts, removedBytes };
}
