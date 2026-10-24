import { Fragment } from 'react';
import {
  color,
  fontWeight,
  tracking,
  rem,
  TYPE_TOKENS,
  type DesignBlock,
  type SectionData,
  type Style,
} from '@/lib/figma/design';
import { Title } from '@/components/ui/title';

/** Typography adapter only. Actions, QR cards and feature titles belong to their sections. */
export function TextBlock({ block, section }: { block: DesignBlock; section: SectionData }) {
  const flowCopy = section.id === 'conversa';
  const text = block.runs.map((run) => run.text.trim()).join(' ');
  const x = Math.min(...block.runs.map((run) => run.origin?.[0] ?? run.x));
  const y = Math.min(...block.runs.map((run) => run.origin?.[1] ?? run.y - run.size * 0.85));
  const classes = [
    'text-block',
    flowCopy && 'flow-copy',
    flowCopy && `flow-copy--${block.role}`,
    block.role === 'label' && 'section-label',
  ]
    .filter(Boolean)
    .join(' ');
  const content = (
    <>
      {block.runs.map((run, index) => {
        const style: Style = {
          left: run.x - x,
          top: run.y - y - run.size * 0.85,
          '--run-size': TYPE_TOKENS[run.size]
            ? `var(--text-${TYPE_TOKENS[run.size]})`
            : rem(run.size),
          fontWeight: block.role === 'label' ? 'var(--weight-semibold)' : fontWeight(run.weight),
          fontStyle: run.italic ? 'italic' : 'normal',
          letterSpacing: tracking(run.tracking),
          color: color(run.color),
        };
        if (run.origin)
          Object.assign(style, {
            transformOrigin: `${run.origin[0] - run.x}px ${run.origin[1] - run.y + run.size * 0.85}px`,
            transform: `rotate(${run.angle}deg)`,
          });
        return (
          <Fragment key={index}>
            <span className="text-run" style={style} data-size={run.size}>
              {run.text.replaceAll('[', '{').replaceAll(']', '}')}
            </span>{' '}
          </Fragment>
        );
      })}
    </>
  );
  if (block.role === 'h1' || block.role === 'h2' || block.role === 'h3')
    return (
      <Title
        as={block.role}
        variant="figma"
        className={classes}
        data-source={block.source}
        data-role={block.role}
      >
        {content}
      </Title>
    );
  const Tag = text.startsWith('“') ? 'blockquote' : 'p';
  return (
    <Tag className={classes} data-source={block.source} data-role={block.role}>
      {content}
    </Tag>
  );
}
