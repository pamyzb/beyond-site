'use client';
import { useHeroGlass } from './use-hero-glass';

export function HeroGlass() {
  const { lens, scene, sample, filter, mapImage, displacement } = useHeroGlass();
  return (
    <>
      <svg className="hero-glass-filters" width="0" height="0" aria-hidden="true">
        <defs>
          <filter
            ref={filter}
            id="hero-refraction"
            x="-16"
            y="-16"
            filterUnits="userSpaceOnUse"
            primitiveUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feImage ref={mapImage} result="cylinder" preserveAspectRatio="none" />
            <feGaussianBlur in="cylinder" stdDeviation="3.2" result="smooth-cylinder" />
            <feDisplacementMap
              ref={displacement}
              in="SourceGraphic"
              in2="smooth-cylinder"
              scale="0"
              xChannelSelector="R"
              yChannelSelector="G"
              result="refracted"
            />
            <feGaussianBlur in="refracted" stdDeviation="0.2" />
          </filter>
        </defs>
      </svg>
      <div ref={lens} className="hero-glass" aria-hidden="true">
        <div className="hero-glass-material">
          <div ref={scene} className="hero-glass-scene">
            <div ref={sample} className="hero-glass-sample" />
          </div>
          <div className="hero-glass-tint" />
          <div className="hero-glass-sheen" />
          <div className="hero-glass-grain" />
        </div>
      </div>
    </>
  );
}
