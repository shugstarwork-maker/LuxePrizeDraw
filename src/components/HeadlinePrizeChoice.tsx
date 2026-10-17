import { useState } from 'react';
export const HEADLINE_CHOICES = {
  bitcoin: { label: 'Bitcoin', symbol: '₿', description: 'Preview: £100,000 of Bitcoin. Valuation timing, provider and delivery terms require final approved rules.' },
  cash: { label: 'Cash', symbol: '£', description: 'Preview: £100,000 cash. Payment method, verification and fulfilment terms require final approved rules.' },
} as const;
export function HeadlinePrizeChoice() {
  const [choice, setChoice] = useState<keyof typeof HEADLINE_CHOICES>('bitcoin');
  const [sparkle, setSparkle] = useState(0);
  const selected = HEADLINE_CHOICES[choice];
  return <section className="headline-prize-choice" aria-label="Explore prize alternatives">
    <div className="headline-prize-choice__options" role="group" aria-label="Preview Bitcoin or cash">{(Object.keys(HEADLINE_CHOICES) as (keyof typeof HEADLINE_CHOICES)[]).map(key => <button type="button" key={key} aria-pressed={choice===key} onClick={()=>{setChoice(key);setSparkle(v=>v+1);}}>{HEADLINE_CHOICES[key].symbol} {HEADLINE_CHOICES[key].label}</button>)}</div>
    <button type="button" className="headline-prize-choice__art" aria-label={`Shimmer ${selected.label} prize preview`} onClick={()=>setSparkle(v=>v+1)}><span key={`${choice}-${sparkle}`} className="headline-choice-medallion" aria-hidden="true">{selected.symbol}</span></button>
    <p role="status">{selected.description}</p>
    <small>Preview only. Nothing is saved; no entry, purchase or prize entitlement is created.</small>
  </section>;
}
