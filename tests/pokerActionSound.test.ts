import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pokerActionSound, playPokerPercussion } from '../src/audio/pokerActionSound';
test('raise/call drop chips and check knocks rather than beeps', () => {
  assert.equal(pokerActionSound('raise'), 'chipDrop');
  assert.equal(pokerActionSound('call'), 'chipDrop');
  assert.equal(pokerActionSound('check'), 'tableKnock');
  assert.equal(pokerActionSound('fold'), 'error');
});
test('percussion schedules bounded short noise bursts without external audio', () => {
  const starts: number[] = [];
  const node = () => ({ frequency:{value:0}, Q:{value:0}, connect() { return this; }, gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, start(t:number) { starts.push(t); }, stop() {} });
  const context = { currentTime:0, sampleRate:1000, destination:{}, createBuffer: (_:number,n:number) => ({ getChannelData: () => new Float32Array(n) }), createBufferSource: node, createBiquadFilter: node, createGain: node };
  playPokerPercussion(context as any, 'chipDrop', .5); assert.equal(starts.length, 5);
  starts.length=0; playPokerPercussion(context as any, 'tableKnock', .5); assert.equal(starts.length, 2);
});
