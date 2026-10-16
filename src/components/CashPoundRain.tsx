export function CashPoundRain() {
  return <div className="cash-pound-rain" aria-hidden="true">
    {Array.from({ length: 24 }, (_, index) => <span key={index} style={{ left: `${2 + index * 4}%`, animationDelay: `${-index * 1.3}s`, animationDuration: `${18 + index % 7}s` }}>£</span>)}
  </div>;
}
