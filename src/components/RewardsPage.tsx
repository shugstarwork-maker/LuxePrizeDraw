// Rewards: the daily sign-in and where to find quests. Free-play chips only.
import { RewardsPanel } from "./GameLounge";

const openProfile = () => { window.history.pushState({}, "", "/portal"); window.dispatchEvent(new PopStateEvent("popstate")); window.scrollTo({ top: 0, behavior: "smooth" }); };

export function RewardsPage() {
  return <main className="min-h-screen bg-[radial-gradient(circle_at_top,#3a2a08,#0a0805_55%)] px-4 pb-32 pt-10 text-white">
    <div className="mx-auto max-w-xl">
      <RewardsPanel />
      <p className="mt-6 text-center text-xs text-white/55">Quests, achievements and trophies are in your Profile.</p>
      <div className="mt-3 text-center"><button type="button" onClick={openProfile} className="rounded-xl border border-amber-200/40 bg-black/40 px-5 py-3 text-xs font-black uppercase tracking-wider text-amber-100 transition hover:border-amber-200">Open Profile</button></div>
    </div>
  </main>;
}
