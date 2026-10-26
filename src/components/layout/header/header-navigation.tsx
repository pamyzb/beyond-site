import { NAVIGATION, HEADER_ACTION } from '@/data/navigation';
import { LanguageSelector } from '@/components/layout/header/language-selector';
import { ScrollTrigger } from '@/lib/animation/gsap';

export function HeaderNavigation({
  onNavigate,
  homePath = '',
}: {
  onNavigate: () => void;
  homePath?: string;
}) {
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
          !matchMedia('(max-width: 89.999em)').matches
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
      <div className="header-nav-links">
        {NAVIGATION.map(({ label, href }) => {
          return (
            <a
              key={href}
              className="action-link header-nav-link"
              href={href === '#contato' ? href : `${homePath}${href}`}
              aria-label={label}
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
    </nav>
  );
}
