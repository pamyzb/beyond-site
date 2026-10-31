import { usePathname } from 'next/navigation';
import { HEADER_NAVIGATION, HEADER_ACTION } from '@/data/navigation';
import { LanguageSelector } from '@/components/layout/header/language-selector';
import { ScrollTrigger } from '@/lib/animation/gsap';

export function HeaderNavigation({ onNavigate }: { onNavigate: () => void; homePath?: string }) {
  const pathname = usePathname();
  return (
    <nav
      className="desktop-nav"
      id="mobile-navigation"
      aria-label="Navegação principal"
      onClick={(event) => {
        const link = (event.target as Element).closest<HTMLAnchorElement>('a');
        if (!link) return;
        onNavigate();
        if (
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          !matchMedia('(max-width: 70.624em)').matches
        )
          return;
        const destination = new URL(link.href);
        if (
          destination.origin !== location.origin ||
          destination.pathname !== location.pathname ||
          !destination.hash
        )
          return;
        const target = document.getElementById(decodeURIComponent(destination.hash.slice(1)));
        if (!target) return;
        event.preventDefault();
        // Resolve pin spacers before jumping; refreshes can interrupt native smooth scrolling.
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();
          // Refresh restores its saved scroll position on the next frame.
          requestAnimationFrame(() => {
            if (location.hash !== destination.hash) history.pushState(null, '', destination.hash);
            target.scrollIntoView({ behavior: 'instant', block: 'start' });
            ScrollTrigger.update();
          });
        });
      }}
    >
      <svg
        className="menu-background-mark"
        viewBox="136 6670.59 676 613"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <path
          pathLength="1"
          d="M775.276 6513.25H-53.123C-73.4918 6513.25 -89.8477 6529.76 -89.8477 6549.98V6550.98H-90V7378.52C-90 7398.89 -73.4975 7415.25 -53.2764 7415.25H172.457C192.826 7415.25 209.181 7398.74 209.181 7378.52V7152.75C209.181 7131.27 226.584 7114.02 247.904 7114.02H407.812C465.638 7114.02 512.361 7160.9 512.361 7218.59V7378.52C512.361 7398.89 528.864 7415.25 549.085 7415.25H775.276C795.645 7415.25 812 7398.74 812 7378.52V7152.75C812 7132.38 795.497 7116.02 775.276 7116.02H615.217C557.545 7116.02 510.667 7069.29 510.667 7011.45V6851.36C510.667 6829.88 528.07 6812.63 549.391 6812.63H775.276C795.645 6812.63 812 6796.13 812 6775.9V6549.98C812 6529.76 795.495 6513.25 775.276 6513.25Z"
        />
      </svg>
      <div className="header-nav-center">
        <div className="header-nav-links">
          <a
            className={`action-link header-nav-link${pathname === '/' ? ' header-home-responsive' : ''}`}
            href="/"
            aria-current={pathname === '/' ? 'page' : undefined}
          >
            <span className="menu-ink">
              Home
              <span className="menu-bracket menu-bracket-left" aria-hidden="true" />
              <span className="menu-bracket menu-bracket-right" aria-hidden="true" />
              <svg
                className="menu-scribble"
                viewBox="0 0 100 12"
                preserveAspectRatio="none"
                aria-hidden="true"
                focusable="false"
              >
                <path pathLength="1" d="M3 7 C22 2 65 2 96 4 C78 5 41 7 20 9 C44 7 72 8 92 9" />
              </svg>
            </span>
          </a>
          {HEADER_NAVIGATION.map((item) => {
            const { label } = item;
            return (
              <a
                key={label}
                className="action-link header-nav-link"
                href={'href' in item ? item.href : undefined}
                aria-disabled={'href' in item ? undefined : true}
                aria-label={label}
                aria-current={
                  'href' in item && pathname.replace(/\/$/, '') === item.href.replace(/\/$/, '')
                    ? 'page'
                    : undefined
                }
              >
                <span className="menu-ink">
                  {label}
                  <span className="menu-bracket menu-bracket-left" aria-hidden="true" />
                  <span className="menu-bracket menu-bracket-right" aria-hidden="true" />
                  <svg
                    className="menu-scribble"
                    viewBox="0 0 100 12"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path pathLength="1" d="M3 7 C22 2 65 2 96 4 C78 5 41 7 20 9 C44 7 72 8 92 9" />
                  </svg>
                </span>
              </a>
            );
          })}
        </div>
      </div>
      <div className="header-nav-actions">
        <LanguageSelector />
        {
          <a className="button header-cta" href={HEADER_ACTION.href}>
            <span className="button-label">{HEADER_ACTION.label}</span>
            <img
              className="button-icon"
              src="/assets/compartilhados/header-button-arrow.svg"
              width={18}
              height={18}
              alt=""
            />
          </a>
        }
      </div>
    </nav>
  );
}
