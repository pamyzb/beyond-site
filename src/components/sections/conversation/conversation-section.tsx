import type { SectionData } from '@/lib/figma/design';
import { WHATSAPP } from '@/data/navigation';
import { SectionShell } from '@/components/sections/shared/section-shell';
import { TextBlock } from '@/components/sections/shared/text-block';
import { ReflowArtwork } from '@/components/ui/artwork';
import { ButtonLink } from '@/components/ui/button';
import { ConversationArtwork } from './conversation-artwork';
export function ConversationSection({
  section,
  artwork,
  overlay,
}: {
  section: SectionData;
  artwork: string;
  overlay: string;
}) {
  return (
    <SectionShell section={section}>
      <ConversationArtwork svg={artwork} />
      <div
        className="conversation-overlay"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: overlay }}
      />
      <div className="section-content section-content--conversa">
        {section.blocks
          .filter((block) => !block.actionBox)
          .map((block) => (
            <TextBlock key={block.source} block={block} section={section} />
          ))}
        <ButtonLink variant="primary-blue" className="conversation-cta" href={WHATSAPP}>
          <img
            className="conversation-cta-icon"
            src="/assets/compartilhados/form-whatsapp.svg"
            width={24}
            height={24}
            alt=""
          />
          Fale com um especialista
        </ButtonLink>
      </div>
      <ReflowArtwork name="conversation-photo" />
    </SectionShell>
  );
}
