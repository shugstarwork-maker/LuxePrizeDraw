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

test('3D board provides a flat-view alternative and preserves board content', () => {
  const html = renderToStaticMarkup(createElement(LuxeChessFrame, { children:createElement('button', null, '♙') }));
  assert.match(html, /luxe-chess-table--3d/);
  assert.match(html, /Flat view/);
  assert.match(html, /aria-pressed="false"/);
  const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
  assert.match(css, /perspective:1100px/);
  assert.match(css, /transform:rotateX\(22deg\)/);
});
