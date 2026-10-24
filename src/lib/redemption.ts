// Prize Redemption Store — pre-launch catalogue preview.
// Everything here is display-only: the store is locked until launch, KYC
// providers are live, and legal sign-off lands. Poker/social chips can NEVER
// be converted into cash, credit or prizes — redemption spends verified
// winnings credit only, behind an approved 18+ KYC check.

export type RedemptionCategory = "cash_credit" | "gift_card" | "tech" | "experience" | "merch";

export type RedemptionItem = {
  id: string;
  name: string;
  category: RedemptionCategory;
  costPence: number;      // price in winnings-credit pence — never chips
  blurb: string;
  icon: string;           // emoji placeholder until artwork is commissioned
  preview: true;          // every item is preview-only pre-launch
};

export const REDEMPTION_ITEMS: RedemptionItem[] = [
  { id: "credit-20", name: "£20 cash credit", category: "cash_credit", costPence: 2000, blurb: "Straight to your verified PayPal or bank. The withdrawal floor — payouts start here.", icon: "💷", preview: true },
  { id: "credit-50", name: "£50 cash credit", category: "cash_credit", costPence: 5000, blurb: "Verified winnings, paid to the name on your ID. Nothing else clears compliance.", icon: "💷", preview: true },
  { id: "credit-100", name: "£100 cash credit", category: "cash_credit", costPence: 10000, blurb: "Inside the £500 daily cap — larger wins pay out across multiple days.", icon: "💰", preview: true },
  { id: "gift-amazon-25", name: "£25 Amazon gift card", category: "gift_card", costPence: 2500, blurb: "Delivered by email to your verified account address.", icon: "🎁", preview: true },
  { id: "gift-apple-50", name: "£50 Apple gift card", category: "gift_card", costPence: 5000, blurb: "App Store, Music, iCloud — topped up digitally.", icon: "🍏", preview: true },
  { id: "tech-airpods", name: "AirPods Pro", category: "tech", costPence: 22900, blurb: "Shipped tracked to your verified address after KYC approval.", icon: "🎧", preview: true },
  { id: "tech-ps5", name: "PlayStation 5 Slim", category: "tech", costPence: 47900, blurb: "The headline tech shelf item — one per verified account per month.", icon: "🎮", preview: true },
  { id: "exp-supercar", name: "Supercar track day", category: "experience", costPence: 99900, blurb: "A lap day for two — the store's Luxe-tier showpiece.", icon: "🏎️", preview: true },
  { id: "exp-hotel", name: "5★ weekend break", category: "experience", costPence: 75000, blurb: "Two nights, UK luxury hotel, booked in the verified winner's name.", icon: "🏨", preview: true },
  { id: "merch-hoodie", name: "Luxe champion hoodie", category: "merch", costPence: 4500, blurb: "League-champion embroidered hoodie — bragging rights you can wear.", icon: "👕", preview: true },
  { id: "merch-cards", name: "Gold-foil card deck", category: "merch", costPence: 1500, blurb: "The Luxe table deck, gold foil on black stock.", icon: "♛", preview: true },
];

export const REDEMPTION_CATEGORIES: { id: RedemptionCategory | "all"; label: string }[] = [
  { id: "all", label: "Everything" },
  { id: "cash_credit", label: "Cash credit" },
  { id: "gift_card", label: "Gift cards" },
  { id: "tech", label: "Tech" },
  { id: "experience", label: "Experiences" },
  { id: "merch", label: "Merch" },
];

export function formatPence(pence: number): string {
  return `£${(pence / 100).toLocaleString("en-GB", { maximumFractionDigits: 0 })}`;
}

// The three rules the store UI must always state, in plain English.
export const STORE_RULES = [
  "Poker and social chips have no cash value and can never be redeemed — ever.",
  "Redemption spends verified winnings credit only, after an approved 18+ ID check.",
  "Payouts run £20 minimum to a £500 daily maximum, to the name on your verified ID.",
] as const;
