import { DOMParser, XMLSerializer } from '@xmldom/xmldom';

const elements = (node) =>
  Array.from(node.childNodes ?? []).filter((child) => child.nodeType === 1);
function visit(node, callback) {
  callback(node);
  for (const child of elements(node)) visit(child, callback);
}
function references(node, skipDefs = false) {
  const found = new Set();
  const inspect = (value) => {
    for (const match of value.matchAll(/url\(\s*['"]?#([^\s)'";]+)['"]?\s*\)/g))
      found.add(match[1]);
  };
  function walk(element) {
    if (skipDefs && element.localName === 'defs') return;
    for (const attribute of Array.from(element.attributes ?? [])) {
      if (attribute.localName === 'href' && attribute.value.startsWith('#'))
        found.add(attribute.value.slice(1));
      inspect(attribute.value);
    }
    if (element.localName === 'style') inspect(element.textContent);
    for (const child of elements(element)) walk(child);
  }
  walk(node);
  return found;
}

/** Preserve the painted SVG tree and the complete dependency graph of its definitions. */
export function pruneSvgDefs(source) {
  const doc = new DOMParser().parseFromString(source, 'image/svg+xml');
  if (doc.documentElement.localName !== 'svg') throw new Error('Expected SVG artwork');
  const definitions = Array.from(doc.getElementsByTagName('defs')).flatMap(elements);
  const owners = new Map();
  for (const definition of definitions) {
    visit(definition, (node) => {
      if (node.hasAttribute('id')) owners.set(node.getAttribute('id'), definition);
    });
  }
  const keep = new Set();
  const pending = [...references(doc.documentElement, true)];
  // Styles can affect the painted tree without being referenced by an ID.
  for (const definition of definitions) {
    if (definition.localName === 'style' || !definition.hasAttribute('id')) {
      keep.add(definition);
      pending.push(...references(definition));
    }
  }
  while (pending.length) {
    const definition = owners.get(pending.pop());
    if (!definition || keep.has(definition)) continue;
    keep.add(definition);
    pending.push(...references(definition));
  }
  let removedDefinitions = 0;
  for (const definition of definitions) {
    if (keep.has(definition)) continue;
    definition.parentNode.removeChild(definition);
    removedDefinitions++;
  }
  for (const defs of Array.from(doc.getElementsByTagName('defs'))) {
    if (!elements(defs).length) defs.parentNode.removeChild(defs);
  }
  return { svg: new XMLSerializer().serializeToString(doc), removedDefinitions };
}
