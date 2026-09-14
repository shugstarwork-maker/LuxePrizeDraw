/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { SimpleCompetitionHub } from "./components/SimpleCompetitionHub";
import { CashDrawDetail } from "./components/CashDrawDetail";
import { GameLobby } from "./components/GameLobby";
import { GamesArena } from "./components/GamesArena";
import { LuxePokerLeague } from "./components/LuxePokerLeague";
import { SimpleHeader } from "./components/SimpleHeader";
import { SimpleFooter } from "./components/SimpleFooter";

export default function App() {
  if (typeof window !== "undefined" && window.location.pathname === "/games") return <GameLobby />;
  if (typeof window !== "undefined" && window.location.pathname === "/draw") return <CashDrawDetail />;
  return <div className="min-h-screen bg-[#050505] text-white"><SimpleHeader /><main><section className="border-b border-white/10 bg-[radial-gradient(circle_at_top,_rgba(212,175,55,.18),_transparent_45%)] px-4 py-20 text-center sm:px-6 sm:py-28"><p className="text-xs font-bold uppercase tracking-[.24em] text-[#f8d778]">Cash prizes & free-play games</p><h1 className="mx-auto mt-4 max-w-4xl text-4xl font-black tracking-tight sm:text-7xl">Simple draws. Great games.</h1><p className="mx-auto mt-5 max-w-2xl text-white/60">Explore small cash-prize previews and open the free-play game portal for Chess, Draughts, Connect 4, and Texas Hold’em.</p><a href="#competition-hub" className="mt-8 inline-flex rounded-xl bg-[#D4AF37] px-5 py-3 text-xs font-black uppercase tracking-wider text-black hover:bg-[#f4cf5c]">Explore draws</a></section><SimpleCompetitionHub /><GamesArena /><LuxePokerLeague /></main><SimpleFooter /></div>;
}
