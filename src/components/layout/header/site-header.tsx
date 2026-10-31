'use client';
import { useEffect, useRef, useState } from 'react';
import type { SectionData } from '@/lib/figma/design';
import { Artwork } from '@/components/ui/artwork';
import { HeaderNavigation } from '@/components/layout/header/header-navigation';

export function SiteHeader({
  section,
  homePath = '',
  mobileVariant = homePath ? 'compact' : 'home',
}: {
  section: SectionData;
  homePath?: string;
  mobileVariant?: 'home' | 'compact';
}) {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);
  useEffect(() => {
    if (mobileVariant === 'home') return;
    const close = () => setOpen(false);
    window.addEventListener('scroll', close, { passive: true });
    return () => window.removeEventListener('scroll', close);
  }, [mobileVariant]);
  useEffect(() => {
    if (!open) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      toggle.current?.focus();
    };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [open]);
  useEffect(() => {
    const desktop = matchMedia('(min-width: 70.625em)');
    const sync = () => {
      const navigation = header.current?.querySelector<HTMLElement>('#mobile-navigation');
      if (navigation) navigation.inert = !desktop.matches && !open;
    };
    sync();
    desktop.addEventListener('change', sync);
    return () => desktop.removeEventListener('change', sync);
  }, [open]);
  useEffect(() => {
    const desktop = matchMedia('(min-width: 70.625em)');
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
  return (
    <header
      ref={header}
      className={`site-header${mobileVariant === 'home' ? ' site-header--home' : ''}${open ? ' menu-open' : ''}`}
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
          src="assets/compartilhados/cabecalho-dark.svg"
          width={1440}
          height={87}
          className="figma-art header-logo-dark"
          lazy={false}
        />
        <div className="header-content">
          <a
            className="brand-link"
            href={`${homePath}#inicio`}
            aria-label="Beyond the Bytes — voltar ao topo"
            onClick={() => setOpen(false)}
          />
          <HeaderNavigation homePath={homePath} onNavigate={() => setOpen(false)} />
        </div>
      </div>
      <a
        className="mobile-brand"
        href={`${homePath}#inicio`}
        aria-label="Beyond the Bytes — voltar ao topo"
        onClick={() => setOpen(false)}
      >
        <Artwork
          src="assets/compartilhados/brand.svg"
          width={220}
          height={23}
          alt="Beyond the Bytes"
          className="brand-logo header-logo-light"
          lazy={false}
        />
        <Artwork
          src="assets/compartilhados/brand-dark.svg"
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
        <span className="menu-icon" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>
    </header>
  );
}
