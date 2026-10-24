import { readFile, rename, rm, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';

/** Avoid HMR churn and partial asset responses while a development preview is open. */
export async function writeGeneratedFile(filename, value) {
  const bytes = Buffer.isBuffer(value) ? value : Buffer.from(value);
  const previous = await readFile(filename).catch((error) => {
    if (error.code === 'ENOENT') return null;
    throw error;
  });
  if (previous?.equals(bytes)) return;
  const temporary = `${filename}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, bytes);
    await rename(temporary, filename);
  } finally {
    await rm(temporary, { force: true });
  }
}
