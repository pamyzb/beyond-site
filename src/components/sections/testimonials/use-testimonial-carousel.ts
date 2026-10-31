'use client';
import { useRef, useState, type HTMLAttributes } from 'react';
import { gsap, useGSAP } from '@/lib/animation/gsap';
import { createTestimonialGlass, type TestimonialGlass } from '@/lib/animation/testimonial-glass';
export function useTestimonialCarousel({
  glass = true,
  desktopScroll = false,
}: { glass?: boolean; desktopScroll?: boolean } = {}) {
  const scope = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const pagination = useRef<HTMLDivElement>(null);
  const previousPage = useRef<number | null>(null);
  const glassCanvas = useRef<HTMLCanvasElement>(null);
  const motion = useRef({ pos: 0, target: 0 });
  const navigate = useRef<(index: number) => void>(() => {});
  const drag = useRef<{
    id: number;
    x: number;
    y: number;
    pos: number;
    lastX: number;
    time: number;
    velocity: number;
    started: boolean;
  } | null>(null);
  const paused = useRef({ hover: false, focus: false, visible: false, playing: false });
  const suppressClick = useRef(false);
  const [active, setActive] = useState(0);
  const [notice, setNotice] = useState(false);
  const [playing, setPlaying] = useState(false);
  paused.current.playing = playing;
  const select = (index: number) => navigate.current(index);
  useGSAP(
    () => {
      const halos = Array.from(
        pagination.current!.querySelectorAll<HTMLElement>('.testimonial-page-highlight'),
      );
      const immediate =
        previousPage.current === null ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      gsap.killTweensOf(halos);
      if (immediate) {
        halos.forEach((halo, index) =>
          gsap.set(halo, {
            scaleX: index === active ? 1 : 0,
            scaleY: index === active ? 1 : 0,
            y: 0,
            skewX: 0,
            opacity: index === active ? 1 : 0,
          }),
        );
      } else {
        const direction = gsap.utils.wrap(-1.5, 1.5, active - previousPage.current!);
        gsap.to(
          halos.filter((_, index) => index !== active),
          {
            scaleX: 0.12,
            scaleY: 0,
            y: 12,
            skewX: direction * 12,
            opacity: 0,
            duration: 0.24,
            ease: 'power3.in',
            overwrite: true,
          },
        );
        gsap.to(halos[active], {
          scaleX: 1,
          scaleY: 1,
          y: 0,
          skewX: 0,
          opacity: 1,
          duration: 0.48,
          delay: 0.16,
          ease: 'back.out(1.5)',
          overwrite: true,
        });
      }
      previousPage.current = active;
    },
    { scope, dependencies: [active] },
  );
  useGSAP(
    () => {
      const root = scope.current!;
      const rail = track.current!;
      const media = window.matchMedia('(prefers-reduced-motion: reduce)');
      // Shareable preview of the same HTML fallback used when WebGL fails.
      const glassDisabled =
        new URLSearchParams(window.location.search).get('testimonialGlass') === 'off';
      const state = motion.current;
      const cards = Array.from(rail.querySelectorAll<HTMLElement>('.testimonial-slide'));
      const wrap = gsap.utils.wrap(-1.5, 1.5);
      const canvas = glassCanvas.current!;
      const stage = root.querySelector<HTMLElement>('.testimonial-viewport')!;
      let lastPos = state.pos;
      let lastTime = performance.now();
      let wasPlaying = paused.current.playing;
      let idle = 0;
      let tween: gsap.core.Tween | undefined;
      let entrance: gsap.core.Tween | undefined;
      let introduced = false;
      let geometryKey = '';
      let generation = 0;
      let disposed = false;
      let renderer: TestimonialGlass | null = null;
      let preparation: AbortController | null = null;
      let renderedPosition = NaN;
      const glassEnabled = () =>
        glass &&
        !glassDisabled &&
        !media.matches &&
        paused.current.visible &&
        !document.hidden &&
        !paused.current.playing;
      const render = () => {
        if (renderedPosition !== state.pos) {
          cards.forEach((card, index) => {
            const slot = wrap(index - state.pos);
            const distance = Math.min(1, Math.abs(slot));
            gsap.set(card, {
              xPercent: slot * 96,
              scale: 1 - distance * 0.16,
              opacity: 1 - distance * 0.58,
              zIndex: Math.abs(slot) < 0.5 ? 2 : 1,
            });
          });
          renderedPosition = state.pos;
        }
        let enabled = false;
        if (glassEnabled() && renderer) {
          enabled = renderer.draw(state.pos);
          if (!enabled) {
            // A failed GPU pass is terminal for this renderer. Keep the HTML
            // fallback instead of retrying the failing draw every frame.
            renderer.dispose();
            renderer = null;
          }
        }
        if (canvas.hidden === enabled) canvas.hidden = !enabled;
        const status = enabled ? 'webgl' : renderer ? 'paused' : 'fallback';
        if (root.dataset.glassRenderer !== status) root.dataset.glassRenderer = status;
      };
      const resize = () => {
        if (!glassEnabled()) {
          render();
          return;
        }
        const key = [rail.clientWidth, rail.clientHeight, innerWidth, devicePixelRatio].join(':');
        if (key === geometryKey) {
          render();
          return;
        }
        geometryKey = key;
        const currentGeneration = ++generation;
        preparation?.abort();
        preparation = new AbortController();
        renderer?.dispose();
        renderer = null;
        render();
        void createTestimonialGlass(
          canvas,
          rail,
          () => {
            if (disposed || generation !== currentGeneration) return;
            renderer?.dispose();
            renderer = null;
            render();
          },
          preparation.signal,
        )
          .then((next) => {
            if (disposed || generation !== currentGeneration) {
              next?.dispose();
              return;
            }
            renderer = next;
            render();
          })
          .catch(() => {
            if (!disposed && generation === currentGeneration) render();
          });
      };
      navigate.current = (index) => {
        tween?.kill();
        tween = undefined;
        state.target = Math.round(index);
        idle = 0;
        setActive(((state.target % 3) + 3) % 3);
        setNotice(false);
        setPlaying(false);
        if (media.matches) {
          state.pos = state.target;
          render();
          return;
        }
        tween = gsap.to(state, {
          pos: state.target,
          duration: 1.15,
          ease: 'expo.inOut',
          overwrite: 'auto',
        });
        syncTicker();
      };
      const tick = () => {
        const now = performance.now();
        const dt = Math.min(0.1, Math.max(0.001, (now - lastTime) / 1000));
        lastTime = now;
        if (state.pos !== lastPos || wasPlaying !== paused.current.playing) render();
        lastPos = state.pos;
        wasPlaying = paused.current.playing;
        const p = paused.current;
        if (
          !desktopScroll &&
          p.visible &&
          !p.hover &&
          !p.focus &&
          !p.playing &&
          !drag.current &&
          !document.hidden &&
          !media.matches &&
          !tween?.isActive()
        ) {
          idle += dt;
          if (idle >= 2.6) navigate.current(state.target + 1);
        } else idle = 0;
      };
      let ticking = false;
      const syncTicker = () => {
        const shouldTick = paused.current.visible && !document.hidden && !media.matches;
        for (const animation of [tween, entrance]) {
          if (animation && animation.progress() < 1) animation.paused(!shouldTick);
        }
        if (shouldTick === ticking) return;
        ticking = shouldTick;
        if (ticking) {
          lastTime = performance.now();
          lastPos = state.pos;
          gsap.ticker.add(tick);
        } else gsap.ticker.remove(tick);
      };
      const observer = new ResizeObserver(resize);
      observer.observe(rail);
      if (!media.matches) gsap.set(stage, { opacity: 0, y: 36 });
      const visibility = new IntersectionObserver(
        ([entry]) => {
          paused.current.visible = entry.isIntersecting;
          resize();
          render();
          syncTicker();
          if (entry.isIntersecting && !introduced) {
            introduced = true;
            if (!media.matches) {
              entrance = gsap.fromTo(
                stage,
                { y: 36, opacity: 0 },
                { y: 0, opacity: 1, duration: 1.3, ease: 'power2.out' },
              );
            }
          }
        },
        { threshold: 0.25 },
      );
      visibility.observe(root);
      const scrollMedia = gsap.matchMedia();
      if (desktopScroll) {
        scrollMedia.add('(min-width: 60em) and (prefers-reduced-motion: no-preference)', () => {
          gsap.to(
            {},
            {
              scrollTrigger: {
                trigger: root,
                start: 'center center',
                end: '+=160%',
                pin: true,
                onUpdate: (self) => {
                  const page = Math.min(2, Math.floor(self.progress * 3));
                  if (page !== state.target) navigate.current(page);
                },
              },
            },
          );
        });
      }
      const preferenceChanged = () => {
        if (media.matches) {
          tween?.kill();
          gsap.killTweensOf(stage);
          tween = undefined;
          entrance = undefined;
          state.pos = state.target;
          gsap.set(stage, { y: 0, opacity: 1 });
        }
        resize();
        render();
        syncTicker();
      };
      const pageVisibilityChanged = () => {
        resize();
        render();
        syncTicker();
      };
      media.addEventListener('change', preferenceChanged);
      window.addEventListener('resize', resize);
      document.addEventListener('visibilitychange', pageVisibilityChanged);
      syncTicker();
      resize();
      return () => {
        scrollMedia.revert();
        tween?.kill();
        gsap.killTweensOf(stage);
        observer.disconnect();
        visibility.disconnect();
        gsap.ticker.remove(tick);
        media.removeEventListener('change', preferenceChanged);
        window.removeEventListener('resize', resize);
        document.removeEventListener('visibilitychange', pageVisibilityChanged);
        disposed = true;
        generation++;
        preparation?.abort();
        renderer?.dispose();
        delete root.dataset.glassRenderer;
      };
    },
    { scope },
  );

  const interactionProps: HTMLAttributes<HTMLDivElement> = {
    onMouseEnter: () => {
      paused.current.hover = true;
    },
    onMouseLeave: () => {
      paused.current.hover = false;
    },
    onFocusCapture: () => {
      paused.current.focus = true;
    },
    onBlurCapture: (e) => {
      if (!e.currentTarget.contains(e.relatedTarget)) paused.current.focus = false;
    },
    onKeyDown: (e) => {
      if ((e.target as HTMLElement).closest('video')) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        select(motion.current.target + (e.key === 'ArrowRight' ? 1 : -1));
      }
    },
  };
  const viewportProps: HTMLAttributes<HTMLDivElement> = {
    onDragStart: (e) => e.preventDefault(),
    onClickCapture: (e) => {
      if (suppressClick.current) {
        e.preventDefault();
        e.stopPropagation();
        suppressClick.current = false;
      }
    },
    onPointerDown: (e) => {
      if (!e.isPrimary || e.button !== 0 || (e.target as HTMLElement).closest('button,video,a'))
        return;
      suppressClick.current = false;
      drag.current = {
        id: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        pos: motion.current.pos,
        lastX: e.clientX,
        time: performance.now(),
        velocity: 0,
        started: false,
      };
    },
    onPointerMove: (e) => {
      const d = drag.current;
      if (!d || d.id !== e.pointerId) return;
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      if (!d.started) {
        if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) {
          drag.current = null;
          return;
        }
        if (Math.abs(dx) < 8) return;
        d.started = true;
        gsap.killTweensOf(motion.current, 'pos');
        e.currentTarget.setPointerCapture(e.pointerId);
        e.currentTarget.dataset.dragging = 'true';
      }
      const now = performance.now();
      const dt = Math.max(8, now - d.time);
      d.velocity = (e.clientX - d.lastX) / dt;
      d.lastX = e.clientX;
      d.time = now;
      motion.current.pos = d.pos - dx / (track.current!.clientWidth * 0.96);
    },
    onPointerUp: (e) => {
      const d = drag.current;
      if (!d || d.id !== e.pointerId) return;
      drag.current = null;
      delete e.currentTarget.dataset.dragging;
      if (d.started) {
        suppressClick.current = true;
        const velocity = performance.now() - d.time > 100 ? 0 : d.velocity;
        const momentum = Math.max(
          -0.7,
          Math.min(0.7, (-velocity * 180) / (track.current!.clientWidth * 0.96)),
        );
        select(Math.round(motion.current.pos + momentum));
        if (e.currentTarget.hasPointerCapture(e.pointerId))
          e.currentTarget.releasePointerCapture(e.pointerId);
      }
    },
    onPointerCancel: (e) => {
      if (drag.current) {
        drag.current = null;
        delete e.currentTarget.dataset.dragging;
        select(Math.round(motion.current.pos));
      }
    },
  };
  const previous = () => select(motion.current.target - 1);
  const next = () => select(motion.current.target + 1);
  const selectPage = (index: number) =>
    select(motion.current.target + gsap.utils.wrap(-1.5, 1.5, index - active));
  return {
    scope,
    track,
    pagination,
    glassCanvas,
    active,
    notice,
    playing,
    setPlaying,
    setNotice,
    interactionProps,
    viewportProps,
    previous,
    next,
    selectPage,
  };
}
