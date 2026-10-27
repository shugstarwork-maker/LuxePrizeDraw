// Gold coins falling across a cash card, in the same style as the page money rain.
const coins = Array.from({ length: 18 }, (_, index) => index);

export function GoldCoinRain() {
  return <div className="gold-coin-rain" aria-hidden="true">
    {coins.map((index) => <span key={index} style={{ left: `${3 + (index * 37) % 94}%`, animationDelay: `${-index * 1.3}s`, animationDuration: `${15 + index % 6}s` }}>£</span>)}
  </div>;
}
