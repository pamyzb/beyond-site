import type { ReactNode } from 'react';
import { Title } from '@/components/ui/title';

export function SectionHeading({
  label,
  title,
  subtitle,
  className,
  showIcon = true,
}: {
  label: string;
  title: ReactNode;
  subtitle?: string;
  className?: string;
  showIcon?: boolean;
}) {
  return (
    <header className={['section-heading', className].filter(Boolean).join(' ')}>
      <p className="section-heading-label">
        <span className="section-heading-label-text">{label}</span>
        {showIcon && <span className="section-heading-icon" aria-hidden="true" />}
      </p>
      <Title variant="section" className="section-heading-title">
        {title}
      </Title>
      {subtitle && (
        <p className="section-heading-subtitle" data-motion="section-description">
          {subtitle}
        </p>
      )}
    </header>
  );
}
