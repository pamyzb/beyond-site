import type { SectionData } from '@/lib/figma/design';
import { sectionHeading, blockText } from '@/lib/figma/content';
import { SectionHeading } from '@/components/ui/section-heading';
import { HeadingRuns } from '@/components/ui/heading-runs';
export function FigmaSectionHeading({ section }: { section: SectionData }) {
  const { label, title, subtitle } = sectionHeading(section);
  if (!label || !title) return null;
  return (
    <SectionHeading
      className={`${section.id}-section-heading`}
      label={blockText(label)}
      title={<HeadingRuns runs={title.runs} />}
      subtitle={subtitle ? blockText(subtitle) : undefined}
    />
  );
}
