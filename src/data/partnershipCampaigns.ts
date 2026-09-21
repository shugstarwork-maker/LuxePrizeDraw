export type PartnershipStatus = "OPPORTUNITY" | "CONFIRMED";

export interface PartnershipCampaign {
  slug: string;
  partnerName: string;
  partnerWebsite: string;
  partnershipStatus: PartnershipStatus;
  heroImage: string;
  prizeTitle: string;
  prizeDescription: string;
  vehicle: string;
  duration?: string;
  location: string;
  delivery: string;
  prizeTerms?: string;
  prizeValue?: string;
  currentEntries?: number;
  maximumEntries?: number;
  drawDate?: string;
  entryCost?: string;
  campaignStatus: "DRAFT" | "LIVE" | "CLOSED";
  charity?: { name?: string; contribution?: string; amountRaised?: number; message?: string };
}

export const NORTHERN_SUPERCAR_HIRE_CAMPAIGN: PartnershipCampaign = {
  slug: "northern-supercar-hire",
  partnerName: "Northern Supercar Hire",
  partnerWebsite: "https://northernsupercarhire.com/",
  partnershipStatus: "OPPORTUNITY",
  heroImage: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2200&q=85",
  prizeTitle: "Luxury Supercar Driving Experience",
  prizeDescription: "A potential LuxePrizeDraw automotive experience, subject to campaign approval and published prize terms.",
  vehicle: "Selected from participating Northern Supercar Hire vehicles",
  location: "UK",
  delivery: "Subject to participating vehicle and booking terms",
  campaignStatus: "DRAFT",
  charity: { amountRaised: 0 },
};
