import assert from 'node:assert/strict';
import test from 'node:test';
import { loadTypeScript } from './load-typescript.mjs';

const { appDownloadPlatform } = loadTypeScript('src/data/app-download.ts');

test('Android phones/tablets and iOS/iPadOS receive the download action', () => {
  assert.equal(appDownloadPlatform('Mozilla/5.0 (Linux; Android 14)', 5), 'android');
  assert.equal(appDownloadPlatform('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0)', 5), 'ios');
  assert.equal(appDownloadPlatform('Mozilla/5.0 (iPad; CPU OS 18_0)', 5), 'ios');
  assert.equal(appDownloadPlatform('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)', 5), 'ios');
});

test('computers retain QR including touch notebooks and narrow desktop windows', () => {
  assert.equal(appDownloadPlatform('Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 10), null);
  assert.equal(appDownloadPlatform('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)', 0), null);
  assert.equal(appDownloadPlatform('Mozilla/5.0 (X11; Linux x86_64)', 0), null);
});
