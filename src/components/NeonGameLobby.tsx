import React, { useEffect, useState } from "react";
import { Club, Dice5, Spade } from "lucide-react";

type LobbyGame = { title: string; subtitle: string; badge: string; href?: string; icon: React.ElementType; players: string; theme: "holdem" | "blackjack" | "roulette" };
const games: LobbyGame[] = [
  { title: "Texas Hold'em", subtitle: "Take a seat at the Luxe poker table", badge: "Free-play chips", href: "/poker", icon: Spade, players: "6 seats", theme: "holdem" },
  { title: "Blackjack", subtitle: "Classic twenty-one, Luxe table rules", badge: "Coming soon", icon: Club, players: "1 seat", theme: "blackjack" },
  { title: "Roulette", subtitle: "The signature gold-wheel table", badge: "Coming soon", icon: Dice5, players: "Open table", theme: "roulette" },
];
const navigate = (href: string) => { window.history.pushState({}, "", href); window.dispatchEvent(new PopStateEvent("popstate")); };

export const NeonGameLobby: React.FC<{ soundEnabled?: boolean; onToggleSound?: () => void }> = ({ soundEnabled = false, onToggleSound }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [chips, setChips] = useState(5000);
  const [notice, setNotice] = useState("");
  useEffect(() => { setChips(Number(localStorage.getItem("luxe-poker-chips")) || 5000); }, []);
  const selected = games[selectedIndex];
  const move = (offset: number) => { setSelectedIndex((index) => (index + offset + games.length) % games.length); setNotice(""); };
  const collectBonus = () => { const next = chips + 250; setChips(next); localStorage.setItem("luxe-poker-chips", String(next)); setNotice("Bonus collected: 250 free-play chips."); };
  const playSelected = () => selected.href ? navigate(selected.href) : setNotice(`${selected.title} is being prepared for the Luxe Arcade. It will remain free-play only.`);
  return <section className="original-lounge-page">
    <p className="original-lounge-disclosure">Free-play only · No cash value · No deposits, cash prizes or cash-out. Artwork reward wording refers only to free-play.</p>
    <main className="original-lounge" aria-label="Luxe Poker Lounge">
      <img className="original-lounge__image" src="/prizes/original-poker-lounge.png" alt="Luxe Poker Lounge: original black-and-gold artwork with crown, aces, chips and poker table" />
      <button className="original-lounge__hotspot original-lounge__arcade" aria-label="Open Luxe Arcade" onClick={() => navigate('/arcade')} />
      <div className="original-lounge__balance" aria-label={`${chips.toLocaleString()} free-play chips`}>{chips.toLocaleString()}</div>
      <button className="original-lounge__hotspot original-lounge__bonus" aria-label="Bonus: collect 250 free-play chips" onClick={collectBonus} />
      <button className="original-lounge__hotspot original-lounge__previous" aria-label="Previous game" onClick={() => move(-1)} />
      <button className="original-lounge__hotspot original-lounge__next" aria-label="Next game" onClick={() => move(1)} />
      <span className="original-lounge__game" aria-live="polite">{selected.title} · {selected.badge}</span>
      <button className="original-lounge__hotspot original-lounge__play" aria-label={selected.href ? `Play now: ${selected.title}` : `View table: ${selected.title}`} onClick={playSelected} />
      <button className="original-lounge__hotspot original-lounge__sound" aria-label={soundEnabled ? "Mute sound effects" : "Enable sound effects"} aria-pressed={soundEnabled} onClick={onToggleSound} />
      <button className="original-lounge__hotspot original-lounge__portal" aria-label="Open player portal" onClick={() => navigate("/portal")} />
      <span className="original-lounge__seats">{selected.players}</span>
      <nav aria-label="Lounge navigation" className="original-lounge__navigation">{[['Home','/'],['Draws','/draws'],['Arcade','/arcade'],['Portal','/portal'],['More','/lobby']].map(([name,href]) => <button key={name} aria-label={name} onClick={() => navigate(href)} />)}</nav>
      <div className="original-lounge__dots">{games.map((game,index) => <button key={game.title} aria-label={`Show ${game.title}`} aria-pressed={index===selectedIndex} onClick={() => { setSelectedIndex(index); setNotice(''); }} />)}</div>
    </main>
    {notice && <p role="status" className="original-lounge-notice">{notice}</p>}
    <p className="original-lounge-disclosure">Texas Hold’em uses non-redeemable free-play chips only. Blackjack and roulette are coming soon. No deposits, cash prizes, or cash-out are available in the Games Lobby.</p>
  </section>;
};
