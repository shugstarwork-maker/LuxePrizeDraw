import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
test('landscape dock retains real poker action handlers', () => {
  const source = readFileSync(new URL('../src/components/LuxePokerLeague.tsx', import.meta.url), 'utf8');
  assert.match(source, /poker-action-dock/);
  assert.match(source, /aria-label="Poker actions"/);
  for (const action of ['act("fold")','act("raise")','act(stage===','onClick={deal}','setLeaveOpen(true)']) assert.ok(source.includes(action));
});
test('landscape hides app chrome only during active table view', () => {
  const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
  assert.match(css, /orientation:landscape\) and \(max-height:700px/);
  assert.match(css, /body:has\(\.poker-playing-page\) \.poker-external-chrome/);
  assert.match(css, /poker-action-dock,\.poker-deal-dock \{ position:fixed/);
  assert.match(css, /app-audio-controls \{ display:none/);
});

test('landscape table fills viewport with overlay controls and no page scrolling', () => {
  const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
  assert.match(css, /height:100dvh; min-height:0; padding:0; overflow:hidden/);
  assert.doesNotMatch(css, /100dvh - 10rem/);
  assert.match(css, /poker-table-artwork > img \{ width:100%; height:100%; object-fit:cover/);
});
