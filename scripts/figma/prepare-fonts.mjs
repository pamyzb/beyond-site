import { mkdir, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import woff2 from 'wawoff2';
import { writeGeneratedFile } from './write-generated-file.mjs';

export async function prepareFonts(root) {
  const source = path.join(root, 'public/assets/fonts');
  const destination = path.join(root, 'public/assets/generated/fonts');
  await mkdir(destination, { recursive: true });
  const report = [];
  for (const filename of (await readdir(source))
    .filter((name) => /^poppins-\d+-(normal|italic)\.ttf$/.test(name))
    .sort()) {
    const input = await readFile(path.join(source, filename));
    const output = Buffer.from(await woff2.compress(input));
    const name = filename.replace(/\.ttf$/, '.woff2');
    await writeGeneratedFile(path.join(destination, name), output);
    report.push({ name, sourceBytes: input.length, outputBytes: output.length });
  }
  return report;
}
