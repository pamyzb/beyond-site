import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { Title } from '@/components/ui/title';

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
type SecondarySectionHeadingProps = Omit<ComponentPropsWithoutRef<'header'>, 'title'> & {
  title: ReactNode;
  subtitle?: ReactNode;
  as?: HeadingTag;
};

/**
 * Compact section-heading variation for supporting editorial statements.
 * The heading stays semantically configurable while its visual treatment
 * remains consistent: 40px medium title, accent emphasis and right-aligned copy.
 */
export function SecondarySectionHeading({
  title,
  subtitle,
  as = 'h2',
  className,
  ...props
}: SecondarySectionHeadingProps) {
  return (
    <header
      className={['secondary-section-heading', className].filter(Boolean).join(' ')}
      {...props}
    >
      <Title as={as} variant="section" className="secondary-section-heading-title">
        {title}
      </Title>
      {subtitle && <p className="secondary-section-heading-copy">{subtitle}</p>}
    </header>
  );
}
