import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { existsSync, readFileSync } from 'node:fs';
import { PokerTableArtwork } from '../src/components/PokerTableArtwork';
test('original table imagery keeps pot and game stage live, not embedded in the image', () => {
  const html = renderToStaticMarkup(createElement(PokerTableArtwork, { pot: 1250, stage: 'flop' }));
  assert.match(html, /luxe-poker-table.png/);
  assert.match(html, /1,250 virtual chips/);
  assert.match(html, /flop/);
  assert.match(html, /No cash value/);
  assert.ok(existsSync(new URL('../public/games/luxe-poker-table.png', import.meta.url)));
});
test('game uses artwork without removing dealer or betting handlers', () => {
  const source = readFileSync(new URL('../src/components/LuxePokerLeague.tsx', import.meta.url), 'utf8');
  assert.match(source, /PokerTableArtwork pot=\{pot\} stage=\{stage\}/);
  for (const handler of ['<LuxeDealer', 'onClick={deal}', 'act("fold")', 'act("raise")']) assert.ok(source.includes(handler));
});


test('live seats and board are nested inside the artwork rather than below it', () => {
  const source = readFileSync(new URL('../src/components/LuxePokerLeague.tsx', import.meta.url), 'utf8');
  const surface = source.split('<PokerTableArtwork')[1].split('</PokerTableArtwork>')[0];
  for (const layer of ['poker-live-seats', 'poker-live-board', 'poker-live-hand']) assert.ok(surface.includes(layer));
});
