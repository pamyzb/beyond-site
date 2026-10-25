// Only decorative previews are rasterized. The live card, focus targets and
// video player remain HTML; measurements come from that actual layout.
export async function paintTestimonialTexture(surface: HTMLElement, dpr: number) {
  await document.fonts.ready;
  const images = [...surface.querySelectorAll('img')];
  await Promise.all(images.map((image) => image.decode()));
  const artwork = new Image();
  artwork.src = '/assets/figma/testimonial-card-art.svg?v=rounded-2';
  await artwork.decode();
  const width = surface.clientWidth;
  const height = surface.clientHeight;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);
  const root = surface.getBoundingClientRect();
  const scale = root.width / width;
  const rect = (element: Element) => {
    const box = element.getBoundingClientRect();
    return {
      x: (box.left - root.left) / scale,
      y: (box.top - root.top) / scale,
      width: box.width / scale,
      height: box.height / scale,
    };
  };
  ctx.beginPath();
  ctx.roundRect(0, 0, width, height, parseFloat(getComputedStyle(surface).borderTopLeftRadius));
  ctx.clip();
  const video = surface.classList.contains('testimonial-video');
  if (!video) {
    // Match the CSS material's angle, alpha and ellipse, instead of painting
    // an opaque approximation that changes color as a card crosses the seam.
    const background = document.createElement('canvas');
    background.width = canvas.width;
    background.height = canvas.height;
    const material = background.getContext('2d')!;
    material.scale(dpr, dpr);
    const angle = (145 * Math.PI) / 180;
    const vx = Math.sin(angle),
      vy = -Math.cos(angle);
    const length = width * Math.abs(vx) + height * Math.abs(vy);
    const gradient = material.createLinearGradient(
      width / 2 - (vx * length) / 2,
      height / 2 - (vy * length) / 2,
      width / 2 + (vx * length) / 2,
      height / 2 + (vy * length) / 2,
    );
    gradient.addColorStop(0, 'rgba(31,41,55,.92)');
    gradient.addColorStop(1, 'rgba(17,24,39,.88)');
    material.fillStyle = gradient;
    material.fillRect(0, 0, width, height);
    const rx = width * 0.8 * Math.SQRT2,
      ry = height * Math.SQRT2;
    material.save();
    material.translate(width * 0.2, 0);
    material.scale(rx, ry);
    const light = material.createRadialGradient(0, 0, 0, 0, 0, 1);
    light.addColorStop(0, 'rgba(215,231,255,.08)');
    light.addColorStop(0.7, 'rgba(215,231,255,0)');
    material.fillStyle = light;
    material.fillRect((-width * 0.2) / rx, 0, width / rx, height / ry);
    material.restore();
    material.drawImage(artwork, 0, 0, width, height);
    ctx.save();
    ctx.filter = 'blur(3px)';
    ctx.drawImage(background, 0, 0, width, height);
    ctx.restore();
  } else {
    ctx.fillStyle = getComputedStyle(surface).backgroundColor;
    ctx.fillRect(0, 0, width, height);
  }
  for (const image of images) {
    const bounds = rect(image);
    const portrait = image.closest('.testimonial-portrait');
    ctx.save();
    if (portrait) {
      const crop = rect(portrait);
      ctx.beginPath();
      ctx.roundRect(
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        parseFloat(getComputedStyle(portrait).borderTopLeftRadius),
      );
      ctx.clip();
    }
    if (video) ctx.filter = 'blur(3px) saturate(1.15)';
    const ratio = Math.max(bounds.width / image.naturalWidth, bounds.height / image.naturalHeight);
    const drawnWidth = image.naturalWidth * ratio;
    const drawnHeight = image.naturalHeight * ratio;
    ctx.drawImage(
      image,
      bounds.x + (bounds.width - drawnWidth) / 2,
      bounds.y + (bounds.height - drawnHeight) * (video ? 0.35 : 0.5),
      drawnWidth,
      drawnHeight,
    );
    ctx.restore();
  }
  if (video) {
    ctx.fillStyle = 'rgba(24,33,48,.74)';
    ctx.fillRect(0, 0, width, height);
  }
  for (const element of surface.querySelectorAll<HTMLElement>('blockquote, strong, p > span')) {
    const style = getComputedStyle(element);
    ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    ctx.fillStyle = style.color;
    ctx.letterSpacing = style.letterSpacing === 'normal' ? '0px' : style.letterSpacing;
    // Use the CSS baseline: Safari and Canvas font-box metrics differ, which
    // otherwise produces doubled letters where the two layers overlap.
    const probe = document.createElement('span');
    probe.setAttribute('aria-hidden', 'true');
    probe.style.cssText =
      'display:inline-block;width:0;height:0;line-height:0;vertical-align:baseline;padding:0;margin:0;border:0';
    element.prepend(probe);
    const baseline = (probe.getBoundingClientRect().top - root.top) / scale;
    probe.remove();
    const lines: Array<{ text: string; x: number; y: number; height: number }> = [];
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    while (walker.nextNode()) {
      const node = walker.currentNode;
      for (let index = 0; index < (node.textContent?.length ?? 0); index++) {
        range.setStart(node, index);
        range.setEnd(node, index + 1);
        const box = range.getBoundingClientRect();
        const y = (box.top - root.top) / scale;
        let line = lines.find((item) => Math.abs(item.y - y) < 1);
        if (!line) {
          line = { text: '', x: (box.left - root.left) / scale, y, height: box.height / scale };
          lines.push(line);
        }
        line.text += node.textContent![index];
      }
    }
    for (const line of lines) ctx.fillText(line.text, line.x, baseline + line.y - lines[0].y);
  }
  const play = surface.querySelector<HTMLElement>('.testimonial-play');
  if (play) {
    const bounds = rect(play);
    const x = bounds.x + bounds.width / 2;
    const y = bounds.y + bounds.height / 2;
    ctx.fillStyle = getComputedStyle(play).backgroundColor;
    ctx.beginPath();
    ctx.arc(x, y, bounds.width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = getComputedStyle(play).color;
    ctx.beginPath();
    ctx.moveTo(x - 6, y - 12);
    ctx.lineTo(x + 12, y);
    ctx.lineTo(x - 6, y + 12);
    ctx.closePath();
    ctx.fill();
  }
  return canvas;
}
