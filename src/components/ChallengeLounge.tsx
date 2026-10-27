// Board screen for chess, connect four and draughts. These games are launched from the casino
// carousel (/challenge?game=…). Each game has its own weekly league and XP (see gameLeagues.ts);
// XP only comes from finished games.
import React, { useEffect, useState } from "react";
import { ChevronLeft, ShieldCheck, Swords } from "lucide-react";
import { useAudio } from "../audio/AudioProvider";
import { ChessBoard, ConnectFourBoard, DraughtsBoard } from "./GamesArena";
import { GAME_DAILY_XP_CAP, GAME_XP, gameLeagueState, recordGameResult, type GameLeagueState, type GameOutcome } from "../lib/gameLeagues";
import { bumpStat, markTried } from "../lib/achievements";

const nav = (href: string) => { window.history.pushState({}, "", href); window.dispatchEvent(new PopStateEvent("popstate")); window.scrollTo({ top: 0, behavior: "smooth" }); };

type ChallengeGameId = "chess" | "connect4" | "draughts";

// The game named in the URL by a casino card. Anything else opens chess.
const requestedGame = (): ChallengeGameId => {
  const game = new URLSearchParams(window.location.search).get("game");
  return game === "connect4" || game === "draughts" ? game : "chess";
};

const GAME_META: Record<ChallengeGameId, { title: string; image: string; detail: string }> = {
  chess: { title: "Chess", image: "/games/chess.svg", detail: "Full legal rules · 10-minute clock" },
  connect4: { title: "Connect Four", image: "/games/connect-four.svg", detail: "Cinematic disc drops · win-line glow" },
  draughts: { title: "Draughts", image: "/games/draughts.svg", detail: "Mandatory captures · crowned kings" },
};

export const ChallengeLounge: React.FC = () => {
  const { play } = useAudio();
  const [screen] = useState<ChallengeGameId>(requestedGame);
  const [leagues, setLeagues] = useState<Record<ChallengeGameId, GameLeagueState>>(() => ({ chess: gameLeagueState("chess"), connect4: gameLeagueState("connect4"), draughts: gameLeagueState("draughts") }));
  const [notice, setNotice] = useState("");

  useEffect(() => { markTried(screen); }, [screen]);

  const sound = (s: "button" | "ticketSelect" | "success" | "error") => play(s);

  // Records one finished game in that game's own league, capped per game per day.
  const recordOutcome = (game: ChallengeGameId, outcome: GameOutcome) => {
    const before = leagues[game].weekXP;
    const next = recordGameResult(game, outcome);
    setLeagues((v) => ({ ...v, [game]: next }));
    const gained = next.weekXP - before;
    setNotice(gained > 0 ? `+${gained} ${GAME_META[game].title} league XP banked.` : `Daily ${GAME_META[game].title} XP cap of ${GAME_DAILY_XP_CAP} reached. The game still counts as played.`);
    play("levelUp");
  };

  // A finished game is recorded locally in its own league, and sent to the server scoring endpoint when reachable.
  const reportResult = (game: ChallengeGameId) => (result: "win" | "draw") => {
    if (result === "win") bumpStat(`${game}Finished`);
    // Not ranked: these boards are two players on one device, so one person could play both sides.
    recordOutcome(game, result);
  };

  const meta = GAME_META[screen];
  const state = leagues[screen];
  return <section className="salon-selection min-h-screen bg-[radial-gradient(circle_at_top,#3a2a08,#0a0805_52%)] px-4 py-6 pb-28 text-white">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between rounded-2xl border border-amber-200/30 bg-black/35 px-4 py-3">
          <button onClick={() => { play("button"); nav("/casino"); }} className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-xs font-black"><ChevronLeft className="h-4 w-4" />Casino</button>
          <span className="inline-flex items-center gap-2 font-black text-amber-100"><Swords className="h-4 w-4" />{meta.title}</span>
          <span className="rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider" style={{ borderColor: `${state.tier.colour}55`, color: state.tier.colour }}>{state.tier.name} League</span>
        </header>
        <div className="mt-6 rounded-[2rem] border border-amber-200/30 bg-black/30 p-4 shadow-[0_0_60px_rgba(212,175,55,.14)] sm:p-7">
          {screen === "chess" ? <ChessBoard sound={sound} onResult={reportResult("chess")} /> : screen === "connect4" ? <ConnectFourBoard sound={sound} onResult={reportResult("connect4")} /> : <DraughtsBoard sound={sound} onResult={reportResult("draughts")} />}
        </div>
        {notice && <p className="mt-4 rounded-xl border border-emerald-300/30 bg-emerald-300/10 p-3 text-sm text-emerald-100">{notice}</p>}
        <p className="mt-4 flex items-center gap-2 text-xs text-white/45"><ShieldCheck className="h-4 w-4 text-emerald-300" />Free-play only — no deposits, no cash wagering, no cash-out. Win a game: +{GAME_XP.win} XP, draw: +{GAME_XP.draw} XP, in this game's league only.</p>
      </div>
    </section>;
};
