import React, { useState } from "react";
import { Calculator, LockKeyhole } from "lucide-react";
import { DRAW_ECONOMICS_TIERS, marginSummary } from "../data/drawEconomics";

const gbp = (value: number) => `£${value.toLocaleString("en-GB")}`;

// Internal launch-control economics: net-profit targets are modelled as
// multiples of prize value (6x headline down to 10x entry tier). Internal
// modelling only — never displayed to entrants.
export const DrawEconomicsPanel: React.FC = () => {
  const [prize, setPrize] = useState(100000);
  const [ticket, setTicket] = useState(5);
  const summary = marginSummary(prize, ticket);

  return (
    <div className="mt-10 rounded-2xl border border-white/10 bg-white/[.03] p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.18em] text-amber-200">
          <Calculator className="h-4 w-4" />Draw economics — internal modelling
        </p>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white/45">
          <LockKeyhole className="h-3 w-3" />Not shown to entrants
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-white/55">
        Net-profit targets scale with the value of the prize: headline draws run on volume at a 6x
        target, the smallest draws target up to 10x. Model any prize below to see required entries.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-[10px] font-black uppercase tracking-wider text-white/40">Prize value (GBP)</span>
          <input
            type="number" min={0} step={500} value={prize}
            onChange={(e) => setPrize(Math.max(0, Number(e.target.value) || 0))}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm font-bold text-white outline-none focus:border-amber-200/50"
          />
        </label>
        <label className="block">
          <span className="text-[10px] font-black uppercase tracking-wider text-white/40">Assumed entry price (GBP)</span>
          <input
            type="number" min={1} step={1} value={ticket}
            onChange={(e) => setTicket(Math.max(1, Number(e.target.value) || 1))}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm font-bold text-white outline-none focus:border-amber-200/50"
          />
        </label>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Tier", value: summary.tier },
          { label: "Net-profit target", value: `${summary.multiple}x = ${gbp(summary.netProfitTargetGBP)}` },
          { label: "Break-even entries", value: summary.breakEvenEntries.toLocaleString("en-GB") },
          { label: "Target entries", value: summary.targetEntries.toLocaleString("en-GB") },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-white/10 bg-black/30 p-4">
            <p className="text-[9px] font-black uppercase tracking-wider text-white/40">{item.label}</p>
            <p className="mt-1.5 text-lg font-black text-white">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[34rem] text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-[9px] font-black uppercase tracking-wider text-white/40">
              <th className="py-2 pr-4">Prize tier</th>
              <th className="py-2 pr-4">Multiple</th>
              <th className="py-2">Example prize</th>
              <th className="py-2 pl-4">Net-profit target</th>
            </tr>
          </thead>
          <tbody>
            {DRAW_ECONOMICS_TIERS.map((tier) => {
              const example = tier.minPrizeGBP === 0 ? 1000 : tier.minPrizeGBP;
              return (
                <tr key={tier.label} className="border-b border-white/5 text-white/60">
                  <td className="py-2.5 pr-4 font-bold text-white/80">{tier.label}</td>
                  <td className="py-2.5 pr-4 font-black text-amber-200">{tier.multiple}x</td>
                  <td className="py-2.5">{gbp(example)}</td>
                  <td className="py-2.5 pl-4">{gbp(tier.multiple * example)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
