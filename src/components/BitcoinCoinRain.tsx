import { useState } from 'react';
export function BitcoinCoinRain() {
  const [paused, setPaused] = useState(false);
  return <>
    <div className={`bitcoin-coin-rain${paused ? ' bitcoin-coin-rain--paused' : ''}`} aria-hidden="true">{Array.from({length:18},(_,i)=><span key={i} style={{left:`${3+(i*37)%94}%`,animationDuration:`${16+i%7}s`,animationDelay:`${-i*1.7}s`}}>₿</span>)}</div>
    <button type="button" className="bitcoin-coin-rain-toggle" aria-pressed={paused} onClick={()=>setPaused(v=>!v)}>{paused ? 'Resume coins' : 'Pause coins'}</button>
  </>;
}
