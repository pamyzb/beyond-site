import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { loadTypeScript } from './load-typescript.mjs';

const { casesContent } = loadTypeScript('src/data/cases.ts');
const { servicesContent } = loadTypeScript('src/data/services.ts');
const { sections } = JSON.parse(
  readFileSync(new URL('../../figma-layout.json', import.meta.url), 'utf8'),
);

test('case and service copy is independent of Figma export block order', () => {
  for (const [id, adapt] of [
    ['cases', casesContent],
    ['servicos', servicesContent],
  ]) {
    const section = sections.find((section) => section.id === id);
    const shuffled = { ...section, blocks: [...section.blocks].reverse() };
    assert.deepEqual(adapt(shuffled), adapt(section));
  }
  const cases = casesContent(sections.find((section) => section.id === 'cases'));
  assert.deepEqual(cases.names, ['Institut Pasteur', 'Starlog', 'Ayalla']);
  assert.equal(cases.projects[0].author, 'Natália Miranda, CEO Institut Pasteur');
  assert.equal(cases.cta, 'Explorar case');
  assert.equal(
    servicesContent(sections.find((section) => section.id === 'servicos')).cards.length,
    3,
  );
});

test('missing required content fails during build instead of publishing misplaced copy', () => {
  const section = sections.find((section) => section.id === 'cases');
  assert.throws(
    () =>
      casesContent({
        ...section,
        blocks: section.blocks.filter((block) => block.source !== 'Heading 4'),
      }),
    /Missing Figma block/,
  );
});
