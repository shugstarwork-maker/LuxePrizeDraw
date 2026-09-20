import { Crown, Gamepad2 } from "lucide-react";

const navigate = (href: string) => {
  window.history.pushState({}, "", href);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0, behavior: "smooth" });
};

export function GameRail() {
  return <aside aria-label="Game destinations" className="fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3 lg:flex">
    <button onClick={() => navigate("/poker")} className="group flex w-16 flex-col items-center gap-2 rounded-2xl border border-amber-200/30 bg-[#0b0a0a]/95 px-2 py-3 text-amber-100 shadow-2xl backdrop-blur transition hover:border-amber-200 hover:bg-amber-300 hover:text-black" title="Luxe Poker">
      <Crown className="h-5 w-5" />
      <span className="text-[9px] font-black uppercase leading-tight tracking-wider">Luxe<br />Poker</span>
    </button>
    <button onClick={() => navigate("/arcade")} className="group flex w-16 flex-col items-center gap-2 rounded-2xl border border-cyan-200/30 bg-[#07111d]/95 px-2 py-3 text-cyan-100 shadow-2xl backdrop-blur transition hover:border-cyan-200 hover:bg-cyan-200 hover:text-black" title="Luxe Arcade">
      <Gamepad2 className="h-5 w-5" />
      <span className="text-[9px] font-black uppercase leading-tight tracking-wider">Luxe<br />Arcade</span>
    </button>
  </aside>;
}
