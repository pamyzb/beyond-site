// Keep the desktop canvas and animation anchors, sharing the responsive photo files.
const photos = [
  ['Container_21', 'top-left', -37, 4041.38, 316, 195],
  ['Container_23', 'top-right', 1169, 4065.38, 171, 171],
  ['Container_24', 'bottom-left', 147, 4476.38, 190, 268],
  // Keep the full photo inside the 1440px canvas, including 30px of parallax.
  ['Container_22', 'bottom-right', 1063, 4486.38, 345, 213],
];

export function replaceConversationPhotos(source) {
  for (const [id, corner, x, y, width, height] of photos) {
    const pattern = new RegExp(`(<g\\b[^>]*\\bid="${id}"[^>]*>)[\\s\\S]*?</g>`);
    if (!pattern.test(source)) throw new Error(`Missing conversation photo: ${id}`);
    source = source.replace(
      pattern,
      `$1<image href="/assets/conversa/conversation-photo-${corner}.svg" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet"/></g>`,
    );
  }
  return source;
}
