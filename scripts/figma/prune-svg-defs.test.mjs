import assert from 'node:assert/strict';
import test from 'node:test';
import { pruneSvgDefs } from './prune-svg-defs.mjs';

test('retains nested href dependencies, masks and filters while removing unused images', () => {
  const source =
    '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs><pattern id="paint"><use xlink:href="#photo"/></pattern><image id="photo" href="data:image/png;base64,YWJj"/><image id="unused" href="data:image/png;base64,ZGVm"/><mask id="mask"><rect width="20" height="20"/></mask><filter id="shadow"><feGaussianBlur stdDeviation="2"/></filter></defs><path id="shape" d="M0 0L20 20" fill="url(#paint)" mask="url(\'#mask\')" filter="url(#shadow)"/></svg>';
  const result = pruneSvgDefs(source);
  assert.equal(result.removedDefinitions, 1);
  for (const id of ['paint', 'photo', 'mask', 'shadow', 'shape'])
    assert.ok(result.svg.includes(`id="${id}"`));
  assert.ok(result.svg.includes('YWJj'));
  assert.ok(!result.svg.includes('ZGVm'));
  assert.ok(result.svg.includes('d="M0 0L20 20"'));
  assert.equal(pruneSvgDefs(result.svg).removedDefinitions, 0);
});

test('keeps style references and terminates for cyclic definition dependencies', () => {
  const result = pruneSvgDefs(
    '<svg xmlns="http://www.w3.org/2000/svg"><defs><style>.shape{fill:url("#first")}</style><linearGradient id="first" href="#second"/><linearGradient id="second" href="#first"/><path id="unused" d="M0 0"/></defs><rect class="shape" width="10" height="10"/></svg>',
  );
  assert.equal(result.removedDefinitions, 1);
  assert.ok(result.svg.includes('id="first"'));
  assert.ok(result.svg.includes('id="second"'));
});

test('removing unreferenced definitions preserves painted geometry and root attributes', () => {
  const result = pruneSvgDefs(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 967"><defs><image id="old-photo" href="data:image/png;base64,YWJj"/></defs><svg width="100%" preserveAspectRatio="none"><rect width="1440" height="967" fill="white"/></svg></svg>',
  );
  assert.equal(result.removedDefinitions, 1);
  assert.ok(!result.svg.includes('<defs'));
  assert.ok(result.svg.includes('viewBox="0 0 1440 967"'));
  assert.ok(result.svg.includes('<rect width="1440" height="967" fill="white"/>'));
});
