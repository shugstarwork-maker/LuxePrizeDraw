import React from "react";
import { Heart, Mail, ShieldCheck, Trophy } from "lucide-react";

const items = [
  { icon: ShieldCheck, text: "Pre-launch review in progress" },
  { icon: Trophy, text: "Prize and winner records publish only after verified launch" },
  { icon: Mail, text: "Postal-entry route: counsel-approved rules required" },
  { icon: Heart, text: "Charity totals display only from reconciled donations" },
];

export const CommunityTicker: React.FC = () => (
  <section className="competition-ticker border-y border-amber-300/20 bg-[#120e06] text-amber-100" aria-label="Launch status">
    <div className="competition-ticker__track">
      {[0, 1].map(group => <div key={group} className="competition-ticker__group" aria-hidden={group === 1}>
        {items.map(({ icon: Icon, text }) => <React.Fragment key={text}><span className="inline-flex items-center gap-2"><Icon className="h-3.5 w-3.5 text-amber-300" />{text}</span><span className="competition-ticker__dot">•</span></React.Fragment>)}
      </div>)}
    </div>
  </section>
);
