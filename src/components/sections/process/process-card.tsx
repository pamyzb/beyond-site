import type { SectionData, Style } from '@/lib/figma/design';
import { Title } from '@/components/ui/title';

type Card = { id: string; x: number; y: number; width: number; height: number };
export function ProcessCard({
  card,
  index,
  section,
  artwork,
}: {
  card: Card;
  index: number;
  section: SectionData;
  artwork: string;
}) {
  // These centres come from the existing green markers in the exported artwork.
  // The number stays semantic HTML while sharing the marker's geometry.
  const stepCenters = [
    [258, 33],
    [271, 41],
    [256, 34],
    [271, 40],
  ] as const;
  const [stepCenterX, stepCenterY] = stepCenters[index];
  const style = {
    '--card-x': `${card.x}px`,
    '--card-y': `${card.y}px`,
    '--card-width': `${card.width}px`,
    '--card-height': `${card.height}px`,
    '--step-center-x': `${stepCenterX}px`,
    '--step-center-y': `${stepCenterY}px`,
    '--process-title-angle': index % 2 ? '3deg' : '-3deg',
    '--hover-angle': index % 2 ? '2deg' : '-2deg',
  } as Style;
  const blocks = section.blocks.filter((block) => block.ancestors.includes(card.id));
  const title = blocks.find((block) => block.role === 'h3');
  const copy = blocks.find(
    (block) =>
      block.role === 'p' &&
      !/^0[1-4]$/.test(
        block.runs
          .map((run) => run.text)
          .join('')
          .trim(),
      ),
  );
  const step = blocks.find(
    (block) =>
      block.role === 'p' &&
      /^0[1-4]$/.test(
        block.runs
          .map((run) => run.text)
          .join('')
          .trim(),
      ),
  );
  return (
    <div className="process-card-entry" data-step={index} style={style}>
      <article className="content-card process-card" data-motion="card" data-source={card.id}>
        <div
          className="process-card-art"
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: artwork }}
        />
        {step && (
          <p className="process-card-step">{step.runs.map((run) => run.text.trim()).join(' ')}</p>
        )}
        {title && (
          <Title as="h3" variant="figma" className="process-card-title">
            {title.runs.map((run) => run.text.trim()).join(' ')}
          </Title>
        )}
        {copy && (
          <p className="process-card-copy">{copy.runs.map((run) => run.text.trim()).join(' ')}</p>
        )}
      </article>
    </div>
  );
}
