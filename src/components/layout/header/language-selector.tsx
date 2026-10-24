'use client';
import { useEffect, useRef, useState } from 'react';

export function LanguageSelector() {
  const [language, setLanguage] = useState<'pt' | 'en'>('pt');
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const options = useRef<(HTMLButtonElement | null)[]>([]);
  const initialFocus = useRef(0);
  useEffect(() => {
    if (!open) return;
    // The hero masks the header. Render in the browser's top layer to escape that mask.
    const position = () => {
      const bounds = trigger.current?.getBoundingClientRect();
      if (!bounds || !popup.current) return;
      const unit = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const width = popup.current.getBoundingClientRect().width || 6.75 * unit;
      popup.current.style.top = `${bounds.bottom + 0.5 * unit}px`;
      popup.current.style.left = `${Math.max(0.75 * unit, Math.min(bounds.right - width, window.innerWidth - width - 0.75 * unit))}px`;
    };
    popup.current?.showPopover();
    position();
    options.current[initialFocus.current]?.focus();
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    window.addEventListener('resize', position);
    window.addEventListener('scroll', position, { passive: true });
    return () => {
      document.removeEventListener('pointerdown', outside);
      window.removeEventListener('resize', position);
      window.removeEventListener('scroll', position);
    };
  }, [open]);
  const show = (index: number) => {
    initialFocus.current = index;
    setOpen(true);
  };
  return (
    <div
      ref={root}
      className="header-language"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.stopPropagation();
          setOpen(false);
          trigger.current?.focus();
        }
      }}
    >
      <button
        ref={trigger}
        className="language-trigger"
        type="button"
        aria-label={`Idioma: ${language.toUpperCase()}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? 'language-options' : undefined}
        onClick={() => (open ? setOpen(false) : show(language === 'pt' ? 0 : 1))}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            show(event.key === 'ArrowUp' ? 1 : 0);
          }
        }}
      >
        {language.toUpperCase()}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path
            d="m3 4.5 3 3 3-3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && (
        <div
          ref={popup}
          popover="manual"
          className="language-options"
          id="language-options"
          role="menu"
          aria-label="Idioma"
          onKeyDown={(event) => {
            const index = options.current.indexOf(document.activeElement as HTMLButtonElement);
            const next =
              event.key === 'Home'
                ? 0
                : event.key === 'End'
                  ? 1
                  : event.key === 'ArrowDown'
                    ? (index + 1) % 2
                    : event.key === 'ArrowUp'
                      ? (index + 1) % 2
                      : null;
            if (next !== null) {
              event.preventDefault();
              options.current[next]?.focus();
            }
          }}
        >
          {(['pt', 'en'] as const).map((value, index) => (
            <button
              key={value}
              ref={(element) => {
                options.current[index] = element;
              }}
              type="button"
              role="menuitemradio"
              aria-checked={language === value}
              tabIndex={-1}
              onClick={() => {
                setLanguage(value);
                setOpen(false);
                trigger.current?.focus();
              }}
            >
              {value.toUpperCase()}
              <span aria-hidden="true">{language === value ? '✓' : ''}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
