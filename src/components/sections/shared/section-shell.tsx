import type { ReactNode } from 'react';
import { rem, type SectionData, type Style } from '@/lib/figma/design';
export function SectionShell({ section, children }: { section: SectionData; children: ReactNode }) {
  const Tag = section.id === 'rodape' ? 'footer' : 'section';
  return (
    <Tag
      id={section.id}
      aria-label={section.label}
      data-figma-y={section.y}
      data-motion="section"
      style={{ '--section-height': rem(section.height) } as Style}
      className={`design-section relative isolate overflow-hidden section-${section.id}${section.dark ? ' theme-dark' : ''}`}
    >
      {children}
    </Tag>
  );
}
