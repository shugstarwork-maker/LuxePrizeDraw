import React from "react";
import { ArrowLeft } from "lucide-react";
import { DrawEconomicsPanel } from "./DrawEconomicsPanel";

const navigate = (href: string) => {
  window.history.pushState({}, "", href);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// Internal economics page — deliberately unlisted: no navigation links point
// here. Share the /economics URL only with the team. Not for entrants.
export const EconomicsPage: React.FC = () => (
  <main className="min-h-screen bg-[#090a11] px-4 py-8 text-white sm:py-12">
    <div className="mx-auto max-w-5xl">
      <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-200">
        <ArrowLeft className="h-4 w-4" />Home
      </button>
      <h1 className="mt-4 text-3xl font-black sm:text-4xl">Draw economics — internal</h1>
      <p className="mt-2 text-sm text-white/50">
        Net-profit modelling as multiples of prize value. Team access only — this page is not linked anywhere on the public site.
      </p>
      <DrawEconomicsPanel />
    </div>
  </main>
);
