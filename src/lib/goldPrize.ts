// Gold prize fulfilment — UK-compliant operational framework.
//
// The four mandatory steps for offering a gold prize legally in the UK.
// Every gold prize lifecycle in the app is modelled as a progression through
// these steps; a winner can never reach DISPATCHED without completing
// verification, and the company never holds customer-facing metal — the
// dealer/vault ships direct via insured transit.

export type GoldPrizeStep =
  | "CORPORATE_SOURCING"     // 1. Company buys gold from a commercial bullion dealer, corporate funds
  | "REGULATORY_CODE"        // 2. Draw runs under consumer law + DCMS Voluntary Code of Good Practice
  | "WINNER_VERIFICATION"    // 3. Formal ID check + signed claims form BEFORE release
  | "FULFILMENT";            // 4. Dealer/vault ships direct to winner, fully insured transit

export const GOLD_PRIZE_STEPS: { step: GoldPrizeStep; title: string; requirement: string }[] = [
  {
    step: "CORPORATE_SOURCING",
    title: "Corporate sourcing",
    requirement:
      "LuxePrizeDraw Ltd purchases the gold directly from a commercial bullion dealer using corporate funds. The metal is a company asset held at the dealer's vault until fulfilment — never purchased with, or commingled with, player funds.",
  },
  {
    step: "REGULATORY_CODE",
    title: "Regulatory code",
    requirement:
      "The draw operates in strict adherence to UK consumer protection law and the DCMS Voluntary Code of Good Practice for Prize Draw Operators — free entry route, transparent terms, no purchase necessary.",
  },
  {
    step: "WINNER_VERIFICATION",
    title: "Winner verification",
    requirement:
      "Before the prize is released, the winner completes a formal ID check (Onfido/Yoti) and signs a claims form. Unverified winners receive nothing — the gold stays vaulted.",
  },
  {
    step: "FULFILMENT",
    title: "Fulfilment",
    requirement:
      "The gold is shipped directly from the secure commercial dealer/vault to the winner via fully insured transit. The company never physically handles the metal; chain-of-custody runs dealer → winner.",
  },
];

export type GoldPrizeState = {
  prizeId: string;
  sourcedFromDealer: string | null;      // bullion dealer name once purchased
  corporatePurchaseRef: string | null;   // corporate funds transaction ref
  winnerId: string | null;
  idCheckPassed: boolean;
  claimsFormSigned: boolean;
  dispatchedByDealer: boolean;
  insuredTransitRef: string | null;
};

/** Which step a gold prize has reached — strictly sequential. */
export function goldPrizeStep(p: GoldPrizeState): GoldPrizeStep {
  if (p.dispatchedByDealer && p.insuredTransitRef) return "FULFILMENT";
  if (p.winnerId && (!p.idCheckPassed || !p.claimsFormSigned)) return "WINNER_VERIFICATION";
  if (p.sourcedFromDealer && p.corporatePurchaseRef) return "WINNER_VERIFICATION"; // draw can run once sourced, under the code
  return "CORPORATE_SOURCING";
}

/** Hard gate: gold may only leave the vault when verification is complete.
 *  This is the release control your solicitor checks first. */
export function goldReleasePermitted(p: GoldPrizeState): { allowed: boolean; reason?: string } {
  if (!p.sourcedFromDealer || !p.corporatePurchaseRef)
    return { allowed: false, reason: "Gold not yet sourced by the company from a commercial bullion dealer." };
  if (!p.winnerId)
    return { allowed: false, reason: "No winner selected." };
  if (!p.idCheckPassed)
    return { allowed: false, reason: "Winner has not passed the formal ID check." };
  if (!p.claimsFormSigned)
    return { allowed: false, reason: "Winner has not signed the claims form." };
  return { allowed: true };
}

/** Dispatch guard: insured transit must be arranged before the dealer ships. */
export function goldDispatchReady(p: GoldPrizeState): { allowed: boolean; reason?: string } {
  const gate = goldReleasePermitted(p);
  if (!gate.allowed) return gate;
  if (!p.insuredTransitRef)
    return { allowed: false, reason: "Fully insured transit not yet arranged — dealer must not ship." };
  return { allowed: true };
}

export const GOLD_PRIZE_NOTE =
  "Gold prizes follow the four-step UK framework: corporate sourcing from a bullion dealer, DCMS Voluntary Code compliance, winner ID + claims form before release, and insured dealer-to-winner fulfilment.";
