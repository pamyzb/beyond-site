'use client';
import { useEffect, useRef, useState } from 'react';
import { Menu as MenuIcon, X } from 'lucide-react';
import type { SectionData } from '@/lib/figma/design';
import { Artwork } from '@/components/ui/artwork';
import { HeaderNavigation } from '@/components/layout/header/header-navigation';

export function SiteHeader({ section }: { section: SectionData }) {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);
  useEffect(() => {
    const desktop = matchMedia('(min-width: 90em)');
    const close = () => setOpen(false);
    const outside = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) close();
    };
    desktop.addEventListener('change', close);
    document.addEventListener('pointerdown', outside);
    return () => {
      desktop.removeEventListener('change', close);
      document.removeEventListener('pointerdown', outside);
    };
  }, []);
  useEffect(() => {
    let frame = 0;
    const sync = () => {
      frame = 0;
      const progress = Math.min(1, Math.max(0, window.scrollY / 180));
      header.current?.style.setProperty('--header-collapse', String(progress));
    };
    const onScroll = () => {
      setOpen(false);
      if (!frame) frame = requestAnimationFrame(sync);
    };
    sync();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pageshow', sync);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pageshow', sync);
    };
  }, []);
  return (
    <header
      ref={header}
      className={`site-header${open ? ' menu-open' : ''}`}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          setOpen(false);
          toggle.current?.focus();
        }
      }}
    >
      <div className="header-frame">
        <Artwork
          src={section.art}
          width={1440}
          height={87}
          className="figma-art header-logo-light"
          lazy={false}
        />
        <Artwork
          src="assets/figma/cabecalho-dark.svg"
          width={1440}
          height={87}
          className="figma-art header-logo-dark"
          lazy={false}
        />
        <div className="header-content">
          <a
            className="brand-link"
            href="#inicio"
            aria-label="Beyond the Bytes — voltar ao topo"
            onClick={() => setOpen(false)}
          />
          <HeaderNavigation onNavigate={() => setOpen(false)} />
        </div>
      </div>
      <a
        className="mobile-brand"
        href="#inicio"
        aria-label="Beyond the Bytes — voltar ao topo"
        onClick={() => setOpen(false)}
      >
        <Artwork
          src="assets/figma/brand.svg"
          width={220}
          height={23}
          alt="Beyond the Bytes"
          className="brand-logo header-logo-light"
          lazy={false}
        />
        <Artwork
          src="assets/figma/brand-dark.svg"
          width={220}
          height={23}
          className="brand-logo header-logo-dark"
          lazy={false}
        />
      </a>
      <button
        ref={toggle}
        className="menu-toggle"
        type="button"
        aria-label={open ? 'Fechar menu' : 'Abrir menu'}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        onClick={() => setOpen((current) => !current)}
      >
        {open ? (
          <X className="menu-icon" size={24} aria-hidden="true" />
        ) : (
          <MenuIcon className="menu-icon" size={24} aria-hidden="true" />
        )}
      </button>
    </header>
  );
}
