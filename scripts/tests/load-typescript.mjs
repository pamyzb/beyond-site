import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = fileURLToPath(new URL('../../', import.meta.url));
const cache = new Map();

/** Load pure TypeScript source in Node tests without a second test runtime. */
export function loadTypeScript(relativePath) {
  const filename = path.resolve(root, relativePath);
  if (cache.has(filename)) return cache.get(filename);
  const module = { exports: {} };
  cache.set(filename, module.exports);
  const nativeRequire = createRequire(filename);
  const require = (specifier) => {
    if (specifier.startsWith('@/')) return loadTypeScript(`src/${specifier.slice(2)}.ts`);
    if (specifier.startsWith('.'))
      return loadTypeScript(
        path.relative(root, path.resolve(path.dirname(filename), `${specifier}.ts`)),
      );
    return nativeRequire(specifier);
  };
  const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: filename,
  });
  new Function('module', 'exports', 'require', outputText)(module, module.exports, require);
  return module.exports;
}
