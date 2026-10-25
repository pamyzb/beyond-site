'use client';
import { useEffect, useId, useRef } from 'react';
import {
  HERO_FRAME_MS,
  HERO_INK_POINTS,
  inkPath,
  type HeroPoint,
} from '@/lib/animation/hero-motion';
import { cloneHeroScene } from '@/lib/animation/hero-scene';
import { HERO_MEDIA } from '@/data/hero-media';

export function useHeroInk() {
  const id = `hero-ink-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const layer = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLVideoElement>(null);
  const trail = useRef<SVGPathElement>(null);
  const headerTrail = useRef<SVGPathElement>(null);
  const headerInverse = useRef<SVGPathElement>(null);
  const headerMask = useRef<SVGMaskElement>(null);
  const headerWhite = useRef<SVGRectElement>(null);
  useEffect(() => {
    const ink = layer.current!,
      hero = ink.parentElement!;
    const host = ink.querySelector<HTMLElement>('.hero-ink-copy')!;
    const header = document.querySelector<HTMLElement>('.site-header:not(.hero-header-reveal)');
    const nextSection = document.getElementById('metricas');
    const desktop = matchMedia('(min-width: 90em) and (hover: hover) and (pointer: fine)');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let bounds = hero.getBoundingClientRect(),
      headerBounds = header?.getBoundingClientRect();
    let nextTop = nextSection?.getBoundingClientRect().top ?? Infinity;
    let visible = false,
      ready = false,
      disposed = false,
      dirty = true;
    let frame = 0,
      lastPaint = 0,
      points: HeroPoint[] = [];
    let headerReveal: HTMLElement | null = null;
    let wordVideo: HTMLVideoElement | null = null;
    let playing = false;
    const primeBackdrop = () => {
      if (
        visible &&
        !document.hidden &&
        !reduced.matches &&
        !backdrop.current!.getAttribute('src')
      ) {
        backdrop.current!.preload = 'auto';
        backdrop.current!.src = HERO_MEDIA.background;
      }
    };
    const playback = (next: boolean) => {
      if (playing === next) return;
      playing = next;
      for (const video of [backdrop.current, wordVideo]) {
        if (!video) continue;
        if (next) void video.play().catch(() => {});
        else video.pause();
      }
    };
    let heroControls: { source: HTMLElement; copy: HTMLElement }[] = [];
    let headerControls: { source: HTMLElement; copy: HTMLElement }[] = [];
    const controls = (source: Element, copy: Element) => {
      const selector = '.action-link,.button,.menu-toggle,.hero-scroll-cue';
      const originals = Array.from(source.querySelectorAll<HTMLElement>(selector));
      return Array.from(copy.querySelectorAll<HTMLElement>(selector))
        .map((node, index) => ({ source: originals[index], copy: node }))
        .filter((pair) => pair.source);
    };
    const syncControls = (pairs: typeof heroControls) => {
      for (const { source, copy } of pairs) {
        copy.toggleAttribute('data-hover-active', source.matches(':hover,:focus-visible'));
        copy.toggleAttribute('data-press-active', source.matches(':active'));
        for (const property of ['--fill-x', '--fill-y', '--fill-radius'])
          copy.style.setProperty(property, source.style.getPropertyValue(property));
      }
    };
    const resetHeader = () => {
      header?.removeAttribute('data-dark-area-visible');
      header?.style.removeProperty('mask-image');
      header?.style.removeProperty('-webkit-mask-image');
      if (headerReveal) headerReveal.style.visibility = 'hidden';
    };
    const clear = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      lastPaint = 0;
      points = [];
      playback(false);
      trail.current?.setAttribute('d', '');
      ink.style.visibility = 'hidden';
      ink.dataset.motionState = reduced.matches ? 'reduced' : 'paused';
      resetHeader();
    };
    const syncHeader = () => {
      if (!header || !headerReveal) return;
      headerReveal.replaceChildren(
        ...Array.from(header.childNodes, (node) => node.cloneNode(true)),
      );
      headerReveal.querySelectorAll('.language-options').forEach((node) => node.remove());
      headerReveal.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
      headerControls = controls(header, headerReveal);
    };
    const headerObserver = new MutationObserver(syncHeader);
    const ensureHeader = () => {
      if (!header || headerReveal) return;
      headerReveal = header.cloneNode(true) as HTMLElement;
      headerReveal.classList.add('hero-header-reveal');
      headerReveal.removeAttribute('style');
      headerReveal.setAttribute('aria-hidden', 'true');
      headerReveal.inert = true;
      headerReveal.style.clipPath = `url("#${id}-header")`;
      document.body.append(headerReveal);
      syncHeader();
      headerObserver.observe(header, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['href', 'aria-label', 'aria-expanded'],
      });
    };
    const geometry = () => {
      const nextBounds = hero.getBoundingClientRect();
      if (nextBounds.width !== bounds.width || nextBounds.height !== bounds.height) dirty = true;
      bounds = nextBounds;
      headerBounds = header?.getBoundingClientRect();
      nextTop = nextSection?.getBoundingClientRect().top ?? Infinity;
      if (headerBounds) {
        const transform = `translate(${bounds.left - headerBounds.left} ${bounds.top - headerBounds.top})`;
        headerTrail.current?.setAttribute('transform', transform);
        headerInverse.current?.setAttribute('transform', transform);
        const w = String(headerBounds.width + 64),
          h = String(headerBounds.height + 64);
        headerMask.current?.setAttribute('width', w);
        headerMask.current?.setAttribute('height', h);
        headerWhite.current?.setAttribute('width', w);
        headerWhite.current?.setAttribute('height', h);
      }
    };
    const ensureCopy = () => {
      if (!dirty && host.firstChild) return;
      playback(false);
      const { copy, inkVideo } = cloneHeroScene(hero, true);
      wordVideo = inkVideo;
      if (wordVideo) {
        wordVideo.src = HERO_MEDIA.green;
        wordVideo.muted = wordVideo.defaultMuted = true;
        wordVideo.loop = wordVideo.playsInline = true;
        wordVideo.preload = 'auto';
      }
      Object.assign(copy.style, {
        position: 'absolute',
        left: '0',
        top: '0',
        width: `${bounds.width}px`,
        height: `${bounds.height}px`,
        margin: '0',
      });
      host.replaceChildren(copy);
      heroControls = controls(hero.querySelector(':scope > .section-content')!, copy);
      dirty = false;
    };
    const paint = (now: number) => {
      if (disposed || !visible || document.hidden || reduced.matches) {
        clear();
        return;
      }
      if (now - lastPaint < HERO_FRAME_MS) {
        frame = requestAnimationFrame(paint);
        return;
      }
      lastPaint = now;
      const lifetime = desktop.matches ? 1800 : 2600;
      const radius = desktop.matches ? 145 : Math.min(80, bounds.width * 0.18);
      points = points.filter((point) => now - point.time < lifetime);
      const path = inkPath(points, now, radius, lifetime);
      playback(Boolean(path));
      trail.current?.setAttribute('d', path);
      ink.style.visibility = path ? 'visible' : 'hidden';
      ink.dataset.motionState = path ? 'running' : 'idle';
      syncControls(heroControls);
      const atHeader =
        desktop.matches &&
        header &&
        headerBounds &&
        bounds.bottom > headerBounds.bottom &&
        nextTop > headerBounds.bottom &&
        document.documentElement.dataset.scrollTheme !== 'dark' &&
        points.some((point) => point.y - radius < headerBounds!.bottom - bounds.top);
      if (atHeader) {
        ensureHeader();
        headerTrail.current?.setAttribute('d', path);
        headerInverse.current?.setAttribute('d', path);
        header!.style.maskImage = `url("#${id}-header-light")`;
        header!.style.webkitMaskImage = `url("#${id}-header-light")`;
        header!.toggleAttribute('data-dark-area-visible', true);
        headerReveal!.style.setProperty(
          '--header-collapse',
          header!.style.getPropertyValue('--header-collapse'),
        );
        headerReveal!.style.visibility = path ? 'visible' : 'hidden';
        syncControls(headerControls);
      } else resetHeader();
      if (points.length) frame = requestAnimationFrame(paint);
      else {
        frame = 0;
        lastPaint = 0;
      }
    };
    const add = (point: HeroPoint) => {
      if (!visible || !ready || document.hidden || reduced.matches) return;
      const previous = points.at(-1);
      if (
        previous &&
        Math.hypot(point.x - previous.x, point.y - previous.y) < 12 &&
        point.time - previous.time < 45
      )
        return;
      ensureCopy();
      if (previous && point.time - previous.time < 100) {
        const count = Math.min(
          12,
          Math.floor(Math.hypot(point.x - previous.x, point.y - previous.y) / 24),
        );
        for (let index = 1; index < count; index++)
          points.push({
            x: previous.x + ((point.x - previous.x) * index) / count,
            y: previous.y + ((point.y - previous.y) * index) / count,
            time: point.time,
          });
      }
      points.push(point);
      points = points.slice(-(desktop.matches ? HERO_INK_POINTS : 12));
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const move = (event: PointerEvent) => {
      if (!desktop.matches || event.pointerType === 'touch') return;
      if (event.clientY < bounds.top || event.clientY > bounds.bottom) return;
      add({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
        time: performance.now(),
      });
    };
    const ambient = (event: Event) => {
      if (desktop.matches) return;
      const point = (event as CustomEvent<HeroPoint>).detail;
      const previous = points.at(-1);
      // Holding at an endpoint must let the existing ink develop and fade,
      // rather than replacing the bounded trail with stationary samples.
      if (previous && Math.hypot(point.x - previous.x, point.y - previous.y) < 1) return;
      add(point);
    };
    const visibility = () => {
      if (document.hidden) clear();
      else primeBackdrop();
    };
    const modeChanged = () => {
      clear();
      geometry();
      primeBackdrop();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) clear();
      else primeBackdrop();
    });
    observer.observe(hero);
    const resize = new ResizeObserver(geometry);
    resize.observe(hero);
    void document.fonts.ready.then(() => {
      if (!disposed) {
        ready = true;
        geometry();
      }
    });
    hero.addEventListener('pointermove', move);
    header?.addEventListener('pointermove', move);
    hero.addEventListener('hero-ambient-position', ambient);
    hero.addEventListener('hero-ambient-pause', clear);
    window.addEventListener('scroll', geometry, { passive: true });
    document.addEventListener('visibilitychange', visibility);
    desktop.addEventListener('change', modeChanged);
    reduced.addEventListener('change', modeChanged);
    geometry();
    return () => {
      disposed = true;
      clear();
      observer.disconnect();
      resize.disconnect();
      headerObserver.disconnect();
      headerReveal?.remove();
      host.replaceChildren();
      hero.removeEventListener('pointermove', move);
      header?.removeEventListener('pointermove', move);
      hero.removeEventListener('hero-ambient-position', ambient);
      hero.removeEventListener('hero-ambient-pause', clear);
      window.removeEventListener('scroll', geometry);
      document.removeEventListener('visibilitychange', visibility);
      desktop.removeEventListener('change', modeChanged);
      reduced.removeEventListener('change', modeChanged);
    };
  }, [id]);
  return { id, layer, backdrop, trail, headerTrail, headerInverse, headerMask, headerWhite };
}
