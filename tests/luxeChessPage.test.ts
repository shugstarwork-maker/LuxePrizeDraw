import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
test('chess has a dedicated route without host or mobile dock', () => {
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  assert.match(app, /path === "\/chess" \? <LuxeChessPage \/>/);
  const page = readFileSync(new URL('../src/components/LuxeChessPage.tsx', import.meta.url), 'utf8');
  assert.match(page, /<ChessBoard sound=/); assert.match(page, /href="\/arcade"/);
  assert.doesNotMatch(page, /ScottishHost|MobileDock|GoldGamesCarousel/);
});
test('chess carousel opens the dedicated game and larger board is scoped to it', () => {
  const games = readFileSync(new URL('../src/components/GoldGamesCarousel.tsx', import.meta.url), 'utf8');
  assert.match(games, /href: '\/chess'/);
  const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
  assert.match(css, /luxe-chess-play-page \.luxe-chess-table \{ max-width:56rem/);
});
