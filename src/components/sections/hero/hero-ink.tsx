'use client';
import { useHeroInk } from './use-hero-ink';

export function HeroInk() {
  const { id, layer, backdrop, trail } = useHeroInk();
  return (
    <>
      <svg className="hero-ink-defs" width="0" height="0" aria-hidden="true">
        <defs>
          <clipPath id={`${id}-trail`} clipPathUnits="userSpaceOnUse">
            <path ref={trail} />
          </clipPath>
        </defs>
      </svg>
      <div
        ref={layer}
        className="hero-ink"
        aria-hidden="true"
        style={{ clipPath: `url("#${id}-trail")` }}
      >
        <video ref={backdrop} className="hero-ink-backdrop" muted loop playsInline preload="none" />
        <div className="hero-ink-shade" />
        <div className="hero-ink-copy" />
      </div>
    </>
  );
}
