import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { DrawValueHighlights } from '../src/components/DrawValueHighlights';
test('shared numeric amounts get gold effects but pending labels remain static', () => {
 const amounts=renderToStaticMarkup(createElement(DrawValueHighlights,{entry:'1p',prize:'£1,000'}));
 assert.equal((amounts.match(/class="draw-gold-amount"/g)||[]).length,2);
 const pending=renderToStaticMarkup(createElement(DrawValueHighlights));
 assert.doesNotMatch(pending,/draw-gold-amount/);
});
test('headline flames are decorative and reduced-motion can disable effects', () => {
 const css=readFileSync(new URL('../src/index.css',import.meta.url),'utf8');
 assert.match(css,/headline-gold-flames::before/); assert.match(css,/pointer-events:none/);
 assert.match(css,/headline-gold-flames::before \{ animation:none; display:none/);
});
