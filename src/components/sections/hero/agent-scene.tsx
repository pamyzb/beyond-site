'use client';

import { useEffect, useRef, useState } from 'react';
import type { Application } from '@splinetool/runtime';
import { gsap } from '@/lib/animation/gsap';
import { agentIntroComplete, syncAgentPlayback } from '@/lib/animation/agent-motion';
import { AgentTasks } from './agent-tasks';

/** Owns only the Spline lifecycle; copy and actions render independently on the server. */
export function AgentScene({ scene }: { scene: string }) {
  const host = useRef<HTMLDivElement>(null);
  const light = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'static'>('loading');
  const [introduced, setIntroduced] = useState(false);

  useEffect(() => {
    const element = host.current!;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const compact = matchMedia('(max-width: 59.999em)');
    let disposed = false;
    let timedOut = false;
    let app: Application | undefined;
    let visible = true;
    let loaded = false;
    let resizeFrame = 0;
    let introFrame = 0;
    let idleTimer = 0;
    const hero = element.closest<HTMLElement>('.agent-hero')!;
    const pointer = matchMedia('(hover: hover) and (pointer: fine)');
    const look = (clientX: number, clientY: number) => {
      canvas.dispatchEvent(
        new PointerEvent('pointermove', { clientX, clientY, pointerType: 'mouse' }),
      );
    };
    const lookAtTask = () => {
      if (!loaded || preference.matches) return;
      const task = hero
        .querySelector('.agent-task-ribbon:not(.agent-task-ribbon-secondary)')!
        .getBoundingClientRect();
      look(task.left + task.width * 0.2, task.top + task.height / 2);
    };
    const followPointer = (event: PointerEvent) => {
      if (event.target === canvas || !pointer.matches || preference.matches || !loaded) return;
      look(event.clientX, event.clientY);
      clearTimeout(idleTimer);
      idleTimer = window.setTimeout(lookAtTask, 1200);
    };
    const leave = () => {
      clearTimeout(idleTimer);
      lookAtTask();
    };
    const controller = new AbortController();
    // A new canvas per effect keeps Strict Mode's asynchronous cleanup isolated.
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.tabIndex = -1;
    element.appendChild(canvas);

    const sync = () => {
      if (!loaded || !app) return;
      syncAgentPlayback(app, !preference.matches && !document.hidden && visible);
      if (!document.hidden && visible) lookAtTask();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(element);
    const fit = () => {
      const ratio = compact.matches ? Math.min(1, element.clientHeight / element.clientWidth) : 1;
      app?.setZoom(0.8 * ratio);
    };
    // A stopped WebGL canvas needs one fresh frame after an orientation/size change.
    const resizeObserver = new ResizeObserver(() => {
      if (!loaded || !app || !visible || document.hidden) return;
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = requestAnimationFrame(() => {
          fit();
          app?.requestRender();
          lookAtTask();
          resizeFrame = requestAnimationFrame(sync);
        });
      });
    });
    resizeObserver.observe(element);

    const load = async () => {
      try {
        const { Application } = await import('@splinetool/runtime');
        if (disposed || timedOut) return;
        app = new Application(canvas, { renderer: 'webgl', htmlContentMode: 'none' });
        await app.load(scene, undefined, { signal: controller.signal });
        if (disposed || timedOut) return;
        clearTimeout(timeout);
        app.setBackgroundColor('transparent');
        app.setGlobalEvents(false);
        if (preference.matches) {
          const camera = app.findObjectByName('Camera 2');
          if (camera) camera.state = 'State';
        }
        fit();
        loaded = true;
        setStatus('ready');
        resizeFrame = requestAnimationFrame(sync);
        const camera = app.findObjectByName('Camera 2');
        const waitForEntrance = () => {
          if (disposed) return;
          if (
            !document.hidden &&
            visible &&
            (preference.matches || !camera || agentIntroComplete(camera.position))
          ) {
            setIntroduced(true);
            lookAtTask();
            return;
          }
          introFrame = requestAnimationFrame(waitForEntrance);
        };
        introFrame = requestAnimationFrame(waitForEntrance);
      } catch {
        if (!disposed) {
          app?.dispose();
          app = undefined;
          setStatus('static');
        }
      }
    };
    const timeout = window.setTimeout(() => {
      if (!loaded) {
        timedOut = true;
        controller.abort();
        app?.dispose();
        app = undefined;
        setStatus('static');
      }
    }, 25000);
    void load();
    preference.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    hero.addEventListener('pointermove', followPointer);
    hero.addEventListener('pointerleave', leave);

    return () => {
      disposed = true;
      clearTimeout(timeout);
      clearTimeout(idleTimer);
      cancelAnimationFrame(resizeFrame);
      cancelAnimationFrame(introFrame);
      controller.abort();
      observer.disconnect();
      resizeObserver.disconnect();
      preference.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
      hero.removeEventListener('pointermove', followPointer);
      hero.removeEventListener('pointerleave', leave);
      app?.dispose();
      canvas.remove();
    };
  }, [scene]);

  useEffect(() => {
    const glow = light.current!;
    const hero = glow.closest<HTMLElement>('.agent-hero')!;
    const media = gsap.matchMedia();
    media.add(
      '(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)',
      () => {
        // Exact damped spring from the reference: stiffness 130, damping 25, mass .25.
        // Analytic integration avoids frame-rate-dependent cursor motion.
        const stiffness = 130,
          damping = 25,
          mass = 0.25;
        const discriminant = Math.sqrt(damping * damping - 4 * mass * stiffness);
        const slow = (-damping + discriminant) / (2 * mass);
        const fast = (-damping - discriminant) / (2 * mass);
        const x = { position: -500, velocity: 0, target: -500 };
        const y = { position: -500, velocity: 0, target: -500 };
        const setX = gsap.quickSetter(glow, 'x', 'px');
        const setY = gsap.quickSetter(glow, 'y', 'px');
        let active = false;
        setX(x.position);
        setY(y.position);
        const step = (axis: typeof x, seconds: number) => {
          const offset = axis.position - axis.target;
          const a = (axis.velocity - fast * offset) / (slow - fast);
          const b = offset - a;
          const decaySlow = Math.exp(slow * seconds);
          const decayFast = Math.exp(fast * seconds);
          axis.position = axis.target + a * decaySlow + b * decayFast;
          axis.velocity = a * slow * decaySlow + b * fast * decayFast;
        };
        const tick = (_time: number, delta: number) => {
          step(x, delta / 1000);
          step(y, delta / 1000);
          setX(x.position);
          setY(y.position);
          if (
            Math.abs(x.position - x.target) +
              Math.abs(y.position - y.target) +
              Math.abs(x.velocity) +
              Math.abs(y.velocity) <
            0.05
          ) {
            gsap.ticker.remove(tick);
            active = false;
          }
        };
        const move = (event: PointerEvent) => {
          const bounds = glow.parentElement!.getBoundingClientRect();
          x.target = event.clientX - bounds.left;
          y.target = event.clientY - bounds.top;
          if (!active) {
            active = true;
            gsap.ticker.add(tick);
          }
        };
        hero.addEventListener('pointerdown', move);
        hero.addEventListener('pointermove', move);
        return () => {
          gsap.ticker.remove(tick);
          hero.removeEventListener('pointerdown', move);
          hero.removeEventListener('pointermove', move);
        };
      },
    );
    return () => media.revert();
  }, []);

  return (
    <div className="agent-scene" data-status={status} aria-hidden="true">
      <div ref={light} className="agent-cursor-light">
        <span className="agent-cursor-spark" />
      </div>
      <AgentTasks active={introduced || status === 'static'} />
      <AgentTasks active={introduced || status === 'static'} secondary />
      <div ref={host} className="agent-scene-canvas" />
    </div>
  );
}
