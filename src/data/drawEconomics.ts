// Internal draw economics — net-profit targets as multiples of prize value.
// The multiple depends on the value of the prize: the biggest draws run on
// volume at a 6x net-profit target, while the smallest draws carry
// proportionally higher fixed costs and target up to 10x.
// This module is internal launch-control modelling only; it is never shown
// to entrants and creates no entry route or payment obligation.

export type DrawEconomicsTier = {
  minPrizeGBP: number;
  maxPrizeGBP: number | null; // null = unbounded above
  multiple: number;
  label: string;
};

export const DRAW_ECONOMICS_TIERS: DrawEconomicsTier[] = [
  { minPrizeGBP: 50000, maxPrizeGBP: null, multiple: 6, label: "Headline (50K+)" },
  { minPrizeGBP: 20000, maxPrizeGBP: 49999.99, multiple: 7, label: "Major (20K – 50K)" },
  { minPrizeGBP: 10000, maxPrizeGBP: 19999.99, multiple: 8, label: "Premium (10K – 20K)" },
  { minPrizeGBP: 2000, maxPrizeGBP: 9999.99, multiple: 9, label: "Standard (2K – 10K)" },
  { minPrizeGBP: 0, maxPrizeGBP: 1999.99, multiple: 10, label: "Entry (under 2K)" },
];

export const DEFAULT_PLATFORM_COST_PCT = 0.15; // payment processing + platform running costs, as a share of gross

export function economicsForPrize(prizeValueGBP: number): DrawEconomicsTier {
  if (!Number.isFinite(prizeValueGBP) || prizeValueGBP < 0) {
    throw new Error("prizeValueGBP must be a non-negative number.");
  }
  const tier = DRAW_ECONOMICS_TIERS.find(
    (t) => prizeValueGBP >= t.minPrizeGBP && (t.maxPrizeGBP === null || prizeValueGBP <= t.maxPrizeGBP),
  );
  if (!tier) throw new Error("No economics tier configured for this prize value.");
  return tier;
}

export function netProfitTargetGBP(prizeValueGBP: number): number {
  return Math.round(economicsForPrize(prizeValueGBP).multiple * prizeValueGBP);
}

// Gross entry revenue required so that, after prize cost and platform costs,
// net profit reaches the tier multiple of the prize value.
export function requiredGrossGBP(prizeValueGBP: number, platformCostPct = DEFAULT_PLATFORM_COST_PCT): number {
  if (platformCostPct < 0 || platformCostPct >= 1) throw new Error("platformCostPct must be between 0 and 1.");
  return Math.ceil((netProfitTargetGBP(prizeValueGBP) + prizeValueGBP) / (1 - platformCostPct));
}

// Entries needed to cover prize + platform costs with zero net profit.
export function breakEvenEntries(prizeValueGBP: number, ticketPriceGBP: number, platformCostPct = DEFAULT_PLATFORM_COST_PCT): number {
  if (ticketPriceGBP <= 0) throw new Error("ticketPriceGBP must be positive.");
  return Math.ceil(prizeValueGBP / ((1 - platformCostPct) * ticketPriceGBP));
}

// Entries needed to hit the tier's net-profit multiple.
export function targetEntries(prizeValueGBP: number, ticketPriceGBP: number, platformCostPct = DEFAULT_PLATFORM_COST_PCT): number {
  if (ticketPriceGBP <= 0) throw new Error("ticketPriceGBP must be positive.");
  return Math.ceil(requiredGrossGBP(prizeValueGBP, platformCostPct) / ticketPriceGBP);
}

export function marginSummary(prizeValueGBP: number, ticketPriceGBP: number, platformCostPct = DEFAULT_PLATFORM_COST_PCT) {
  const tier = economicsForPrize(prizeValueGBP);
  const grossRequired = requiredGrossGBP(prizeValueGBP, platformCostPct);
  const breakEven = breakEvenEntries(prizeValueGBP, ticketPriceGBP, platformCostPct);
  const target = targetEntries(prizeValueGBP, ticketPriceGBP, platformCostPct);
  return {
    tier: tier.label,
    multiple: tier.multiple,
    netProfitTargetGBP: netProfitTargetGBP(prizeValueGBP),
    grossRequiredGBP: grossRequired,
    breakEvenEntries: breakEven,
    targetEntries: target,
    netProfitAtTargetGBP: Math.round(grossRequired * (1 - platformCostPct)) - prizeValueGBP,
  };
}
