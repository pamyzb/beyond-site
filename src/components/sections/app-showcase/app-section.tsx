import type { SectionData } from '@/lib/figma/design';
import { SectionShell } from '@/components/sections/shared/section-shell';
import { FigmaSectionHeading } from '@/components/sections/shared/figma-section-heading';
import { TextBlock } from '@/components/sections/shared/text-block';
import { AppArtwork } from './app-artwork';
import { AppFeatureCard } from './app-feature-card';
import { AppFeatureTitle } from './app-feature-title';
import { AppQrCard } from './app-qr-card';
export function AppSection({
  section,
  artwork,
}: {
  section: SectionData;
  artwork: Record<string, string>;
}) {
  return (
    <SectionShell section={section}>
      <AppArtwork svg={artwork['aplicativo-bleed']} className="figma-art bleed-art" />
      <AppArtwork
        svg={artwork['aplicativo-light-bleed']}
        className="figma-art app-light-art bleed-art"
      />
      <div className="section-content section-content--aplicativo">
        <FigmaSectionHeading section={section} />
        {(['container1', 'container 2'] as const).map((source) => {
          const project = source === 'container1';
          const blocks = section.blocks.filter((block) => block.ancestors.includes(source));
          const title = blocks.find(
            (block) => block.role === 'h3' && !block.ancestors.includes('qrcode-cta'),
          );
          const qr = blocks.find((block) => block.ancestors.includes('qrcode-cta'));
          const copy = (
            <div className="app-feature-copy">
              {title && <AppFeatureTitle block={title} project={project} />}
              {blocks
                .filter((block) => block !== title && block !== qr)
                .map((block) => (
                  <TextBlock key={block.source} block={block} section={section} />
                ))}
              {qr && <AppQrCard source={qr.source} />}
            </div>
          );
          const image = (
            <AppArtwork
              svg={artwork[project ? 'phone-project' : 'phone-cases']}
              className="component-art"
            />
          );
          return (
            <AppFeatureCard key={source} source={source}>
              {project ? (
                <>
                  {image}
                  {copy}
                </>
              ) : (
                <>
                  {copy}
                  {image}
                </>
              )}
            </AppFeatureCard>
          );
        })}
      </div>
    </SectionShell>
  );
}
