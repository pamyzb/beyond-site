import type { SectionData } from '@/lib/figma/design';
import { Title } from '@/components/ui/title';

export function AboutCard({
  id,
  section,
  icon,
}: {
  id: string;
  section: SectionData;
  icon: string;
}) {
  const blocks = section.blocks.filter((block) => block.ancestors.includes(id));
  const title = blocks.find((block) => block.role === 'h3');
  const copy = blocks.filter((block) => block.role === 'p');
  return (
    <article className="about-panel-card" data-source={id}>
      <div className="about-card-body">
        <div className="about-icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: icon }} />
        {title && (
          <Title as="h3" variant="figma" className="about-card-title">
            {title.runs.map((run) => run.text.trim()).join(' ')}
          </Title>
        )}
        {copy.map((block) => (
          <p className="about-card-copy" key={block.source}>
            {block.runs.map((run) => run.text.trim()).join(' ')}
          </p>
        ))}
      </div>
    </article>
  );
}
