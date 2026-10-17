import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { LuxeChessFrame } from '../src/components/LuxeChessFrame';
test('Luxe Chess frame displays crown branding and retains interactive children', () => {
  const html = renderToStaticMarkup(createElement(LuxeChessFrame, { children:createElement('button', { 'aria-label':'e2 White pawn' }, '♙') }));
  assert.match(html, /LUXE CHESS/); assert.match(html, /Free-play/);
  assert.match(html, /aria-label="e2 White pawn"/); assert.match(html, /luxe-chess-rail/);
});
test('chess keeps its legal engine, clocks and accessible square actions', () => {
  const source = readFileSync(new URL('../src/components/GamesArena.tsx', import.meta.url), 'utf8');
  assert.match(source, /<LuxeChessFrame>/);
  for (const operation of ['playChess(match', 'chessLegalMoves(match', 'onClick={() => tap(square)}', '<Clock label="White"', '<Clock label="Black"']) assert.ok(source.includes(operation));
  assert.match(source, /aria-pressed=\{selected === square\}/);
});
