import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { existsSync, readFileSync } from 'node:fs';
import { PokerTableArtwork } from '../src/components/PokerTableArtwork';
test('original table imagery keeps pot and game stage live, not embedded in the image', () => {
  const html = renderToStaticMarkup(createElement(PokerTableArtwork, { pot: 1250, stage: 'flop' }));
  assert.match(html, /luxe-poker-table-clean.png/);
  assert.match(html, /1,250 virtual chips/);
  assert.match(html, /flop/);
  assert.match(html, /No cash value/);
  assert.ok(existsSync(new URL('../public/games/luxe-poker-table-clean.png', import.meta.url)));
});
test('game uses artwork without removing dealer or betting handlers', () => {
  const source = readFileSync(new URL('../src/components/LuxePokerLeague.tsx', import.meta.url), 'utf8');
  assert.match(source, /PokerTableArtwork pot=\{game\?\.pot \?\? 0\} stage=\{dealerStage\}/);
  for (const handler of ['<LuxeDealer', 'onClick={takeSeat}', 'act("fold")', 'act("raise")']) assert.ok(source.includes(handler));
});


test('live seats and board are nested inside the artwork rather than below it', () => {
  const source = readFileSync(new URL('../src/components/LuxePokerLeague.tsx', import.meta.url), 'utf8');
  const surface = source.split('<PokerTableArtwork')[1].split('</PokerTableArtwork>')[0];
  for (const layer of ['poker-live-seats', 'poker-live-board']) assert.ok(surface.includes(layer));
  // Seats are clean avatar plates — cards live on the console's black pad,
  // never duplicated on the seat badge.
  assert.ok(!surface.includes('poker-seat-hand'), 'seat badges must not carry mini cards');
});

test('poker table is landscape-first: portrait shows a rotate gate driven by live JS orientation', () => {
  const source = readFileSync(new URL('../src/components/LuxePokerLeague.tsx', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
  assert.match(source, /Rotate your phone to play poker/);
  // Gate visibility keys off the JS truth class, never CSS orientation alone —
  // Android WebViews misreport orientation mid-rotation (black screen + audio bug).
  assert.match(source, /classList\.toggle\("luxury-portrait", portrait\)/);
  assert.match(css, /luxury-portrait \.poker-playing-page \.poker-landscape-gate \{ display:flex/);
  // The gate is dismissible: no player is ever locked out of a live hand.
  assert.match(source, /Keep playing in portrait/);
  assert.match(css, /poker-gate-dismissed \.poker-landscape-gate \{ display:none !important/);
  assert.match(css, /poker-playing-wrap \{ max-width:90rem/);
});

test('portrait table fits inside its accessible region without forced horizontal scrolling', () => {
  const html = renderToStaticMarkup(createElement(PokerTableArtwork, { pot: 0, stage: 'ready' }));
  assert.match(html, /poker-table-scroll/);
  assert.match(html, /tabindex="0"/);
  const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
  assert.match(css, /poker-table-artwork \{ min-width:0; width:100%/);
  assert.doesNotMatch(css, /min-width:38rem/);
});
