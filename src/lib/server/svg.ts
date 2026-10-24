import { readFile } from 'node:fs/promises';
import path from 'node:path';
import files from '@/data/artwork-files.json';

export type ArtworkKey = keyof typeof files;

/** Read generated derivatives only; the original self-contained exports remain untouched. */
export async function readArtwork(key: ArtworkKey) {
  return readFile(path.join(process.cwd(), '.generated/artwork', `${key}.svg`), 'utf8');
}

export const stripSvgXml = (svg: string) => svg.replace(/<\?xml[^>]*\?>/, '');
export const prefixSvgIds = (svg: string, namespace: string) =>
  svg.replace(/(id="|href="#|url\(#)([^"\)]+)/g, `$1${namespace}-$2`);

export async function readNamespacedArtwork(key: ArtworkKey, namespace: string) {
  return prefixSvgIds(stripSvgXml(await readArtwork(key)), namespace);
}
