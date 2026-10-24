import assert from 'node:assert/strict';
import test from 'node:test';
import { loadTypeScript } from './load-typescript.mjs';

const { parseSvgPath, containsPoint } = loadTypeScript(
  'src/components/layout/footer/runner-geometry.ts',
);

test('runner recognizes separate obstacles, gaps and negative coordinates', () => {
  const polygons = parseSvgPath('M-20 -10 H20 V10 H-20 Z M40 0 L60 0 60 20 40 20 Z');
  assert.equal(polygons.length, 2);
  assert.equal(containsPoint(polygons, -15, -5), true);
  assert.equal(containsPoint(polygons, 50, 10), true);
  assert.equal(containsPoint(polygons, 30, 5), false);
  assert.equal(containsPoint(polygons, 0, 15), false);
});

test('open polygons and empty artwork produce predictable collision regions', () => {
  const triangle = parseSvgPath('M0 0 L20 0 10 20');
  assert.equal(containsPoint(triangle, 10, 8), true);
  assert.equal(containsPoint(triangle, 2, 18), false);
  assert.deepEqual(parseSvgPath(''), []);
  assert.equal(containsPoint([], 0, 0), false);
});
