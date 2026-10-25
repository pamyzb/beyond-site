import { spawnSync } from 'node:child_process';

// A push must validate this checkout's production export, even if a developer
// normally points Playwright at another server.
const env = { ...process.env, E2E_GATE: '1' };
delete env.E2E_BASE_URL;
const result = spawnSync('pnpm test:e2e --forbid-only', {
  env,
  shell: true,
  stdio: 'inherit',
});
if (result.error) console.error(result.error);
process.exitCode = result.status ?? 1;
