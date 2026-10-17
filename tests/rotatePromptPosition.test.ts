import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
test('portrait rotate prompt fills viewport so existing flex centring is screen-relative', () => {
  const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
  assert.match(css, /poker-landscape-gate \{ position:fixed; inset:0; z-index:85; min-height:100dvh/);
  assert.match(css, /poker-landscape-gate \{ display:flex;[^}]*justify-content:center/);
});
