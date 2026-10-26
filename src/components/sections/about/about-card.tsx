import type { SectionData } from '@/lib/figma/design';
import type { ReactNode } from 'react';
import { Title } from '@/components/ui/title';

export function AboutCard({
  id,
  section,
  icon,
  content,
}: {
  id?: string;
  section?: SectionData;
  icon: ReactNode;
  content?: { title: string; description: string };
}) {
  const blocks = section?.blocks.filter((block) => id && block.ancestors.includes(id)) ?? [];
  const title = blocks.find((block) => block.role === 'h3');
  const copy = blocks.filter((block) => block.role === 'p');
  return (
    <article className="about-panel-card" data-source={id}>
      <div className="about-card-body">
        {typeof icon === 'string' ? (
          <div
            className="about-icon"
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: icon }}
          />
        ) : (
          <div className="about-icon about-icon--lucide" aria-hidden="true">
            <span className="about-icon-surface">{icon}</span>
          </div>
        )}
        {(content || title) && (
          <Title as="h3" variant="figma" className="about-card-title">
            {content?.title ?? title?.runs.map((run) => run.text.trim()).join(' ')}
          </Title>
        )}
        {content && <p className="about-card-copy">{content.description}</p>}
        {copy.map((block) => (
          <p className="about-card-copy" key={block.source}>
            {block.runs.map((run) => run.text.trim()).join(' ')}
          </p>
        ))}
      </div>
    </article>
  );
}
