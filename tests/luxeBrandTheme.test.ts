import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
test('shared luxury theme covers headings without recolouring game pieces', () => {
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
  assert.match(app, /storm-page luxe-brand-theme/);
  assert.match(css, /luxe-brand-theme :is\(h1,h2,h3,h4\).*Georgia/);
  assert.match(css, /poker-salon-seat/);
  assert.doesNotMatch(css, /luxe-brand-theme \*\s*\{/);
});
test('poker salon replaces purple panels with gold identity and preserves seating actions', () => {
  const source = readFileSync(new URL('../src/components/LuxePokerLeague.tsx', import.meta.url), 'utf8');
  assert.match(source, /LUXE POKER LOUNGE/);
  assert.match(source, /poker-salon-card/);
  assert.match(source, /onClick=\{\(\) => join\(table\)\}/);
  assert.match(source, /no cash value/);
  assert.doesNotMatch(source, /#451256/);
});

test('artwork lounge owns navigation and sound without duplicated floating controls', () => {
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  const lobby = readFileSync(new URL('../src/components/NeonGameLobby.tsx', import.meta.url), 'utf8');
  assert.match(app, /path !== "\/lobby" && <AudioControls/);
  const loungeRoute = app.split('path === "/lobby"')[1].split('path === "/poker"')[0];
  assert.doesNotMatch(loungeRoute, /ScottishHost|MobileDock/);
  assert.match(lobby, /onClick=\{onToggleSound\}/);
  assert.match(lobby, /Mute sound effects/);
});
