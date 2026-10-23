import { forwardRef, type ComponentPropsWithoutRef, type ElementType } from 'react';

export type TitleVariant = 'section' | 'service' | 'case' | 'case-demo' | 'blog-card' | 'faq' | 'metrics-label' | 'metric-stat' | 'success' | 'figma' | 'hero' | 'app-feature' | 'client-heading' | 'tooltip';
type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
type TitleProps = ComponentPropsWithoutRef<'h2'> & { as?: HeadingTag; variant: TitleVariant };

/**
 * Shared semantic heading primitive. Variants preserve the current visual
 * treatments while keeping hierarchy and typography in one component API.
 */
export const Title = forwardRef<HTMLHeadingElement, TitleProps>(function Title(
  { as: Tag = 'h2', variant, className, ...props },
  ref,
) {
  const Component = Tag as ElementType;
  return <Component ref={ref} className={['title', `title--${variant}`, className].filter(Boolean).join(' ')} {...props} />;
});
