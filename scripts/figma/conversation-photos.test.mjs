import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { replaceConversationPhotos } from './conversation-photos.mjs';
import { annotateArtworkRoles } from './artwork-roles.mjs';

test('desktop conversation uses all four shared photos and retains animation anchors', async () => {
  const source = await readFile('public/assets/conversa/conversa-bleed.svg', 'utf8');
  const result = annotateArtworkRoles('conversation', replaceConversationPhotos(source));
  assert.equal((result.match(/data-artwork-role="photo"/g) ?? []).length, 4);
  for (const corner of ['top-left', 'top-right', 'bottom-left', 'bottom-right']) {
    assert.ok(result.includes(`href="/assets/conversa/conversation-photo-${corner}.svg"`));
  }
});
