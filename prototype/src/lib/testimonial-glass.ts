// Apply the cylinder's sampling displacement to the real HTML cards. Keeping
// the DOM as the source preserves typography, responsive layout and video controls.
export function createCylinderMap(width: number, height: number, viewportWidth: number) {
  const regionWidth = Math.min(viewportWidth, width * 3) + 160;
  const x = (width - regionWidth) / 2;
  const y = -height / 2;
  const scale = Math.max(regionWidth * .10, height * .65);
  const canvas = document.createElement('canvas');
  canvas.width = 1536;
  canvas.height = 768;
  const context = canvas.getContext('2d');
  if (!context) return null;
  const pixels = context.createImageData(canvas.width, canvas.height);
  for (let row = 0; row < canvas.height; row++) {
    const cy = y + row / (canvas.height - 1) * height * 2 - height / 2;
    for (let col = 0; col < canvas.width; col++) {
      const cx = (x + col / (canvas.width - 1) * regionWidth - width / 2) / viewportWidth;
      // Leave the reading area flat; concentrate refraction on the previews.
      const t = Math.max(0, Math.min(1, (Math.abs(cx) - .34) / .16));
      const smooth = t * t * (3 - 2 * t);
      const edge = smooth * smooth;
      const dx = -cx * viewportWidth * .03 * edge;
      const dy = -cy * (1 - 1 / (1 + .45 * edge));
      const i = (row * canvas.width + col) * 4;
      pixels.data[i] = Math.round(255 * (.5 + dx / scale));
      pixels.data[i + 1] = Math.round(255 * (.5 + dy / scale));
      pixels.data[i + 2] = 128;
      pixels.data[i + 3] = 255;
    }
  }
  context.putImageData(pixels, 0, 0);
  return { href: canvas.toDataURL(), x, y, width: regionWidth, height: height * 2, scale };
}
