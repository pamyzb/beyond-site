'use client';
import { useEffect, useRef } from 'react';
import { createHeroGlassMap } from '@/lib/animation/hero-glass-map';
import {
  ambientPose,
  HERO_FRAME_MS,
  usesHeroPointer,
  HERO_VIDEO_FRAME_MS,
  videoSampleSize,
} from '@/lib/animation/hero-motion';
import { cloneHeroScene } from '@/lib/animation/hero-scene';

export function useHeroGlass() {
  const lens = useRef<HTMLDivElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const sample = useRef<HTMLDivElement>(null);
  const filter = useRef<SVGFilterElement>(null);
  const mapImage = useRef<SVGFEImageElement>(null);
  const displacement = useRef<SVGFEDisplacementMapElement>(null);
  useEffect(() => {
    const glass = lens.current!,
      viewport = scene.current!,
      content = sample.current!;
    const hero = glass.parentElement!;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const desktop = matchMedia('(hover: hover) and (pointer: fine)');
    const touch = matchMedia('(any-pointer: coarse)');
    const pointerMode = () =>
      usesHeroPointer(desktop.matches, touch.matches, navigator.maxTouchPoints);
    let mode = '',
      visible = false,
      ready = false,
      disposed = false,
      interacted = false;
    let frame = 0,
      resizeFrame = 0,
      lastTick = 0,
      lastPaint = 0,
      clock = 0;
    let x = 0,
      y = 0,
      targetX = 0,
      targetY = 0,
      angle = 0,
      velocity = 0,
      speed = 0;
    let previousPointer: { x: number; y: number; time: number } | null = null;
    let pointerTime = 0,
      key = '';
    let bounds = hero.getBoundingClientRect(),
      w = 0,
      h = 0;
    let area: {
      width: number;
      lensWidth: number;
      top: number;
      bottom: number;
      trace?: { left: number; right: number; top: number; bottom: number };
    } = { width: 0, lensWidth: 0, top: 0, bottom: 0 };
    let word = { left: 0, top: 0, right: 0, bottom: 0 };
    let copy: HTMLElement | null = null,
      video: HTMLVideoElement | null = null;
    let canvas: HTMLCanvasElement | null = null,
      context: CanvasRenderingContext2D | null = null;
    let sampling = false,
      videoFrame = 0,
      sampleFrame = 0,
      lastSample = 0;
    const active = () =>
      visible &&
      ready &&
      !disposed &&
      !document.hidden &&
      !reduced.matches &&
      (mode !== 'auto' ||
        (area.bottom + h + bounds.top > 0 && area.top + bounds.top < innerHeight));
    const state = (value: string) => {
      if (glass.dataset.motionState !== value) glass.dataset.motionState = value;
    };
    const stopSample = () => {
      sampling = false;
      if (videoFrame && video) video.cancelVideoFrameCallback(videoFrame);
      cancelAnimationFrame(sampleFrame);
      videoFrame = sampleFrame = 0;
    };
    const drawVideo = (now: number) => {
      videoFrame = sampleFrame = 0;
      if (!sampling || !active() || !video || !canvas || !context) return;
      if (now - lastSample >= HERO_VIDEO_FRAME_MS && video.readyState >= 2) {
        const size = videoSampleSize(video.videoWidth, video.videoHeight);
        if (canvas.width !== size.width || canvas.height !== size.height) {
          canvas.width = size.width;
          canvas.height = size.height;
        }
        context.drawImage(video, 0, 0, size.width, size.height);
        lastSample = now - ((now - lastSample) % HERO_VIDEO_FRAME_MS);
      }
      if (typeof video.requestVideoFrameCallback === 'function')
        videoFrame = video.requestVideoFrameCallback(drawVideo);
      else sampleFrame = requestAnimationFrame(drawVideo);
    };
    const syncSample = () => {
      const needed =
        active() &&
        (mode === 'pointer' || mode === 'auto') &&
        canvas &&
        x + w > word.left - 24 &&
        x < word.right + 24 &&
        y + h > word.top - 24 &&
        y < word.bottom + 24;
      if (!needed) stopSample();
      else if (!sampling) {
        sampling = true;
        lastSample = 0;
        drawVideo(performance.now());
      }
    };
    const paint = () => {
      const cx = w / 2,
        cy = h / 2;
      glass.style.transform = `translate3d(${x + cx}px,${y + cy}px,0) rotate(${angle}deg) translate(${-cx}px,${-cy}px)`;
      if ((mode === 'pointer' || mode === 'auto') && copy) {
        // Counter-rotate the sampled scene inside a lens-sized filter viewport.
        content.style.transform = `translate(${cx}px,${cy}px) rotate(${-angle}deg) translate3d(${-x - cx}px,${-y - cy}px,0)`;
        copy.style.transformOrigin = `${x + cx}px ${y + cy}px`;
        copy.style.transform = mode === 'auto' ? 'scale(1.3)' : 'scale(1.26)';
        syncSample();
      }
      if (mode === 'auto' && active()) {
        hero.dispatchEvent(
          new CustomEvent('hero-ambient-position', {
            detail: { x: x + cx, y: y + cy, time: performance.now() },
          }),
        );
      }
    };
    const tick = (now: number) => {
      if (!active()) {
        frame = 0;
        return;
      }
      if (mode === 'auto' && now - lastPaint < HERO_FRAME_MS) {
        frame = requestAnimationFrame(tick);
        return;
      }
      const dt = lastTick ? Math.min(0.05, (now - lastTick) / 1000) : 1 / 30;
      lastTick = lastPaint = now;
      clock += dt;
      if (mode === 'auto') {
        ({ x, y, angle } = ambientPose(area, clock));
      } else {
        const idle = Math.max(0, now - pointerTime - 40);
        const desired = Math.min(6, speed * 2.5) * Math.exp(-idle / 110);
        velocity += (desired - velocity) * (1 - Math.pow(0.75, dt * 60));
        angle += velocity * dt * 60;
        const follow = 1 - Math.pow(0.62, dt * 60);
        x += (targetX - x) * follow;
        y += (targetY - y) * follow;
      }
      paint();
      if (
        mode === 'auto' ||
        Math.abs(targetX - x) + Math.abs(targetY - y) > 0.15 ||
        velocity > 0.003
      )
        frame = requestAnimationFrame(tick);
      else {
        frame = 0;
        lastTick = 0;
        velocity = speed = 0;
        state('idle');
      }
    };
    const sync = () => {
      if (!active()) {
        cancelAnimationFrame(frame);
        frame = 0;
        lastTick = lastPaint = 0;
        stopSample();
        state(reduced.matches ? 'reduced' : 'paused');
        hero.dispatchEvent(new Event('hero-ambient-pause'));
      } else {
        syncSample();
        state(mode === 'auto' || frame ? 'running' : 'idle');
        if ((mode === 'auto' || interacted) && !frame) frame = requestAnimationFrame(tick);
      }
    };
    const rebuild = () => {
      resizeFrame = 0;
      if (disposed) return;
      const nextMode = reduced.matches ? 'reduced' : pointerMode() ? 'pointer' : 'auto';
      if (mode !== nextMode) {
        mode = nextMode;
        interacted = false;
        key = '';
        stopSample();
      }
      glass.dataset.motionMode = mode;
      bounds = hero.getBoundingClientRect();
      w = glass.offsetWidth;
      h = glass.offsetHeight;
      if (!w || !h) return;
      const headingElement = hero.querySelector('h1')!;
      const heading = headingElement.getBoundingClientRect();
      const bottom = hero.querySelector('.hero-bottom')!.getBoundingClientRect();
      const top = Math.max(104, heading.top - bounds.top - h * 0.3);
      area = {
        width: bounds.width,
        lensWidth: w,
        top,
        bottom: Math.max(top, Math.min(bounds.height - h - 24, bottom.top - bounds.top - h - 16)),
      };
      if (nextMode === 'auto') {
        const lines = Array.from(headingElement.querySelectorAll(':scope > span'));
        const firstLine = lines.at(0)?.getBoundingClientRect() ?? heading;
        const lastLine = lines.at(-1)?.getBoundingClientRect() ?? heading;
        const clamp = (value: number, min: number, max: number) =>
          Math.min(max, Math.max(min, value));
        const maxX = Math.max(0, bounds.width - w);
        area.trace = {
          left: clamp(Math.min(firstLine.left, lastLine.left) - bounds.left - w * 0.32, 0, maxX),
          right: clamp(Math.max(firstLine.right, lastLine.right) - bounds.left - w * 0.68, 0, maxX),
          top: clamp(firstLine.top - bounds.top + firstLine.height / 2 - h / 2, top, area.bottom),
          bottom: Math.max(top, bounds.height - h - 24),
        };
        area.bottom = area.trace.bottom;
      }
      const videoBounds = hero.querySelector('.hero-video-word')!.getBoundingClientRect();
      word = {
        left: videoBounds.left - bounds.left,
        top: videoBounds.top - bounds.top,
        right: videoBounds.right - bounds.left,
        bottom: videoBounds.bottom - bounds.top,
      };
      const nextKey = `${mode}:${bounds.width}:${bounds.height}:${w}:${h}:${ready}:${visible}:${document.hidden}`;
      if (nextKey !== key) {
        key = nextKey;
        stopSample();
        copy = null;
        video = null;
        canvas = null;
        context = null;
        content.replaceChildren();
        if ((mode === 'pointer' || mode === 'auto') && ready && visible && !document.hidden) {
          const cloned = cloneHeroScene(hero);
          copy = cloned.copy;
          video = cloned.video;
          canvas = cloned.canvas;
          context = canvas?.getContext('2d') ?? null;
          Object.assign(copy.style, {
            position: 'relative',
            margin: '0',
            width: `${bounds.width}px`,
            height: `${bounds.height}px`,
            overflow: 'visible',
          });
          content.replaceChildren(copy);
          content.style.width = `${bounds.width}px`;
          content.style.height = `${bounds.height}px`;
          viewport.style.width = `${w}px`;
          viewport.style.height = `${h}px`;
          const map = createHeroGlassMap(w, h);
          if (map && mapImage.current && filter.current) {
            for (const name of ['x', 'y', 'width', 'height'] as const)
              mapImage.current.setAttribute(name, String(map[name]));
            mapImage.current.setAttribute('href', map.href);
            filter.current.setAttribute('x', '-16');
            filter.current.setAttribute('y', '-16');
            filter.current.setAttribute('width', String(w + 32));
            filter.current.setAttribute('height', String(h + 32));
            displacement.current?.setAttribute(
              'scale',
              String(map.scale * (mode === 'auto' ? 1.8 : 1)),
            );
          }
        }
      }
      if (!interacted || mode !== 'pointer') {
        if (mode === 'auto') ({ x, y, angle } = ambientPose(area, clock));
        else {
          x = targetX = (bounds.width - w) / 2;
          y = targetY =
            mode === 'reduced' && !pointerMode()
              ? Math.max(area.bottom, bounds.height - h - 96)
              : (bounds.height - h) / 2;
        }
      }
      paint();
      sync();
    };
    const requestRebuild = () => {
      if (!resizeFrame) resizeFrame = requestAnimationFrame(rebuild);
    };
    const move = (event: PointerEvent) => {
      if (mode !== 'pointer' || !active() || event.pointerType === 'touch') return;
      const now = performance.now();
      if (previousPointer) {
        const dt = Math.max(1, now - previousPointer.time);
        const nextSpeed =
          dt > 150
            ? 0
            : Math.min(
                4,
                Math.hypot(event.clientX - previousPointer.x, event.clientY - previousPointer.y) /
                  dt,
              );
        speed += (nextSpeed - speed) * (1 - Math.exp(-dt / 45));
      }
      previousPointer = { x: event.clientX, y: event.clientY, time: now };
      pointerTime = now;
      interacted = true;
      targetX = event.clientX - bounds.left - w / 2;
      targetY = event.clientY - bounds.top - h / 2;
      state('running');
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const leave = () => {
      previousPointer = null;
      speed = 0;
    };
    const scroll = () => {
      bounds = hero.getBoundingClientRect();
      sync();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      requestRebuild();
    });
    observer.observe(hero);
    const resize = new ResizeObserver(requestRebuild);
    resize.observe(hero);
    resize.observe(glass);
    void document.fonts.ready.then(() => {
      if (!disposed) {
        ready = true;
        requestRebuild();
      }
    });
    hero.addEventListener('pointermove', move);
    hero.addEventListener('pointerleave', leave);
    window.addEventListener('scroll', scroll, { passive: true });
    document.addEventListener('visibilitychange', requestRebuild);
    desktop.addEventListener('change', requestRebuild);
    touch.addEventListener('change', requestRebuild);
    reduced.addEventListener('change', requestRebuild);
    requestRebuild();
    return () => {
      disposed = true;
      stopSample();
      cancelAnimationFrame(frame);
      cancelAnimationFrame(resizeFrame);
      observer.disconnect();
      resize.disconnect();
      content.replaceChildren();
      hero.removeEventListener('pointermove', move);
      hero.removeEventListener('pointerleave', leave);
      window.removeEventListener('scroll', scroll);
      document.removeEventListener('visibilitychange', requestRebuild);
      desktop.removeEventListener('change', requestRebuild);
      touch.removeEventListener('change', requestRebuild);
      reduced.removeEventListener('change', requestRebuild);
      hero.dispatchEvent(new Event('hero-ambient-pause'));
    };
  }, []);
  return { lens, scene, sample, filter, mapImage, displacement };
}
