import { useState } from 'react';

export function CashPoundRain() {
  const [paused, setPaused] = useState(false);
  return <>
    <div className={`cash-pound-rain${paused ? ' cash-pound-rain--paused' : ''}`} aria-hidden="true">
      {Array.from({ length: 12 }, (_, index) => <span key={index} style={{ left: `${4 + index * 8}%`, animationDelay: `${-index * .7}s`, animationDuration: `${6 + index % 4}s` }}>£</span>)}
    </div>
    <button type="button" className="cash-pound-rain-toggle" aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? 'Resume £ rain' : 'Pause £ rain'}</button>
  </>;
}
