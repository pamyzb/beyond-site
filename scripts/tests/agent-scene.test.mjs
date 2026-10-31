import assert from 'node:assert/strict';
import test from 'node:test';
import { loadTypeScript } from './load-typescript.mjs';

const { syncAgentPlayback, agentTaskFrame, agentIntroComplete } = loadTypeScript(
  'src/lib/animation/agent-motion.ts',
);

test('tasks wait for the authored camera entrance to reach its final position', () => {
  assert.equal(agentIntroComplete({ y: 248.98, z: 360 }), false);
  assert.equal(agentIntroComplete({ y: 147.2, z: 997 }), false);
  assert.equal(agentIntroComplete({ y: 146.98, z: 1000 }), true);
});

test('tab visibility suspends rendering without restarting Spline start events', () => {
  const scene = {
    renderMode: 'auto',
    stop() {
      throw Error('stop reactivates Start on resume');
    },
    play() {
      throw Error('play reactivates Start');
    },
  };
  syncAgentPlayback(scene, false);
  assert.equal(scene.renderMode, 'manual');
  syncAgentPlayback(scene, true);
  assert.equal(scene.renderMode, 'auto');
});

test('task completes before advancing and wraps continuously', () => {
  assert.deepEqual(agentTaskFrame(0), { index: 0, progress: 0, complete: false });
  assert.deepEqual(agentTaskFrame(6000), { index: 0, progress: 1, complete: true });
  assert.deepEqual(agentTaskFrame(7500), { index: 1, progress: 0, complete: false });
  assert.deepEqual(agentTaskFrame(22500), agentTaskFrame(0));
});
