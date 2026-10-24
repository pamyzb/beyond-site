import type { SectionData } from '@/lib/figma/design';
import { SectionShell } from '@/components/sections/shared/section-shell';
import { FigmaSectionHeading } from '@/components/sections/shared/figma-section-heading';
import { ReflowArtwork } from '@/components/ui/artwork';
import { ConversationArtwork } from '@/components/sections/conversation/conversation-artwork';
import { FaqAccordion } from './faq-accordion';
export function FaqSection({ section, artwork }: { section: SectionData; artwork: string }) {
  return (
    <SectionShell section={section}>
      <ConversationArtwork svg={artwork} variant="faq" />
      <div className="section-content section-content--faq">
        <FigmaSectionHeading section={section} />
        <div className="faq-content-row">
          <ReflowArtwork name="faq-team" className="faq-team-art" />
          <FaqAccordion />
        </div>
      </div>
    </SectionShell>
  );
}
