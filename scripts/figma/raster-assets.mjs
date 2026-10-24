import { createHash } from 'node:crypto';

/** Preserve raster bytes; only the SVG image URL changes. External SVGs used
 * through <img> stay self-contained because browsers block their subresources. */
export function extractRasterAssets(svg) {
  const assets = new Map();
  const result = svg.replace(
    /data:image\/(png|jpe?g|webp|avif|gif);base64,([A-Za-z0-9+/=\r\n]+)/g,
    (_match, type, base64) => {
      const bytes = Buffer.from(base64.replace(/\s/g, ''), 'base64');
      const extension = type === 'jpeg' ? 'jpg' : type;
      const digest = createHash('sha256').update(bytes).digest('hex');
      const filename = `${digest}.${extension}`;
      assets.set(filename, bytes);
      return `/assets/generated/${filename}`;
    },
  );
  return { svg: result, assets };
}
