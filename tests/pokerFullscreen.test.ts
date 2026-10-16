import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { PokerFullscreen } from '../src/components/PokerFullscreen';
test('fullscreen is offered through explicit user action and includes rotate guidance', () => {
  const html = renderToStaticMarkup(createElement(PokerFullscreen));
  assert.match(html, /Enter full-screen table/);
  assert.match(html, /Turn your phone sideways/);
  assert.match(html, /type="button"/);
});
test('fullscreen supports exit and safe browser fallback without remounting gameplay', () => {
  const source = readFileSync(new URL('../src/components/PokerFullscreen.tsx', import.meta.url), 'utf8');
  assert.match(source, /table.requestFullscreen\(\)/);
  assert.match(source, /document.exitFullscreen\(\)/);
  assert.match(source, /Fullscreen is unavailable/);
  assert.match(source, /fullscreenchange/);
  const game = readFileSync(new URL('../src/components/LuxePokerLeague.tsx', import.meta.url), 'utf8');
  assert.match(game, /<PokerFullscreen \/>/);
});
