import { NAVIGATION, HEADER_ACTION } from '@/data/navigation';
import { LanguageSelector } from '@/components/layout/header/language-selector';

export function HeaderNavigation({ onNavigate }: { onNavigate: () => void }) {
  return (
    <nav
      className="desktop-nav"
      id="mobile-navigation"
      aria-label="Navegação principal"
      onClick={(event) => {
        if ((event.target as Element).closest('a')) onNavigate();
      }}
    >
      <div className="header-nav-links">
        {NAVIGATION.map(({ label, href }) => {
          return (
            <a key={href} className="action-link header-nav-link" href={href} aria-label={label}>
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
            src="/assets/figma/header-button-arrow.svg"
            width={18}
            height={18}
            alt=""
          />
        </a>
      }
    </nav>
  );
}
