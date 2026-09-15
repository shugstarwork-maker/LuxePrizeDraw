import React from "react";
import { ShieldAlert } from "lucide-react";

export const LegalReadinessNotice: React.FC = () => (
  <aside className="border-b border-amber-300/25 bg-amber-300/10 px-4 py-3 text-center text-xs text-amber-50">
    <span className="mx-auto inline-flex max-w-5xl items-center justify-center gap-2 leading-relaxed">
      <ShieldAlert className="h-4 w-4 shrink-0 text-amber-300" />
      <strong>Pre-launch legal review:</strong> entries, payments, prize issuance, and any funds-safeguarding statements remain disabled until jurisdiction-specific counsel approval, official rules, and independently evidenced safeguarding arrangements are recorded.
    </span>
  </aside>
);
