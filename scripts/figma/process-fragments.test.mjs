import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { DOMParser } from '@xmldom/xmldom';
import { processFragments } from './process-fragments.mjs';
import { loadTypeScript } from '../tests/load-typescript.mjs';

const { buildProcessArtwork } = loadTypeScript('src/lib/server/process-artwork.ts');
const source = await readFile(
  new URL('../../public/assets/figma/processo.svg', import.meta.url),
  'utf8',
);

test('process cards have one surface each and no duplicated SVG IDs or unresolved references', () => {
  const artwork = buildProcessArtwork(processFragments(source));
  assert.deepEqual(Object.keys(artwork.cards), [
    'Article_12',
    'Article_13',
    'Article_15',
    'Article_14',
  ]);
  assert.deepEqual(Object.keys(artwork).sort(), ['cards', 'marker']);
  const markup = Object.values(artwork.cards).join('') + artwork.marker;
  const doc = new DOMParser().parseFromString(
    `<svg xmlns="http://www.w3.org/2000/svg">${markup}</svg>`,
    'image/svg+xml',
  );
  const nodes = Array.from(doc.getElementsByTagName('*'));
  const ids = nodes
    .filter((node) => node.hasAttribute('id'))
    .map((node) => node.getAttribute('id'));
  assert.equal(ids.length, new Set(ids).size);
  assert.equal(
    nodes.filter((node) => node.tagName === 'rect' && node.getAttribute('fill') === '#1F2937')
      .length,
    4,
  );
  assert.equal(
    nodes.filter((node) => node.getAttribute('class') === 'process-card-surface').length,
    4,
  );
  assert.equal(
    nodes.filter((node) => node.tagName === 'rect' && node.getAttribute('fill') === 'transparent')
      .length,
    0,
  );
  for (const match of markup.matchAll(/(?:url\(#|href="#)([^)"\s]+)/g))
    assert.ok(ids.includes(match[1]), `Missing SVG reference ${match[1]}`);
  assert.ok(artwork.marker.includes('id="process-Container_53-Container_53"'));
});

test('each card excludes the other cards and their unused definitions', () => {
  const fragments = processFragments(source);
  assert.ok(!fragments.Article_12.includes('id="Article_13"'));
  assert.ok(fragments.Article_12.includes('id="filter14_dd_15857_1601"'));
  assert.ok(!fragments.Article_12.includes('id="filter16_dd_15857_1601"'));
  assert.throws(
    () => buildProcessArtwork({ ...fragments, Article_12: '' }),
    /Missing process artwork fragment/,
  );
});
