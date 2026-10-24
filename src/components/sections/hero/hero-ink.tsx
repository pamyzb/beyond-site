'use client';
import { useHeroInk } from './use-hero-ink';

export function HeroInk() {
  const { id, layer, backdrop, trail, headerTrail, headerInverse, headerMask, headerWhite } =
    useHeroInk();
  return (
    <>
      <svg className="hero-ink-defs" width="0" height="0" aria-hidden="true">
        <defs>
          <clipPath id={`${id}-trail`} clipPathUnits="userSpaceOnUse">
            <path ref={trail} />
          </clipPath>
          <clipPath id={`${id}-header`} clipPathUnits="userSpaceOnUse">
            <path ref={headerTrail} />
          </clipPath>
          <mask
            ref={headerMask}
            id={`${id}-header-light`}
            maskUnits="userSpaceOnUse"
            maskContentUnits="userSpaceOnUse"
            x="-32"
            y="-32"
            width="2000"
            height="160"
            style={{ maskType: 'luminance' }}
          >
            <rect ref={headerWhite} x="-32" y="-32" width="2000" height="160" fill="white" />
            <path ref={headerInverse} fill="black" />
          </mask>
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
