import type { ReactNode } from 'react';



export function SectionHeading({ label, title, subtitle }: { label: string; title: ReactNode; subtitle?: string }) {
  return <header className="section-heading">
    <p className="section-heading-label"><span>{label}</span><span className="section-heading-icon" aria-hidden="true" /></p>
    <div><h2 className="section-heading-title">{title}</h2>{subtitle && <p className="section-heading-subtitle">{subtitle}</p>}</div>
  </header>;
}


