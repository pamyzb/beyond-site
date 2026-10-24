import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';
import woff2 from 'wawoff2';

function tables(bytes) {
  const result = new Map();
  for (let index = 0; index < bytes.readUInt16BE(4); index++) {
    const start = 12 + index * 16;
    const offset = bytes.readUInt32BE(start + 8);
    result.set(
      bytes.toString('ascii', start, start + 4),
      bytes.subarray(offset, offset + bytes.readUInt32BE(start + 12)),
    );
  }
  return result;
}
function glyphBounds(font) {
  const longOffsets = font.get('head').readInt16BE(50) === 1;
  return Array.from({ length: font.get('maxp').readUInt16BE(4) }, (_, index) => {
    const offset = (position) =>
      longOffsets
        ? font.get('loca').readUInt32BE(position * 4)
        : font.get('loca').readUInt16BE(position * 2) * 2;
    const start = offset(index),
      end = offset(index + 1);
    return start === end ? null : [...font.get('glyf').subarray(start, start + 10)];
  });
}

test('WOFF2 round trip preserves metrics, character maps and glyph bounds for every local font', async () => {
  const root = new URL('../../public/assets/fonts/', import.meta.url);
  for (const name of (await readdir(root)).filter((name) => name.endsWith('.ttf'))) {
    const input = await readFile(new URL(name, root));
    const compressed = Buffer.from(await woff2.compress(input));
    assert.equal(compressed.toString('ascii', 0, 4), 'wOF2');
    assert.ok(compressed.length < input.length, `${name} should shrink`);
    const before = tables(input);
    const after = tables(Buffer.from(await woff2.decompress(compressed)));
    assert.deepEqual([...after.keys()].sort(), [...before.keys()].sort());
    // WOFF2 normalizes outline storage, loca offsets and head checksums.
    for (const [tag, bytes] of before) {
      if (!['head', 'glyf', 'loca'].includes(tag))
        assert.deepEqual(after.get(tag), bytes, `${name}/${tag}`);
    }
    assert.equal(after.get('head').readUInt16BE(18), before.get('head').readUInt16BE(18));
    assert.deepEqual(glyphBounds(after), glyphBounds(before), name);
  }
});
