import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PlayerTurnRing, turnRingProgress } from '../src/components/PlayerTurnRing';
test('turn ring clamps countdown without wrapping at zero', () => {
  assert.equal(turnRingProgress(20), 1); assert.equal(turnRingProgress(10), .5);
  assert.equal(turnRingProgress(0), 0); assert.equal(turnRingProgress(-2), 0);
  assert.equal(turnRingProgress(30), 1);
});
test('only active seat gets countdown while idle players retain gold rims', () => {
  const active = renderToStaticMarkup(createElement(PlayerTurnRing, { active:true, seconds:10, name:'You', children:'LP' }));
  assert.match(active, /stroke-dashoffset="50"/); assert.match(active, /10 seconds remaining/);
  const idle = renderToStaticMarkup(createElement(PlayerTurnRing, { active:false, seconds:20, name:'Other', children:'O' }));
  assert.doesNotMatch(idle, /player-turn-ring__clock/); assert.match(idle, /gold avatar rim/);
});
