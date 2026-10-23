import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LuxePlayingCard } from '../src/components/LuxePlayingCard';
import { readFileSync } from 'node:fs';
test('Luxe deck displays branded backs and accessible face-up ranks', () => {
  const back = renderToStaticMarkup(createElement(LuxePlayingCard, { hidden: true }));
  assert.match(back, /LUXE/); assert.match(back, /POKER/); assert.match(back, /Face-down Luxe card/);
  const face = renderToStaticMarkup(createElement(LuxePlayingCard, { card: { rank: 'A', suit: '♥' } as any }));
  assert.match(face, /A ♥/); assert.match(face, /luxe-playing-card--red/);
});
test('player cards sit above seats and portrait phones get rotation gate', () => {
  const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
  assert.match(css, /poker-live-hand \{ top:57%; left:50%; z-index:100/);
  assert.match(css, /poker-playing-page \.poker-playing-wrap \{ visibility:hidden/);
});
