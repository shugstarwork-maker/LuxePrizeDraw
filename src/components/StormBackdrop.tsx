import { useEffect, useState } from "react";

const notes = Array.from({ length: 18 }, (_, index) => index);

export function StormBackdrop() {
  const [showMoneyRain, setShowMoneyRain] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setShowMoneyRain(false), 15_000);
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <div className="storm-backdrop" aria-hidden="true">
      <div className="storm-backdrop__clouds" />
      {showMoneyRain && <div className="storm-backdrop__money-rain">
        {notes.map((note) => <span className={`storm-backdrop__note storm-backdrop__note--${note + 1}`} key={note}><small>BANK OF</small><strong>LUXE PRIZE DRAW</strong><b>£50</b><i>REWARD VOUCHER</i></span>)}
      </div>}
      <div className="storm-backdrop__flash storm-backdrop__flash--one" />
      <div className="storm-backdrop__flash storm-backdrop__flash--two" />
      <div className="storm-backdrop__flash storm-backdrop__flash--three" />
      <svg className="storm-backdrop__bolt storm-backdrop__bolt--left" viewBox="0 0 240 460" preserveAspectRatio="none">
        <path className="storm-backdrop__bolt-core" d="M118 0 102 49l17 18-34 56 20 19-43 82 25 16-49 122 60-91-19-16 43-75-17-18 37-61-16-16Z" />
        <path className="storm-backdrop__bolt-branch" d="m87 143-46 40 32 5-42 46m52 21 48 32-26 4 38 38m-69-184 33 18-16 24" />
      </svg>
      <svg className="storm-backdrop__bolt storm-backdrop__bolt--right" viewBox="0 0 240 460" preserveAspectRatio="none">
        <path className="storm-backdrop__bolt-core" d="M118 0 102 49l17 18-34 56 20 19-43 82 25 16-49 122 60-91-19-16 43-75-17-18 37-61-16-16Z" />
        <path className="storm-backdrop__bolt-branch" d="m87 143-46 40 32 5-42 46m52 21 48 32-26 4 38 38m-69-184 33 18-16 24" />
      </svg>
    </div>
  );
}
