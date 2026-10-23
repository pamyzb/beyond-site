import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'default' | 'primary' | 'primary-blue' | 'primary-lime' | 'secondary' | 'secondary-dark' | 'secondary-white' | 'tertiary-dark' | 'tertiary-white';

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: ButtonVariant };

export function ButtonLink({className='',children,variant='default',...props}:ButtonLinkProps) {
  const variantClass: Record<ButtonVariant,string> = {
    default:'', primary:'button-lime', 'primary-blue':'button-primary-blue', 'primary-lime':'button-lime',
    secondary:'button-secondary', 'secondary-dark':'button-secondary-dark', 'secondary-white':'button-secondary-white',
    'tertiary-dark':'button-tertiary-dark', 'tertiary-white':'button-tertiary-white',
  };
  return <a className={`button inline-flex min-h-[var(--control-height)] items-center justify-center rounded-pill border-0 px-6 py-3 text-base font-medium leading-6 ${variantClass[variant]} ${className}`} {...props}><span className="button-label">{children}</span></a>;
}

export function Button({className='',children,variant='default',...props}:ButtonHTMLAttributes<HTMLButtonElement> & {variant?:ButtonVariant}) {
  const variantClass: Record<ButtonVariant,string> = {default:'',primary:'button-lime','primary-blue':'button-primary-blue','primary-lime':'button-lime',secondary:'button-secondary','secondary-dark':'button-secondary-dark','secondary-white':'button-secondary-white','tertiary-dark':'button-tertiary-dark','tertiary-white':'button-tertiary-white'};
  return <button className={`button inline-flex min-h-[var(--control-height)] items-center justify-center rounded-pill border-0 px-6 py-3 text-base font-medium leading-6 transition-[filter] duration-150 ${variantClass[variant]} ${className}`} {...props}><span className="button-label">{children}</span></button>;
}
