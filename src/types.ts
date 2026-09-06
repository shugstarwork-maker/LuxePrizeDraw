export interface PrizePillar {
  id: string;
  title: string;
  shortTitle: string;
  valueGBP: string;
  tagline: string;
  badge: string;
  iconName: string;
  accentColor: string;
  description: string;
  keyDeliverables: string[];
  specifications: { label: string; value: string }[];
  highlightQuote: string;
}

export interface CompetitionTicket {
  ticketId: string;
  fullName: string;
  email: string;
  country: string;
  phone?: string;
  businessIdea?: string;
  targetIndustry?: string;
  entryTimestamp: string;
  ticketStatus: "VERIFIED_ACTIVE" | "PENDING_DRAW" | "GOLD_BONUS" | "PREVIEW_ONLY";
  drawDate: string;
  bonusEntriesAwarded: number;
  totalTickets: number;
}

export interface AiPitchEvaluation {
  feasibilityScore: number;
  executiveSummary: string;
  recommendedFreezone: string;
  whyThisZone: string;
  appOneClickFeatureConcept: string;
  aiCopilotIntegration: string;
  budgetAllocation100k: {
    category: string;
    amountGBP: number;
    description: string;
  }[];
  threeYearRoadmap: {
    year: string;
    milestone: string;
  }[];
  suggestedBrandNames: string[];
  competitiveAdvantage: string;
}

export interface BookingDemoSlot {
  id: string;
  serviceTitle: string;
  duration: string;
  priceGBP: number;
  timeSlot: string;
  vipTier: string;
  instantAvailability: boolean;
}

export interface CustomizerState {
  companyType: "freezone" | "mainland";
  selectedZone: string;
  industry: string;
  brandArchetype: string;
  primaryColor: string;
  appTheme: "dark-luxury" | "emerald-gold" | "ultra-clean";
  oneClickFeatureType: "service-booking" | "vip-concierge" | "instant-checkout" | "consult-dispatch";
}

export interface RecentEntrant {
  id: string;
  name: string;
  country: string;
  timestamp: string;
  business: string;
  entryType?: "FREE" | "SUBSCRIBER_VIP" | "POWER_BUNDLE";
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  priceGBP: number;
  interval: "month";
  recurringTicketsPerMonth: number;
  multiplier: string;
  badge: string;
  popular?: boolean;
  features: string[];
  charityDonationGBP: number;
}

export interface TicketBundle {
  id: string;
  name: string;
  category: "Cash Challenges" | "Tech & Gaming" | "Travel & Lifestyle" | "Instant Wins";
  prizeValueGBP: number;
  tickets: number;
  priceGBP: number;
  badge?: string;
  charityDonationGBP: number;
}

export interface CharityImpactMetrics {
  totalRaisedGBP: number;
  percentageDonated: number;
  scholarshipsFunded: number;
  microGrantsAwarded: number;
  partnerCharities: {
    name: string;
    focus: string;
    logoText: string;
    description: string;
  }[];
}

export interface DrawAuditRecord {
  systemType: "CRYPTOGRAPHIC_CSPRNG" | "CERTIFIED_PHYSICAL_BLOWER";
  serverSeedHash: string;
  publicClientSeed: string;
  blockHeight: number;
  bitcoinBlockHash: string;
  nistBeaconOutput: string;
  merkleRoot: string;
  physicalDrumModel: string;
  ballWeightTolerance: string;
  auditorOrganization: string;
  certNumber: string;
  lastCalibrated: string;
}

export interface CompetitionStats {
  totalEntries: number;
  prizePoolValueGBP: number;
  cashPrizeGBP: number;
  visaYears: number;
  recentEntrants: RecentEntrant[];
  drawDate: string;
  charityImpact?: CharityImpactMetrics;
  auditRecord?: DrawAuditRecord;
}
