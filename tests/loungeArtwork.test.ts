import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { NeonGameLobby } from '../src/components/NeonGameLobby';
import { LoungeTableArtwork } from '../src/components/LoungeTableArtwork';
test('lounge keeps free-play controls and game links while using compact gold artwork', () => {
  const html = renderToStaticMarkup(createElement(NeonGameLobby));
  for (const text of ['Poker Lounge', 'No cash value', 'Texas Hold', 'Play now', 'Previous game', 'Next game', 'Bonus', 'No deposits, cash prizes, or cash-out']) assert.ok(html.includes(text), text);
  assert.doesNotMatch(html, /min-h-\[31rem\]|GET REWARDED/);
  assert.match(html, /lounge-table-art/);
});
test('aces and chips are decorative artwork, not game state', () => {
  const html = renderToStaticMarkup(createElement(LoungeTableArtwork));
  assert.match(html, /aria-hidden="true"/);
  assert.equal((html.match(/<b>A<\/b>/g) || []).length, 4);
  assert.doesNotMatch(html, /<button|<img|<a /);
});
