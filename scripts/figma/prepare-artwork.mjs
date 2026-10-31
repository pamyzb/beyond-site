import { readFile, mkdir, realpath, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractRasterAssets } from './raster-assets.mjs';
import { stripSharedSvgFonts } from './shared-fonts.mjs';
import { prepareFonts } from './prepare-fonts.mjs';
import { pruneSvgDefs } from './prune-svg-defs.mjs';
import { writeGeneratedFile } from './write-generated-file.mjs';
import { processFragments } from './process-fragments.mjs';
import { normalizePhoneScreens } from './normalize-phone-screens.mjs';
import { annotateArtworkRoles } from './artwork-roles.mjs';
import { replaceConversationPhotos } from './conversation-photos.mjs';
import { replaceAppScreens } from './replace-app-screens.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
if (process.argv.includes('--clean-export')) {
  // Next's exporter may retain assets removed from public between builds.
  const output = path.resolve(root, 'out');
  const resolved = await realpath(output).catch((error) => {
    if (error.code === 'ENOENT') return output;
    throw error;
  });
  if (path.dirname(resolved) !== root || path.basename(resolved) !== 'out') {
    throw new Error(`Refusing to clean an export outside the project: ${resolved}`);
  }
  await rm(output, { recursive: true, force: true });
}
const inputs = JSON.parse(await readFile(path.join(root, 'src/data/artwork-files.json'), 'utf8'));
const sharedFonts = await Promise.all(
  [400, 600, 700].map(async (weight) => ({
    family: 'Poppins',
    weight: String(weight),
    style: 'normal',
    bytes: await readFile(path.join(root, 'public/assets/fonts', `poppins-${weight}-normal.ttf`)),
  })),
);
const generated = path.join(root, '.generated/artwork');
const raster = path.join(root, 'public/assets/generated');
await Promise.all([mkdir(generated, { recursive: true }), mkdir(raster, { recursive: true })]);
const fontReport = await prepareFonts(root);
await writeGeneratedFile(
  path.join(root, '.generated/font-report.json'),
  JSON.stringify(fontReport, null, 2),
);
const heroSource = await readFile(
  path.join(root, 'public/assets/inicio/inicio-glass-bleed-no-cta-orphan-arrow.svg'),
  'utf8',
);
const hero = pruneSvgDefs(heroSource);
await writeGeneratedFile(path.join(raster, 'hero-background.svg'), hero.svg);
await writeGeneratedFile(
  path.join(root, '.generated/hero-background-report.json'),
  JSON.stringify(
    {
      sourceBytes: Buffer.byteLength(heroSource),
      outputBytes: Buffer.byteLength(hero.svg),
      removedDefinitions: hero.removedDefinitions,
    },
    null,
    2,
  ),
);
const uniqueAssets = new Map();
const appScreens = Object.fromEntries(
  await Promise.all(
    ['CORRETO1', 'CORRETO2'].map(async (name) => [
      name,
      await readFile(path.join(root, 'public/assets/aplicativo', name), 'utf8'),
    ]),
  ),
);
let sharedFontFaces = 0;
for (const [key, input] of Object.entries(inputs)) {
  let source = await readFile(path.join(root, 'public', input), 'utf8');
  source = replaceAppScreens(source, appScreens);
  if (key === 'conversation') source = pruneSvgDefs(replaceConversationPhotos(source)).svg;
  const shared = stripSharedSvgFonts(source, sharedFonts);
  sharedFontFaces += shared.removedFonts;
  const result = extractRasterAssets(normalizePhoneScreens(annotateArtworkRoles(key, shared.svg)));
  if (key === 'process') {
    await writeGeneratedFile(
      path.join(root, '.generated/process-fragments.json'),
      JSON.stringify(processFragments(result.svg)),
    );
  }
  await writeGeneratedFile(path.join(generated, `${key}.svg`), result.svg);
  for (const [filename, bytes] of result.assets) uniqueAssets.set(filename, bytes);
}
await Promise.all(
  [...uniqueAssets].map(([filename, bytes]) =>
    writeGeneratedFile(path.join(raster, filename), bytes),
  ),
);
console.log(
  `Prepared ${Object.keys(inputs).length} inline SVGs; ${uniqueAssets.size} shared raster assets; ${sharedFontFaces} font faces reuse document fonts.`,
);
