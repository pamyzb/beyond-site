/** Spline stop/play reconnects Start handlers. Manual rendering preserves their state. */
export function syncAgentPlayback(scene: object, running: boolean) {
  // Runtime exposes this constructor option as a public field, omitted from its .d.ts.
  Object.assign(scene, { renderMode: running ? 'auto' : 'manual' });
}

/** Camera 2's final state in the authored Spline entrance (not a wall-clock delay). */
export function agentIntroComplete(position: { y: number; z: number }) {
  return Math.abs(position.y - 146.98) < 0.25 && Math.abs(position.z - 1000) < 0.25;
}

export function agentTaskFrame(elapsed: number) {
  const phase = elapsed % 7500;
  return {
    index: Math.floor(elapsed / 7500) % 3,
    progress: Math.min(1, phase / 6000),
    complete: phase >= 6000,
  };
}
