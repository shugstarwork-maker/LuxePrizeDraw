import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { GOLD_GAMES, GoldGamesCarousel, initialBoardGame } from '../src/components/GoldGamesCarousel';
import { existsSync } from 'node:fs';
test('gold games collection retains four playable destinations and free-play limits', () => {
  assert.equal(GOLD_GAMES.length, 4);
  for (const game of GOLD_GAMES) assert.ok(existsSync(new URL(`../public${game.image}`, import.meta.url)));
  const html = renderToStaticMarkup(createElement(GoldGamesCarousel));
  for (const game of GOLD_GAMES) assert.ok(html.includes(game.title));
  assert.match(html, /No cash value/);
  assert.match(html, /No deposits, cash wagering or cash-out/);
  assert.match(html, /href="\/poker"/);
});
test('board links select the matching existing engine and reject unknown games', () => {
  assert.equal(initialBoardGame('?game=connect4'), 'connect4');
  assert.equal(initialBoardGame('?game=draughts'), 'draughts');
  assert.equal(initialBoardGame('?game=chess'), 'chess');
  assert.equal(initialBoardGame('?game=unknown'), 'chess');
});
