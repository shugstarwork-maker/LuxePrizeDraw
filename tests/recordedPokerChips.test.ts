import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
test('uploaded chip recording exists and is used before synthesized effect dispatch', () => {
  const bytes = readFileSync(new URL('../public/audio/poker-chips-0942.mp3', import.meta.url));
  assert.ok(bytes.length > 1000);
  assert.ok(bytes.subarray(0,3).toString() === 'ID3' || bytes[0] === 255);
  const source = readFileSync(new URL('../src/audio/AudioProvider.tsx', import.meta.url), 'utf8');
  assert.match(source, /effect === "chipDrop" \|\| effect === "chipStack"/);
  assert.match(source, /new Audio\("\/audio\/poker-chips-0942.mp3"\)/);
  assert.match(source, /clip.volume = settings.volume/);
  assert.ok(source.indexOf('if (!settings.enabled') < source.indexOf('new Audio("/audio/poker-chips-0942.mp3")'));
  assert.match(source, /if \(effect === "tableKnock"\)/);
});
