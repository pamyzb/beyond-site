import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, writeFile, copyFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

test('installed commit and push hooks propagate failures and permit successful checks', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'beyond-hooks-'));
  const run = (command, args, env = {}) =>
    spawnSync(command, args, {
      cwd: root,
      env: { ...process.env, HUSKY: '1', XDG_CONFIG_HOME: root, ...env },
      encoding: 'utf8',
    });
  try {
    assert.equal(run('git', ['init']).status, 0);
    await mkdir(path.join(root, '.husky'));
    await mkdir(path.join(root, 'node_modules/.bin'), { recursive: true });
    await writeFile(
      path.join(root, 'node_modules/.bin/pnpm'),
      '#!/bin/sh\nprintf "%s\\n" "$*" > invoked\nexit "${HOOK_TEST_EXIT:-0}"\n',
      { mode: 0o755 },
    );
    for (const hook of ['pre-commit', 'pre-push']) {
      await copyFile(`.husky/${hook}`, path.join(root, '.husky', hook));
    }
    const installed = run(process.execPath, [path.resolve('node_modules/husky/bin.js')]);
    assert.equal(installed.status, 0, installed.stderr);
    for (const [hook, command] of [
      ['pre-commit', 'check'],
      ['pre-push', 'verify'],
    ]) {
      for (const exitCode of [7, 0]) {
        const result = run('git', ['hook', 'run', hook], { HOOK_TEST_EXIT: String(exitCode) });
        assert.equal(result.status, exitCode, result.stderr);
        assert.equal((await readFile(path.join(root, 'invoked'), 'utf8')).trim(), command);
      }
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
