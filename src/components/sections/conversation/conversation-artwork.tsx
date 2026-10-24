'use client';
import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/animation/gsap';

export function ConversationArtwork({
  svg,
  variant = 'conversation',
}: {
  svg: string;
  variant?: 'conversation' | 'faq' | 'contact';
}) {
  const desktop = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const section = desktop.current?.parentElement;
      if (!section) return;
      const mobile = section.querySelector<HTMLImageElement>(':scope > .component-art');
      const mobilePhotos = Array.from(
        section.querySelectorAll<HTMLElement>('.conversation-mobile-artwork .conversation-photo'),
      );
      const media = gsap.matchMedia();
      media.add(
        {
          desktop: '(min-width:90em)',
          compact: '(max-width:89.999em)',
          pointer: '(hover:hover) and (pointer:fine)',
          motion: '(prefers-reduced-motion:no-preference)',
        },
        (context) => {
          if (!context.conditions?.motion) return;
          if (variant === 'conversation' && context.conditions.desktop) {
            const logo = section.querySelector<SVGPathElement>(
              '.conversation-overlay [id="Vector_40"]',
            );
            if (logo) {
              const length = logo.getTotalLength();
              gsap.fromTo(
                logo,
                {
                  attr: { 'stroke-dasharray': `${length} ${length}`, 'stroke-dashoffset': length },
                },
                {
                  attr: { 'stroke-dashoffset': 0 },
                  duration: 2.2,
                  ease: 'power1.inOut',
                  scrollTrigger: {
                    trigger: section.querySelector('h2') ?? section,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                  },
                },
              );
            }
          }
          const targets = context.conditions.desktop
            ? Array.from(
                desktop.current!.querySelectorAll<SVGGElement>(
                  variant === 'contact'
                    ? '[id="contact-art-contact-image"]'
                    : variant === 'faq'
                      ? '[id="faq-art-Image-faq"]'
                      : '[id="conversation-art-Container_21"],[id="conversation-art-Container_23"],[id="conversation-art-Container_24"],[id="conversation-art-Container_22"]',
                ),
              )
            : context.conditions.compact && variant === 'conversation'
              ? mobilePhotos
              : mobile
                ? [mobile]
                : [];
          const parallax = variant === 'conversation' && context.conditions.pointer;
          const floats = (variant !== 'conversation' || parallax ? [] : targets).map(
            (target, index) =>
              gsap.to(target, {
                y: index % 2 ? 8 : -8,
                rotation: index % 2 ? -0.65 : 0.65,
                duration: 3.2 + index * 0.35,
                ease: 'sine.inOut',
                repeat: -1,
                yoyo: true,
                paused: true,
                transformOrigin: '50% 50%',
              }),
          );
          let entered = false;
          // Reuse tweens so pointer events do not allocate animations or fight the entrance.
          const offsets = parallax
            ? targets.map((target, index) => ({
                x: gsap.quickTo(target, 'x', { duration: 1.1, ease: 'power3.out' }),
                y: gsap.quickTo(target, 'y', { duration: 1.1, ease: 'power3.out' }),
                depth: context.conditions?.desktop
                  ? [
                      [26, -18],
                      [-20, 14],
                      [-34, -24],
                      [30, 20],
                    ][index]
                  : [12, -10],
              }))
            : [];
          const move = (event: PointerEvent) => {
            if (!entered || event.pointerType === 'touch') return;
            const bounds = section.getBoundingClientRect();
            const x = gsap.utils.clamp(
              -1,
              1,
              ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
            );
            const y = gsap.utils.clamp(
              -1,
              1,
              ((event.clientY - bounds.top) / bounds.height) * 2 - 1,
            );
            offsets.forEach((offset) => {
              offset.x(x * offset.depth[0]);
              offset.y(y * offset.depth[1]);
            });
          };
          const reset = () => {
            if (entered)
              offsets.forEach((offset) => {
                offset.x(0);
                offset.y(0);
              });
          };
          if (parallax) {
            section.addEventListener('pointermove', move);
            section.addEventListener('pointerleave', reset);
          }
          const entry = gsap.timeline({
            paused: true,
            onComplete: () => {
              entered = true;
              if (visibility.isActive) floats.forEach((tween) => tween.play());
            },
          });
          targets.forEach((target, index) => {
            const left =
              variant === 'faq' ||
              target.id.endsWith('_21') ||
              target.id.endsWith('_24') ||
              target.classList.contains('conversation-photo-top-left') ||
              target.classList.contains('conversation-photo-bottom-left');
            const wide = context.conditions?.desktop;
            const compact = context.conditions?.compact;
            entry.fromTo(
              target,
              {
                x:
                  variant === 'contact'
                    ? wide
                      ? 440
                      : 160
                    : variant === 'faq'
                      ? wide
                        ? -440
                        : -160
                      : wide
                        ? left
                          ? -440
                          : 440
                        : compact
                          ? left
                            ? -120
                            : 120
                          : 0,
                y: variant !== 'conversation' ? 0 : wide ? 120 : 80,
                rotation:
                  variant !== 'conversation'
                    ? 0
                    : wide
                      ? left
                        ? -12
                        : 12
                      : compact
                        ? left
                          ? -8
                          : 8
                        : -5,
                scale: variant !== 'conversation' ? 1 : 0.82,
                opacity: 0,
                transformOrigin: '50% 50%',
              },
              { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1, duration: 1.65, ease: 'power4.out' },
              index * 0.2,
            );
          });
          const visibility = ScrollTrigger.create({
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            onToggle: (self) =>
              floats.forEach((tween) => {
                if (self.isActive && entered) tween.resume();
                else tween.pause();
              }),
          });
          ScrollTrigger.create({
            trigger: context.conditions.desktop
              ? section
              : variant === 'conversation'
                ? section
                : (mobile ?? section),
            start:
              context.conditions.desktop && variant !== 'conversation'
                ? variant === 'faq'
                  ? 'top+=288 82%'
                  : 'top+=225 82%'
                : 'top 82%',
            toggleActions: 'play none none none',
            onEnter: () => entry.play(),
          });
          return () => {
            section.removeEventListener('pointermove', move);
            section.removeEventListener('pointerleave', reset);
          };
        },
      );
      return () => media.revert();
    },
    { scope: desktop },
  );
  return (
    <>
      <div
        ref={desktop}
        className={`figma-art conversation-artwork${variant !== 'faq' ? ' bleed-art' : ''}`}
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      {variant === 'conversation' && (
        <div className="conversation-mobile-artwork" aria-hidden="true">
          <img
            className="conversation-photo conversation-photo-top-left"
            src="/assets/figma/conversation-photo-top-left.svg"
            alt=""
          />
          <img
            className="conversation-photo conversation-photo-top-right"
            src="/assets/figma/conversation-photo-top-right.svg"
            alt=""
          />
          <img
            className="conversation-photo conversation-photo-bottom-left"
            src="/assets/figma/conversation-photo-bottom-left.svg"
            alt=""
          />
          <img
            className="conversation-photo conversation-photo-bottom-right"
            src="/assets/figma/conversation-photo-bottom-right.svg"
            alt=""
          />
        </div>
      )}
    </>
  );
}
