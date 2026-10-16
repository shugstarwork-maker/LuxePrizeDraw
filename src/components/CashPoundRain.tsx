export function CashPoundRain() {
  return <div className="cash-pound-rain" aria-hidden="true">
    {Array.from({ length: 24 }, (_, index) => <span key={index} style={{ left: `${3 + (index * 37) % 94}%`, animationDelay: `${-((index * 11) % 24) - .5}s`, animationDuration: `${24 + index % 7}s` }}>£</span>)}
  </div>;
}
