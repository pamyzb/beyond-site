import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { DOMParser } from '@xmldom/xmldom';
import { normalizePhoneScreens } from './normalize-phone-screens.mjs';

for (const name of ['phone-project', 'phone-cases', 'aplicativo-bleed', 'aplicativo-light-bleed']) {
  test(`${name}: phone content keeps its placement without transforming nested SVG viewports`, async () => {
    const source = await readFile(
      new URL(`../../public/assets/figma/${name}.svg`, import.meta.url),
      'utf8',
    );
    const parse = (svg) =>
      new DOMParser().parseFromString(svg.replace(/^\uFEFF/, ''), 'image/svg+xml');
    const screens = (doc) =>
      Array.from(doc.getElementsByTagName('svg')).filter((node) =>
        node.hasAttribute('data-screen-source'),
      );
    const original = screens(parse(source));
    const output = normalizePhoneScreens(source);
    const result = screens(parse(output));
    assert.ok(original.length > 0);
    assert.equal(result.length, original.length);
    result.forEach((screen, index) => {
      assert.equal(screen.hasAttribute('transform'), false);
      assert.equal(screen.parentNode.localName, 'g');
      assert.equal(
        screen.parentNode.getAttribute('transform'),
        original[index].getAttribute('transform'),
      );
      for (const attribute of ['width', 'height', 'viewBox', 'overflow', 'data-screen-source']) {
        assert.equal(screen.getAttribute(attribute), original[index].getAttribute(attribute));
      }
      assert.equal(screen.childNodes.length, original[index].childNodes.length);
      assert.equal(screen.textContent, original[index].textContent);
    });
    const ids = (doc) =>
      Array.from(doc.getElementsByTagName('*'))
        .filter((node) => node.hasAttribute('id'))
        .map((node) => node.getAttribute('id'));
    assert.deepEqual(
      ids(parse(output)),
      ids(parse(source)),
      'preserves clip and animation references',
    );
    assert.equal(normalizePhoneScreens(output), output, 'does not add wrappers on repeated builds');
  });
}
