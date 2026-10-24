import type { SectionData } from '@/lib/figma/design';
import { SectionShell } from '@/components/sections/shared/section-shell';
import { FigmaSectionHeading } from '@/components/sections/shared/figma-section-heading';
import { TestimonialCarousel } from './testimonial-carousel';
export function TestimonialsSection({ section }: { section: SectionData }) {
  return (
    <SectionShell section={section}>
      <div className="section-content section-content--depoimentos">
        <FigmaSectionHeading section={section} />
        <TestimonialCarousel section={section} />
      </div>
    </SectionShell>
  );
}
