export type HeroPoint = { x: number; y: number; time: number };
export type AmbientArea = {
  width: number;
  lensWidth: number;
  top: number;
  bottom: number;
  trace?: { left: number; right: number; top: number; bottom: number };
};
export const HERO_INK_POINTS = 90;
export const HERO_INK_SEGMENTS = 32;
export const HERO_FRAME_MS = 32;
export const HERO_VIDEO_FRAME_MS = 1000 / 24;

const contourAngles = Array.from({ length: HERO_INK_SEGMENTS + 1 }, (_, index) => {
  const a = (index / HERO_INK_SEGMENTS) * Math.PI * 2;
  return {
    c: Math.cos(a),
    s: Math.sin(a),
    c3: Math.cos(a * 3),
    s3: Math.sin(a * 3),
    c5: Math.cos(a * 5),
    s5: Math.sin(a * 5),
  };
});

export function ambientPose(area: AmbientArea, seconds: number) {
  if (area.trace) {
    const { left, right, top, bottom } = area.trace;
    // Each line gets a quick sweep, a 1.6s hold for the ink to develop, and
    // a slow turn. Zero velocity and acceleration keep every join smooth.
    const time = ((seconds % 9.2) + 9.2) % 9.2;
    const returning = time >= 4.6;
    const leg = returning ? time - 4.6 : time;
    const startX = returning ? right : left;
    const endX = returning ? left : right;
    const startY = returning ? bottom : top;
    const endY = returning ? top : bottom;
    const ease = (value: number) => value * value * value * (value * (value * 6 - 15) + 10);
    if (leg < 1.8) {
      const progress = ease(leg / 1.8);
      return { x: startX + (endX - startX) * progress, y: startY, angle: 0 };
    }
    if (leg < 3.4) {
      return { x: endX, y: startY, angle: 0 };
    }
    const progress = ease((leg - 3.4) / 1.2);
    return { x: endX, y: startY + (endY - startY) * progress, angle: 0 };
  }
  const travel = Math.max(0, area.width - area.lensWidth);
  return {
    x: travel * (0.5 + 0.38 * Math.sin((seconds * Math.PI * 2) / 18 - 0.9)),
    y:
      area.top +
      Math.max(0, area.bottom - area.top) *
        (0.5 + 0.42 * Math.sin((seconds * Math.PI * 2) / 13 + 0.6)),
    angle: 8 * Math.sin((seconds * Math.PI * 2) / 12) + seconds * 3,
  };
}

/** Union of bounded vector contours; no viewport bitmap or PNG serialization. */
export function inkPath(points: HeroPoint[], now: number, radius: number, lifetime: number) {
  let path = '';
  for (const point of points.slice(-HERO_INK_POINTS)) {
    const elapsed = now - point.time;
    if (elapsed < 0 || elapsed >= lifetime) continue;
    const progress = 1 - Math.exp(-elapsed / 190);
    const retreat = Math.max(0, (elapsed / lifetime - 0.64) / 0.36);
    const size = radius * progress * (1 - retreat * retreat * (3 - 2 * retreat));
    if (size < 0.2) continue;
    const c3p = Math.cos(progress * 3),
      s3p = Math.sin(progress * 3);
    const c2p = Math.cos(progress * 2),
      s2p = Math.sin(progress * 2);
    const nodes = contourAngles.map((a) => {
      const r =
        size *
        (1 +
          (0.085 * (a.s3 * c3p + a.c3 * s3p) + 0.045 * (a.c5 * c2p + a.s5 * s2p)) * (1 - progress));
      const dr =
        size *
        (0.255 * (a.c3 * c3p - a.s3 * s3p) - 0.225 * (a.s5 * c2p - a.c5 * s2p)) *
        (1 - progress);
      return {
        x: point.x + a.c * r,
        y: point.y + a.s * r,
        dx: dr * a.c - r * a.s,
        dy: dr * a.s + r * a.c,
      };
    });
    path += `M${nodes[0].x.toFixed(1)} ${nodes[0].y.toFixed(1)}`;
    const tangent = (Math.PI * 2) / HERO_INK_SEGMENTS / 3;
    for (let index = 1; index < nodes.length; index++) {
      const a = nodes[index - 1],
        b = nodes[index];
      path += `C${(a.x + a.dx * tangent).toFixed(1)} ${(a.y + a.dy * tangent).toFixed(1)} ${(b.x - b.dx * tangent).toFixed(1)} ${(b.y - b.dy * tangent).toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
    }
    path += 'Z';
  }
  return path;
}

export function videoSampleSize(width: number, height: number) {
  const ratio = Math.min(1, 480 / Math.max(1, width, height));
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}
