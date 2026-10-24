import assert from 'node:assert/strict';
import test from 'node:test';
import { stripSharedSvgFonts } from './shared-fonts.mjs';

const bytes = Buffer.from('identical-local-font');
const font = { family: 'Poppins', weight: '400', style: 'normal', bytes };
const face = (data = bytes, extra = '') =>
  `@font-face{font-family:Poppins;font-weight:400;font-style:normal;src:url(data:font/ttf;base64,${data.toString('base64')});${extra}}`;

test('inline SVG shares only fonts with identical bytes and descriptors', () => {
  const paths = '<path id="phone-outline" d="M0 0L20 20"/>';
  const svg = `<svg><defs><style>${face()}text{fill:blue}${face(Buffer.from('different-font'))}</style></defs>${paths}</svg>`;
  const result = stripSharedSvgFonts(svg, [font]);
  assert.equal(result.removedFonts, 1);
  assert.equal(result.removedBytes, Buffer.byteLength(face()));
  assert.equal(
    result.svg,
    `<svg><defs><style>text{fill:blue}${face(Buffer.from('different-font'))}</style></defs>${paths}</svg>`,
  );
  assert.equal(stripSharedSvgFonts(result.svg, [font]).removedFonts, 0);
});

test('different weights, families and unicode subsets retain their own fonts', () => {
  for (const rule of [
    face().replace('weight:400', 'weight:700'),
    face().replace('family:Poppins', 'family:Other'),
    face(bytes, 'unicode-range:U+0000-00FF;'),
  ]) {
    const svg = `<svg><style>${rule}</style></svg>`;
    assert.equal(stripSharedSvgFonts(svg, [font]).svg, svg);
  }
});

test('removes empty font style elements without changing SVG references', () => {
  const svg = `<svg><defs><style>${face()}</style><clipPath id="clip"><rect width="10"/></clipPath></defs><g clip-path="url(#clip)"/></svg>`;
  assert.equal(stripSharedSvgFonts(svg, [font]).svg, svg.replace(`<style>${face()}</style>`, ''));
});
