import test from 'node:test';
import assert from 'node:assert/strict';
import { extractRasterAssets } from './raster-assets.mjs';

test('deduplicates raster bytes without changing SVG geometry or IDs', () => {
  const bytes = Buffer.from('a raster fixture');
  const uri = `data:image/png;base64,${bytes.toString('base64')}`;
  const source = `<svg viewBox="0 0 1440 900"><defs><mask id="phone-mask"><path d="M0 0h10v10Z"/></mask></defs><image id="photo" href="${uri}" mask="url(#phone-mask)"/><image xlink:href="${uri}"/></svg>`;
  const result = extractRasterAssets(source);
  assert.equal(result.assets.size, 1);
  const [[filename, extracted]] = result.assets;
  assert.deepEqual(extracted, bytes);
  assert.equal(result.svg, source.replaceAll(uri, `/assets/generated/${filename}`));
});

test('preserves existing references and remains stable when run again', () => {
  const source = '<svg><image href="/assets/photo.webp"/><path fill="url(#paint)"/></svg>';
  assert.deepEqual(extractRasterAssets(source), { svg: source, assets: new Map() });
});
