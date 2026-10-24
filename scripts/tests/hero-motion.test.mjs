import assert from 'node:assert/strict';
import test from 'node:test';
import { loadTypeScript } from './load-typescript.mjs';

const { ambientPose, videoSampleSize, inkPath, HERO_INK_POINTS, HERO_INK_SEGMENTS } =
  loadTypeScript('src/lib/animation/hero-motion.ts');

test('ambient motion stays inside its reserved area across compact layouts', () => {
  for (const area of [
    { width: 305, lensWidth: 88, top: 145, bottom: 210 },
    { width: 753, lensWidth: 128, top: 120, bottom: 290 },
    { width: 1009, lensWidth: 128, top: 140, bottom: 140 },
  ]) {
    for (let seconds = 0; seconds < 120; seconds += 0.1) {
      const pose = ambientPose(area, seconds);
      assert.ok(pose.x >= 0 && pose.x + area.lensWidth <= area.width);
      assert.ok(pose.y >= area.top && pose.y <= area.bottom);
      assert.ok(Number.isFinite(pose.angle));
      const next = ambientPose(area, seconds + 1 / 30);
      assert.ok(Math.abs(next.x - pose.x) < 8, 'no abrupt horizontal jump');
    }
  }
});

test('ambient motion slowly traces the two headline lines when a trace is available', () => {
  const area = {
    width: 390,
    lensWidth: 96,
    top: 120,
    bottom: 370,
    trace: { left: 12, right: 282, top: 160, bottom: 285 },
  };
  assert.deepEqual(ambientPose(area, 0), { x: 12, y: 160, angle: 0 });
  const endOfFirstLine = ambientPose(area, 9.6);
  assert.equal(endOfFirstLine.x, 282);
  assert.equal(endOfFirstLine.y, 160);
  assert.ok(Math.abs(endOfFirstLine.angle) < 0.001);
  assert.deepEqual(ambientPose(area, 12), { x: 282, y: 285, angle: 0 });
  assert.deepEqual(ambientPose(area, 21.6), { x: 12, y: 285, angle: 0 });
});

test('video samples cap the long edge without enlarging small sources', () => {
  assert.deepEqual(videoSampleSize(1920, 1080), { width: 480, height: 270 });
  assert.deepEqual(videoSampleSize(1080, 1920), { width: 270, height: 480 });
  assert.deepEqual(videoSampleSize(320, 180), { width: 320, height: 180 });
  assert.deepEqual(videoSampleSize(0, 0), { width: 1, height: 1 });
});

test('ink contours expire and remain bounded during rapid pointer input', () => {
  const points = Array.from({ length: 1000 }, (_, i) => ({ x: i, y: 100, time: 0 }));
  const path = inkPath(points, 500, 145, 1800);
  assert.equal((path.match(/M/g) ?? []).length, HERO_INK_POINTS);
  assert.equal((path.match(/[MC]/g) ?? []).length, HERO_INK_POINTS * (HERO_INK_SEGMENTS + 1));
  assert.ok(!/NaN|Infinity/.test(path));
  assert.equal(inkPath(points, 1800, 145, 1800), '');
  assert.equal(inkPath([{ x: 1, y: 1, time: 1000 }], 500, 145, 1800), '');
});

test('smooth contours preserve the reference radius, organic shape and 1800ms retreat', () => {
  for (const elapsed of [10, 50, 190, 500, 1152, 1500, 1750]) {
    const path = inkPath([{ x: 0, y: 0, time: 0 }], elapsed, 145, 1800);
    const values = path.match(/-?\d+(?:\.\d+)?/g).map(Number);
    let x0 = values[0],
      y0 = values[1];
    const p = 1 - Math.exp(-elapsed / 190);
    const retreat = Math.max(0, (elapsed / 1800 - 0.64) / 0.36);
    const size = 145 * p * (1 - retreat * retreat * (3 - 2 * retreat));
    for (let segment = 0; segment < HERO_INK_SEGMENTS; segment++) {
      const [x1, y1, x2, y2, x3, y3] = values.slice(2 + segment * 6, 8 + segment * 6);
      const angle = ((segment + 0.5) / HERO_INK_SEGMENTS) * Math.PI * 2;
      const r =
        size *
        (1 + (0.085 * Math.sin(3 * angle + p * 3) + 0.045 * Math.cos(5 * angle - p * 2)) * (1 - p));
      const mx = (x0 + 3 * x1 + 3 * x2 + x3) / 8;
      const my = (y0 + 3 * y1 + 3 * y2 + y3) / 8;
      assert.ok(
        Math.hypot(mx - r * Math.cos(angle), my - r * Math.sin(angle)) < 0.15,
        'curve matches the original contour within 0.15px',
      );
      x0 = x3;
      y0 = y3;
    }
  }
});
