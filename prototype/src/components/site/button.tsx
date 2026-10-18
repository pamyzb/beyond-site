import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';

export function ButtonLink({className='',children,...props}:AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a className={`button inline-flex min-h-[var(--control-height)] items-center justify-center rounded-pill border-0 px-6 py-3 text-base font-medium leading-6 ${className}`} {...props}><span className="button-label">{children}</span></a>;
}

export function Button({className='',children,...props}:ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`button inline-flex min-h-[var(--control-height)] items-center justify-center rounded-pill border-0 px-6 py-3 text-base font-medium leading-6 transition-[filter] duration-150 ${className}`} {...props}><span className="button-label">{children}</span></button>;
}
