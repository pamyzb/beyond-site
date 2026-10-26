import type { SectionData } from '@/lib/figma/design';
import { SectionShell } from '@/components/sections/shared/section-shell';
import { FigmaSectionHeading } from '@/components/sections/shared/figma-section-heading';
import { ReflowArtwork } from '@/components/ui/artwork';
import { ConversationArtwork } from '@/components/sections/conversation/conversation-artwork';
import { ContactForm } from './contact-form';
export function ContactSection({ section, artwork }: { section: SectionData; artwork: string }) {
  return (
    <SectionShell section={section}>
      <ConversationArtwork svg={artwork} variant="contact" />
      <div className="section-content section-content--contato">
        <FigmaSectionHeading section={section} />
        <ContactForm />
        <ReflowArtwork name="contato-bleed" />
      </div>
    </SectionShell>
  );
}
