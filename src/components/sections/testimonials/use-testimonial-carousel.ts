'use client';
import { useId, useRef, useState, type HTMLAttributes } from 'react';
import { gsap, useGSAP } from '@/lib/animation/gsap';
import { createCylinderMap } from '@/lib/animation/testimonial-glass';
export function useTestimonialCarousel() {
  const scope = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const pagination = useRef<HTMLDivElement>(null);
  const previousPage = useRef<number | null>(null);
  const filterId = `testimonial-glass-${useId().replace(/:/g, '')}`;
  const glass = useRef<SVGFilterElement>(null);
  const glassImage = useRef<SVGFEImageElement>(null);
  const displacement = useRef<SVGFEDisplacementMapElement>(null);
  const lensOffset = useRef<SVGFEOffsetElement>(null);
  const motion = useRef({ pos: 0, target: 0, speed: 0, velocity: 0, intro: 1 });
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
      const glassMedia = window.matchMedia(
        '(min-width: 60em) and (hover: hover) and (pointer: fine)',
      );
      const state = motion.current;
      const cards = Array.from(rail.querySelectorAll<HTMLElement>('.testimonial-slide'));
      const wrap = gsap.utils.wrap(-1.5, 1.5);
      let mapScale = 0;
      let lastPos = state.pos;
      let lastTime = performance.now();
      let wasPlaying = paused.current.playing;
      let idle = 0;
      let tween: gsap.core.Tween | undefined;
      let intro: gsap.core.Tween | undefined;
      let introduced = false;
      let glassStrength = 0;
      const glassEnabled = () => glassMedia.matches && !media.matches && paused.current.visible;
      const render = () => {
        const glassActive = glassEnabled() && glassStrength > 0;
        cards.forEach((card, index) => {
          const slot = wrap(index - state.pos);
          const distance = Math.min(1, Math.abs(slot));
          gsap.set(card, {
            xPercent: slot * 96,
            scale: 1 - distance * 0.16,
            opacity: 1 - distance * 0.58,
            filter: glassMedia.matches ? `blur(${distance * 4}px)` : 'none',
            zIndex: Math.abs(slot) < 0.5 ? 2 : 1,
          });
        });
        rail.style.filter = glassActive ? `url("#${filterId}")` : '';
        displacement.current?.setAttribute(
          'scale',
          String(glassActive ? mapScale * glassStrength : 0),
        );
        // The lens follows the signed movement; magnitude still controls bending.
        // Returning to the previous slide mirrors the leading/trailing refraction.
        lensOffset.current?.setAttribute('dx', String(glassActive ? -state.velocity * 72 : 0));
      };
      const resize = () => {
        if (!glassMedia.matches) {
          mapScale = 0;
          rail.style.filter = '';
          render();
          return;
        }
        const map = createCylinderMap(rail.clientWidth, rail.clientHeight, window.innerWidth);
        if (!map || !glass.current || !glassImage.current) return;
        for (const key of ['x', 'y', 'width', 'height'] as const) {
          glass.current.setAttribute(key, String(map[key]));
          glassImage.current.setAttribute(key, String(map[key]));
        }
        glassImage.current.setAttribute('href', map.href);
        mapScale = map.scale;
        render();
      };
      navigate.current = (index) => {
        tween?.kill();
        state.target = Math.round(index);
        idle = 0;
        setActive(((state.target % 3) + 3) % 3);
        setNotice(false);
        setPlaying(false);
        if (media.matches) {
          state.pos = state.target;
          state.speed = 0;
          state.velocity = 0;
          render();
          return;
        }
        tween = gsap.to(state, {
          pos: state.target,
          duration: 1.15,
          ease: 'expo.inOut',
          overwrite: 'auto',
        });
      };
      const tick = () => {
        const now = performance.now();
        const dt = Math.min(0.1, Math.max(0.001, (now - lastTime) / 1000));
        lastTime = now;
        const velocity = Math.max(-0.7, Math.min(0.7, ((state.pos - lastPos) / dt) * 0.22));
        const speed = Math.abs(velocity);
        const previousSpeed = state.speed;
        const previousVelocity = state.velocity;
        const smoothing = 1 - Math.exp(-12 * dt);
        state.speed += (speed - state.speed) * smoothing;
        // Clear the old direction immediately when a drag or tween reverses.
        if (velocity * state.velocity < 0) state.velocity = 0;
        state.velocity += (velocity - state.velocity) * smoothing;
        if (state.speed < 0.001) state.speed = 0;
        if (Math.abs(state.velocity) < 0.001) state.velocity = 0;
        // Ease the lens itself to zero before detaching its SVG filter. The
        // previous baseline of 1 removed a still-distorted image in one frame.
        const previousStrength = glassStrength;
        const amount = Math.min(1, state.speed / 0.18);
        const envelope = amount * amount * (3 - 2 * amount);
        const targetStrength =
          glassEnabled() && !paused.current.playing
            ? Math.max(0, state.intro - 1) * 2.25 + (1 + state.speed) * envelope
            : 0;
        glassStrength += (targetStrength - glassStrength) * (1 - Math.exp(-8 * dt));
        // At this point removing the filter changes displacement by < 0.03px.
        if (targetStrength === 0 && glassStrength * mapScale < 0.03) glassStrength = 0;
        if (
          state.pos !== lastPos ||
          state.speed !== previousSpeed ||
          state.velocity !== previousVelocity ||
          glassStrength !== previousStrength ||
          intro?.isActive() ||
          wasPlaying !== paused.current.playing
        )
          render();
        lastPos = state.pos;
        wasPlaying = paused.current.playing;
        const p = paused.current;
        if (
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
      const observer = new ResizeObserver(resize);
      observer.observe(rail);
      if (!media.matches) gsap.set(rail, { opacity: 0, y: 36 });
      const visibility = new IntersectionObserver(
        ([entry]) => {
          paused.current.visible = entry.isIntersecting;
          render();
          if (entry.isIntersecting && !introduced) {
            introduced = true;
            if (!media.matches) {
              state.intro = 1.8;
              intro = gsap.to(state, { intro: 1, duration: 1.3, ease: 'power2.out' });
              gsap.fromTo(
                rail,
                { y: 36, opacity: 0 },
                { y: 0, opacity: 1, duration: 1.3, ease: 'power2.out' },
              );
            }
          }
        },
        { threshold: 0.25 },
      );
      visibility.observe(root);
      const preferenceChanged = () => {
        if (media.matches) {
          tween?.kill();
          intro?.kill();
          gsap.killTweensOf(rail);
          state.pos = state.target;
          state.speed = 0;
          state.velocity = 0;
          state.intro = 1;
          gsap.set(rail, { y: 0, opacity: 1 });
        }
        render();
      };
      media.addEventListener('change', preferenceChanged);
      glassMedia.addEventListener('change', resize);
      window.addEventListener('resize', resize);
      gsap.ticker.add(tick);
      resize();
      return () => {
        tween?.kill();
        intro?.kill();
        gsap.killTweensOf(rail);
        observer.disconnect();
        visibility.disconnect();
        gsap.ticker.remove(tick);
        media.removeEventListener('change', preferenceChanged);
        glassMedia.removeEventListener('change', resize);
        window.removeEventListener('resize', resize);
        rail.style.filter = '';
      };
    },
    { scope, dependencies: [filterId] },
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
    filterId,
    glass,
    glassImage,
    displacement,
    lensOffset,
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
