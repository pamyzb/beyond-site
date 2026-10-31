'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';
import './agent-operation.css';

function Robot({ x, receiver = false }: { x: number; receiver?: boolean }) {
  return (
    <g transform={`translate(${x} 0)`}>
      <g
        className={receiver ? 'agent-operation-receiver' : 'agent-operation-packer'}
        transform={receiver ? 'scale(-1 1)' : undefined}
      >
        <path d="M-28 172 L-32 221 M28 172 L32 221" className="agent-operation-limb" />
        <path d="M-46 224 H-17 M17 224 H46" className="agent-operation-limb" />
        <rect x="-43" y="112" width="86" height="69" rx="22" className="agent-operation-body" />
        <rect x="-49" y="49" width="98" height="74" rx="27" className="agent-operation-body" />
        <path d="M0 49 V35" className="agent-operation-limb" />
        <circle cy="31" r="6" className="agent-operation-signal" />
        <rect x="-34" y="68" width="68" height="34" rx="15" className="agent-operation-face" />
        <circle cx="-15" cy="84" r="5" className="agent-operation-eye" />
        <circle cx="15" cy="84" r="5" className="agent-operation-eye" />
        <path d="M-43 134 L-65 151 L-82 137" className="agent-operation-limb" />
        <g className="agent-operation-arm">
          <path d="M43 134 L67 151 L84 132" className="agent-operation-limb" />
          <circle cx="84" cy="132" r="9" className="agent-operation-body" />
        </g>
        <circle cy="147" r="9" className="agent-operation-signal" />
      </g>
    </g>
  );
}

export function AgentOperationScene({ comparison }: { comparison: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const compact = window.matchMedia('(max-width: 40em)');
    let visible = false;
    let timeline: gsap.core.Timeline | undefined;
    const box = element.querySelector('.agent-operation-box');
    const arms = element.querySelectorAll('.agent-operation-arm');
    const sync = () => {
      if (visible && !document.hidden && !preference.matches) timeline?.play();
      else timeline?.pause();
    };
    const configure = () => {
      timeline?.kill();
      element
        .querySelector('.agent-operation-strip svg')
        ?.setAttribute('viewBox', compact.matches ? '90 30 630 160' : '0 0 800 260');
      gsap.set([box, ...arms], { clearProps: 'all' });
      if (preference.matches) {
        timeline = undefined;
        return;
      }
      timeline = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 0.5 });
      timeline
        .set(box, { x: -180, opacity: 0 })
        .to(box, { opacity: 1, duration: 0.3 })
        .to(arms[0], { rotation: -16, svgOrigin: '43 134', duration: 0.5 })
        .to(arms[0], { rotation: 0, duration: 0.5 })
        .to(box, { x: 150, duration: 1.5, ease: 'power2.inOut' })
        .to(arms[1], { rotation: -16, svgOrigin: '43 134', duration: 0.5 })
        .to(arms[1], { rotation: 0, duration: 0.5 })
        .to(box, { x: 300, duration: 1.2, ease: 'power2.inOut' })
        .to(box, { opacity: 0, duration: 0.3 });
      sync();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        sync();
      },
      { threshold: 0.15 },
    );
    observer.observe(element);
    preference.addEventListener('change', configure);
    compact.addEventListener('change', configure);
    document.addEventListener('visibilitychange', sync);
    configure();
    return () => {
      timeline?.kill();
      gsap.set([box, ...arms], { clearProps: 'all' });
      observer.disconnect();
      preference.removeEventListener('change', configure);
      compact.removeEventListener('change', configure);
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  return (
    <div ref={root} className="agent-operation">
      {comparison}
      <figure className="agent-operation-strip">
        <svg
          viewBox="0 0 800 260"
          role="img"
          aria-label="Dois agentes trabalham em sequência: um prepara uma caixa, o outro recebe, confere e encaminha. O fluxo recomeça automaticamente."
        >
          <path d="M80 230 H720" className="agent-operation-track" />
          <path d="M280 164 H520" className="agent-operation-track" />
          <path
            d="M385 157 L396 164 L385 171 M414 157 L425 164 L414 171"
            className="agent-operation-arrow"
          />
          <Robot x={190} />
          <Robot x={600} receiver />
          <g className="agent-operation-box">
            <path
              d="M365 116 L400 100 L435 116 L400 133 Z"
              className="agent-operation-package-top"
            />
            <path
              d="M365 116 V151 L400 169 L435 151 V116 L400 133 Z"
              className="agent-operation-package"
            />
            <path
              d="M400 133 V169 M383 108 L417 125 V139"
              className="agent-operation-package-line"
            />
          </g>
          <path d="M690 111 L698 119 L713 100" className="agent-operation-check" />
        </svg>
      </figure>
    </div>
  );
}
