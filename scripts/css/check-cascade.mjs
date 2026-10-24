import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';

const root = fileURLToPath(new URL('../../', import.meta.url));
const files = new Map();
const rules = [];
async function collect(filename, context, channel, imports = []) {
  if (imports.includes(filename)) throw new Error(`Circular CSS import: ${filename}`);
  if (files.has(filename))
    throw new Error(`Review repeated CSS import before consolidating: ${filename}`);
  const tree = postcss.parse(await readFile(filename, 'utf8'), { from: filename });
  files.set(filename, tree);
  async function walk(parent, conditions) {
    for (const node of parent.nodes ?? []) {
      if (node.type === 'atrule' && node.name === 'import' && /^['"]\./.test(node.params)) {
        const match = node.params.match(/^(['"])(\.[^'"]+)\1$/);
        if (!match)
          throw new Error(`Review qualified import before checking cascade: ${node.params}`);
        await collect(path.resolve(path.dirname(filename), match[2]), conditions, channel, [
          ...imports,
          filename,
        ]);
      } else if (node.type === 'atrule' && !/keyframes$/.test(node.name)) {
        await walk(node, [...conditions, `@${node.name} ${node.params}`]);
      } else if (node.type === 'rule') {
        rules.push({
          node,
          filename,
          context: JSON.stringify([channel, conditions, node.selector]),
        });
        // Nested selectors must be resolved before any automatic consolidation.
      }
    }
  }
  await walk(tree, context);
}
await collect(path.join(root, 'src/app/globals.css'), [], 'global');
await collect(path.join(root, 'src/components/layout/footer/footer-runner.css'), [], 'footer');
await collect(path.join(root, 'src/app/design-system/page.module.css'), [], 'design-system-module');

const seen = new Set();
const duplicates = [];
for (const rule of [...rules].reverse()) {
  for (const declaration of [...rule.node.nodes].reverse()) {
    if (declaration.type !== 'decl') continue;
    const key = JSON.stringify([
      rule.context,
      declaration.prop,
      declaration.value,
      !!declaration.important,
    ]);
    if (seen.has(key)) duplicates.push({ ...rule, declaration });
    seen.add(key);
  }
}

if (process.argv.includes('--fix')) {
  const changed = new Set();
  for (const { node, filename, declaration } of duplicates) {
    declaration.remove();
    if (!node.nodes.length) node.remove();
    changed.add(filename);
  }
  for (const filename of changed) await writeFile(filename, files.get(filename).toString());
  console.log(
    `Removed ${duplicates.length} identical overridden declarations in ${changed.size} files; rule order and differing fallbacks preserved.`,
  );
} else {
  for (const { filename, declaration } of duplicates) {
    console.error(
      `${path.relative(root, filename)}:${declaration.source.start.line} redundant ${declaration.prop}: ${declaration.value}`,
    );
  }
  if (duplicates.length) process.exitCode = 1;
  else console.log('No identical overridden declarations in the checked cascades.');
}
