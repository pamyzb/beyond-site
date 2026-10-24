import layout from '../../figma-layout.json';
import type { DesignData } from '@/lib/figma/design';
export const siteSections = (layout as DesignData).sections;
export function siteSection(id: string) {
  const section = siteSections.find((section) => section.id === id);
  if (!section) throw new Error(`Missing site section: ${id}`);
  return section;
}
