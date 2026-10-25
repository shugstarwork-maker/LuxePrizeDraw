import { useEffect, useState } from "react";

const BLIND_INTERVAL_MS = 8 * 60 * 1000; // blind level rises every 8 minutes of table time
const START_OF_SESSION = Date.now();

/**
 * Slim tournament ticker pinned to the very top of the table HUD:
 * Players Remaining | Next Blind Level in XX:XX | Bubble position.
 * Free-play league only — the countdown drives the simulated blind clock,
 * not any real-money structure.
 */
export function PokerTournamentTicker({
  playersRemaining,
  totalSeats,
  yourPosition,
  currentBlinds,
  nextBlinds,
}: {
  playersRemaining: number;
  totalSeats: number;
  yourPosition: number | null;
  currentBlinds: string;
  nextBlinds: string;
}) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);
  const elapsed = now - START_OF_SESSION;
  const remainMs = BLIND_INTERVAL_MS - (elapsed % BLIND_INTERVAL_MS);
  const mm = String(Math.floor(remainMs / 60000)).padStart(2, "0");
  const ss = String(Math.floor((remainMs % 60000) / 1000)).padStart(2, "0");
  const bubble = playersRemaining > 1 ? playersRemaining : totalSeats;

  return (
    <div className="poker-ticker" role="status" aria-label="Tournament ticker">
      <span><b>{playersRemaining}</b> of {totalSeats} players remaining</span>
      <span aria-hidden="true" className="poker-ticker__sep">·</span>
      <span>Blinds {currentBlinds} → <b>{nextBlinds}</b> in <b>{mm}:{ss}</b></span>
      <span aria-hidden="true" className="poker-ticker__sep">·</span>
      <span>{yourPosition ? <>You: <b>#{yourPosition}</b> · bubble at <b>#{bubble}</b></> : <>Bubble position: <b>#{bubble}</b></>}</span>
      <span aria-hidden="true" className="poker-ticker__sep">·</span>
      <span className="poker-ticker__blurb">Free-play · no cash value — virtual chips cannot be exchanged.</span>
    </div>
  );
}
