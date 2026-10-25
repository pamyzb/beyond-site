import assert from 'node:assert/strict';
import test from 'node:test';
import { loadTypeScript } from './load-typescript.mjs';
const { servicesRoute, compactBuilders } = loadTypeScript('src/lib/animation/services-geometry.ts');
const cards = Array.from({ length: 7 }, (_, i) => ({
  left: 20 + i * 340,
  right: 320 + i * 340,
  top: 80,
  bottom: 600,
}));

test('the route closes the first card and reaches the final service with finite geometry', () => {
  const { d, outlineLength } = servicesRoute(cards);
  assert.ok(d.startsWith('M 321 340'));
  assert.ok(d.includes('V 340 L '));
  assert.ok(d.endsWith(`L ${cards.at(-1).right + 12} 38`));
  assert.ok(outlineLength > 1500 && outlineLength < 1700);
  assert.ok(!/NaN|Infinity/.test(d));
  assert.throws(() => servicesRoute([]));
});

test('builders stay together and visible across compact widths and delayed route positions', () => {
  for (const width of [320, 390, 768, 1280]) {
    for (let scroll = 0; scroll <= 1500; scroll += 30) {
      for (const routeX of [0, 900, 2400]) {
        const position = compactBuilders(cards, scroll, width, 30, routeX);
        assert.ok(position.x - 30 >= scroll + 12);
        assert.ok(position.x + position.spacing + 30 <= scroll + width - 12);
        assert.equal(position.y, 42);
      }
    }
  }
});
