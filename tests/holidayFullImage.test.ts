import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LuxuryHolidaysSection } from '../src/components/LuxuryHolidaysSection';
import { readFileSync } from 'node:fs';
test('holiday cards use full-bleed destination photos and retain disclosures', () => {
  const html = renderToStaticMarkup(createElement(LuxuryHolidaysSection));
  assert.match(html, /deck-card__bg/);
  assert.match(html, /deck-card__shade/);
  assert.match(html, /Santorini/);
  assert.match(html, /Approval pending/);
  assert.match(html, /Proposed total package value/);
  const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
  assert.match(css, /\.deck-card__bg \{ position:absolute; inset:0; width:100%; height:100%/);
    assert.doesNotMatch(css, /coverflow-holiday > img \{ height:12rem/);
});

test('whole holiday card stays bright without text-area darkening sheet', () => {
 const css=readFileSync(new URL('../src/index.css',import.meta.url),'utf8');
 assert.match(css,/luxury-holidays \.holiday-card-copy \{ background:transparent; border-top:0/);
 assert.doesNotMatch(css,/background:linear-gradient\(#080603a8,#080603e8\)/);
});
