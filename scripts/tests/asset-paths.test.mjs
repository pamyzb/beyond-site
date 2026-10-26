import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

test('artwork catalogs point to existing assets organized by section', () => {
  for (const file of ['asset-paths.json', 'artwork-files.json']) {
    const paths = JSON.parse(
      readFileSync(new URL(`../../src/data/${file}`, import.meta.url), 'utf8'),
    );
    for (const source of Object.values(paths)) {
      assert.ok(!source.startsWith('assets/figma/'), source);
      assert.ok(existsSync(new URL(`../../public/${source}`, import.meta.url)), source);
    }
  }
});
