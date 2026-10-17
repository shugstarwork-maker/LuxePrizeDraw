export type PokerActionSound = 'chipDrop' | 'tableKnock' | 'error';
export function pokerActionSound(action: 'raise' | 'call' | 'check' | 'fold'): PokerActionSound {
  return action === 'check' ? 'tableKnock' : action === 'fold' ? 'error' : 'chipDrop';
}
/** Original short percussive synthesis, not a recording of a physical table. */
export function playPokerPercussion(context: AudioContext, effect: 'chipDrop' | 'tableKnock', volume: number) {
  const count = effect === 'chipDrop' ? 5 : 2;
  for (let i = 0; i < count; i++) {
    const start = context.currentTime + i * (effect === 'chipDrop' ? .035 : .09);
    const duration = effect === 'chipDrop' ? .065 : .08;
    const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let n = 0; n < samples.length; n++) samples[n] = (Math.random() * 2 - 1) * Math.exp(-n / (samples.length / 5));
    const source = context.createBufferSource(), filter = context.createBiquadFilter(), gain = context.createGain();
    source.buffer = buffer; filter.type = 'bandpass';
    filter.frequency.value = effect === 'chipDrop' ? 1900 + i * 260 : 320;
    filter.Q.value = effect === 'chipDrop' ? 2.5 : .8;
    gain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)) * .35, start);
    gain.gain.exponentialRampToValueAtTime(.001, start + duration);
    source.connect(filter).connect(gain).connect(context.destination);
    source.start(start); source.stop(start + duration);
  }
}
