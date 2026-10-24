import type { DesignBlock, SectionData } from './design';
export const blockText = (block: DesignBlock) => block.runs.map((run) => run.text.trim()).join(' ');
export const rawBlockText = (block: DesignBlock) => block.runs.map((run) => run.text).join(' ');
export function sectionHeading(section: SectionData) {
  const blocks = section.blocks.filter((block) =>
    block.ancestors.some((name) => name.startsWith('section-title')),
  );
  return {
    label: blocks.find((block) => block.role === 'label'),
    title: blocks.find((block) => block.role === 'h2'),
    subtitle: blocks.find((block) => block.role === 'p'),
  };
}
/** Stable source identifiers keep copy correct when the exported blocks reorder. */
export function requiredBlock(section: SectionData, source: string) {
  const block = section.blocks.find((block) => block.source === source);
  if (!block) throw new Error(`Missing Figma block ${section.id}/${source}`);
  return block;
}

export function textIn(section: SectionData, ancestor: string, role?: DesignBlock['role']) {
  const block = section.blocks.find(
    (block) => block.ancestors[0] === ancestor && (!role || block.role === role),
  );
  if (!block) throw new Error(`Missing Figma content ${section.id}/${ancestor}`);
  return rawBlockText(block);
}
