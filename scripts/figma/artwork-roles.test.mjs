import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { annotateArtworkRoles } from './artwork-roles.mjs';

test('every current export satisfies its semantic animation contract', async () => {
  const manifest = JSON.parse(await readFile('src/data/artwork-files.json', 'utf8'));
  for (const [key, file] of Object.entries(manifest)) {
    const source = await readFile(`public/${file}`, 'utf8');
    const annotated = annotateArtworkRoles(key, source);
    // Annotation must preserve all original geometry, definitions and IDs.
    assert.equal(annotated.replace(/ data-artwork-(?:role|side)="[^"]*"/g, ''), source, key);
  }
});

test('semantic roles are actually attached to the current animation targets', async () => {
  const manifest = JSON.parse(await readFile('src/data/artwork-files.json', 'utf8'));
  const contracts = {
    process: { 'process-face': 4, 'process-marker': 1 },
    conversation: { photo: 4 },
    'phone-project': { phone: 1, 'phone-camera': 1 },
    'phone-cases': { phone: 1, 'phone-camera': 1 },
    'aplicativo-bleed': {
      phone: 2,
      'phone-camera': 2,
      'qr-card': 1,
      'qr-logo': 1,
      'app-outline': 1,
    },
    'aplicativo-light-bleed': {
      phone: 2,
      'phone-camera': 2,
      'qr-card': 1,
      'qr-logo': 1,
      'app-outline': 1,
    },
  };
  for (const [key, roles] of Object.entries(contracts)) {
    const result = annotateArtworkRoles(key, await readFile(`public/${manifest[key]}`, 'utf8'));
    for (const [role, count] of Object.entries(roles)) {
      assert.equal(result.split(`data-artwork-role="${role}"`).length - 1, count, `${key}/${role}`);
    }
    if (key === 'conversation') {
      assert.equal(result.split('data-artwork-side="left"').length - 1, 2);
    }
  }
});

test('an incompatible Figma export fails explicitly during preparation', () => {
  assert.throws(
    () => annotateArtworkRoles('phone-project', '<svg><g id="new-phone"/></svg>'),
    /phone-project\/phone: expected 1, found 0/,
  );
  assert.throws(
    () =>
      annotateArtworkRoles(
        'phone-project',
        '<svg><g id="Container_26"/><g id="Container_26"/></svg>',
      ),
    /expected 1, found 2/,
  );
});
