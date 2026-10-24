type GlassMap = {
  href: string;
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
};
const cache = new Map<string, GlassMap>();
// Low-frequency lens field: one cached map, rather than rebuilding an oversized texture.
export function createHeroGlassMap(width: number, height: number) {
  const key = `${Math.round(width)}:${Math.round(height)}`;
  const previous = cache.get(key);
  if (previous) return previous;
  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 384;
  const context = canvas.getContext('2d');
  if (!context) return null;
  const regionWidth = width * 2,
    regionHeight = height * 2;
  const x = -width / 2,
    y = -height / 2;
  // Use the channel range efficiently to avoid coarse displacement steps.
  const scale = Math.max(width, height) * 0.085;
  const pixels = context.createImageData(canvas.width, canvas.height);
  for (let row = 0; row < canvas.height; row++) {
    const cy = y + (row / (canvas.height - 1)) * regionHeight - height / 2;
    for (let col = 0; col < canvas.width; col++) {
      const cx = x + (col / (canvas.width - 1)) * regionWidth - width / 2;
      const nx = cx / (width / 2),
        ny = cy / (height / 2);
      // Only subtle curvature here; CSS scales the live content for a sharper zoom.
      const strength = 0.025 + 0.008 * Math.cos((nx * Math.PI) / 2) * Math.cos((ny * Math.PI) / 2);
      const dx = -cx * strength + width * 0.003 * Math.sin(ny * Math.PI);
      const dy = -cy * strength + height * 0.003 * Math.sin(nx * Math.PI);
      const i = (row * canvas.width + col) * 4;
      pixels.data[i] = Math.round(255 * (0.5 + dx / scale));
      pixels.data[i + 1] = Math.round(255 * (0.5 + dy / scale));
      pixels.data[i + 2] = 128;
      pixels.data[i + 3] = 255;
    }
  }
  context.putImageData(pixels, 0, 0);
  const result = {
    href: canvas.toDataURL(),
    x,
    y,
    width: regionWidth,
    height: regionHeight,
    scale,
  };
  if (cache.size >= 4) cache.delete(cache.keys().next().value!);
  cache.set(key, result);
  return result;
}
