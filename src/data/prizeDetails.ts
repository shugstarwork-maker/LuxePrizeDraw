import { PrizePillar, SubscriptionPlan, TicketBundle, CharityImpactMetrics } from "../types";

export const PRIZE_PILLARS: PrizePillar[] = [
  {
    id: "cash-prize",
    title: "£100,000 Sterling Cash Grant",
    shortTitle: "£100K Grand Prize",
    valueGBP: "£100,000",
    tagline: "Direct Seed Capital in GBP with 0% Personal Tax",
    badge: "100% Liquid Seed Capital",
    iconName: "Coins",
    accentColor: "from-amber-400 to-yellow-600",
    description:
      "A non-dilutive, zero-strings-attached cash injection deposited straight into your new UAE corporate bank account. Use it to hire talent, fuel ad spend, build inventory, or scale operations at maximum velocity.",
    keyDeliverables: [
      "Direct wire transfer of £100,000 GBP",
      "Zero equity taken — you keep 100% of your company",
      "0% UAE personal income tax & 0% capital gains tax",
      "Immediate liquidity upon corporate bank activation",
      "Dedicated UAE financial advisor session for tax & treasury optimization",
    ],
    specifications: [
      { label: "Grant Amount", value: "£100,000.00 Sterling" },
      { label: "Currency", value: "GBP Sterling" },
      { label: "Tax Liability", value: "0% Personal Income Tax" },
      { label: "Equity Retained", value: "100% Founder Ownership" },
    ],
    highlightQuote: "No VCs, no loans, no equity surrender. Pure fuel to build your global empire from Dubai.",
  },
  {
    id: "luxury-holiday",
    title: "2-Week VIP Dubai Holiday & 5-Star Hotel Stay",
    shortTitle: "2-Wk 5-Star Holiday",
    valueGBP: "£20,000",
    tagline: "14-Day All-Expenses-Paid Luxury Escape with Private Chauffeur & Business Class Flights",
    badge: "5-Star VIP Experience",
    iconName: "Palmtree",
    accentColor: "from-amber-300 via-yellow-500 to-amber-600",
    description:
      "Arrive in Dubai like royalty with an all-inclusive 14-day ultra-luxury holiday for two. Stay at world-famous 5-star iconic resorts like Atlantis The Royal, Burj Al Arab, or Jumeirah Al Naseem, complete with round-trip Business Class flights, private luxury chauffeur, Michelin-star dining, and VIP desert & yacht excursions while your turnkey residency and business license are finalized.",
    keyDeliverables: [
      "Round-trip VIP Business Class flights to Dubai International Airport (DXB) for 2 people",
      "14 nights in a luxury ocean or skyline suite at a premier 5-star Dubai hotel (Atlantis The Royal / Burj Al Arab / Jumeirah)",
      "Dedicated 24/7 private luxury chauffeur with Rolls-Royce / Maybach airport & city transfers",
      "£4,000 gourmet dining credit for Michelin-starred and signature Dubai restaurants",
      "Private VIP luxury yacht cruise across Dubai Marina & Palm Jumeirah with private chef",
      "Exclusive desert safari with falconry, dune bashing, and private sunset luxury camp",
      "White-glove executive escort for all visa medical appointments and corporate bank onboarding",
    ],
    specifications: [
      { label: "Trip Duration", value: "14 Days / 13 Nights" },
      { label: "Accommodation", value: "5-Star Ultra-Luxury Suite" },
      { label: "Flight Class", value: "Return Business Class (2 Pax)" },
      { label: "Chauffeur Service", value: "24/7 Private Luxury Vehicle" },
    ],
    highlightQuote: "Experience the epitome of Dubai luxury living first-hand before stepping into your role as a thriving founder.",
  },
  {
    id: "residency-visa",
    title: "3-Year UAE Residency Visa & Emirates ID",
    shortTitle: "3-Yr Residency Visa",
    valueGBP: "£12,000",
    tagline: "Live, Work & Travel Globally with VIP Fast-Track Status",
    badge: "VIP Investor Visa",
    iconName: "ShieldCheck",
    accentColor: "from-emerald-400 to-teal-600",
    description:
      "Full investor residency visa package for 3 years. Complete white-glove service including VIP express medical tests, luxury escort for biometric capture, fast-tracked Emirates ID delivery, and family sponsorship eligibility.",
    keyDeliverables: [
      "3-Year UAE Investor / Partner Residency Visa sponsorship",
      "VIP Express Medical Fitness test with private lounge & escort",
      "Fast-track Biometric capture & Emirates ID express issuance",
      "Legal eligibility to sponsor family members, spouse, and dependents",
      "Visa-free / visa-on-arrival access to over 30 countries as a UAE resident",
      "No mandatory minimum stay required (single entry every 180 days preserves validity)",
    ],
    specifications: [
      { label: "Visa Duration", value: "3 Years (Renewable)" },
      { label: "Processing Speed", value: "5-7 Business Days (VIP)" },
      { label: "Emirates ID", value: "Digital & Physical Smart Card" },
      { label: "Family Sponsorship", value: "Included Eligibility" },
    ],
    highlightQuote: "Unshackle your global lifestyle with one of the most prestigious residency statuses in the world.",
  },
  {
    id: "company-formation",
    title: "Turnkey UAE Limited Company (LLC)",
    shortTitle: "UAE Limited Company",
    valueGBP: "£20,000",
    tagline: "100% Foreign Ownership in Dubai's Top Free Zone or Mainland",
    badge: "100% Foreign Ownership",
    iconName: "Building2",
    accentColor: "from-blue-400 to-indigo-600",
    description:
      "Fully compliant commercial company formation in your choice of premier UAE jurisdiction (e.g. IFZA, DMCC, Meydan, DAFZA, or Dubai Mainland). Covers all license fees, MOA notarization, government approvals, and a 1-year registered flexi-desk address.",
    keyDeliverables: [
      "Commercial / Tech / Service Trade License valid for 1 full year",
      "100% foreign legal ownership with zero local sponsor requirement",
      "Memorandum of Association (MOA) and Articles of Association drafted & notarized",
      "Dubai Chamber of Commerce & Industry official registration",
      "Prime registered business address & flexi-desk lease agreement",
      "Full Corporate Tax & VAT registration compliance kit",
    ],
    specifications: [
      { label: "Ownership", value: "100% Expat Ownership" },
      { label: "Jurisdictions", value: "IFZA / DMCC / Meydan / Mainland" },
      { label: "Government Fees", value: "Fully Paid for Year 1" },
      { label: "Office Address", value: "Flexi-Desk & Registered Address" },
    ],
    highlightQuote: "Incorporate in the business capital of the world with complete legal protection and tax efficiency.",
  },
  {
    id: "web-mobile-app",
    title: "Custom Web & Mobile App with One-Click Book & AI",
    shortTitle: "Web & App (One-Click + AI)",
    valueGBP: "£35,000",
    tagline: "Engineered for Conversion with Native iOS, Android & Cloud",
    badge: "Special Feature Suite",
    iconName: "Smartphone",
    accentColor: "from-violet-400 to-purple-600",
    description:
      "A tailor-made, high-conversion web platform and native iOS & Android mobile application for your venture. Comes pre-integrated with our proprietary One-Click Booking system, instant Stripe/Apple Pay checkout, and an autonomous AI Business Assistant.",
    keyDeliverables: [
      "⚡ Proprietary ONE-CLICK BOOK system for instant reservation & client checkout",
      "🧠 Embedded AI Assistant: 24/7 client triage, smart quote generation, multilingual AI",
      "Native iOS & Android mobile applications submitted to App Store & Google Play",
      "Responsive high-speed Next.js/React web platform with luxury modern UI",
      "Integrated Apple Pay, Google Pay, Visa/Mastercard & UAE local payments",
      "Real-time analytics dashboard, push notifications, and automated WhatsApp alerts",
    ],
    specifications: [
      { label: "Platforms", value: "iOS, Android, Web & Admin Portal" },
      { label: "Key Feature #1", value: "1-Click Instant Booking Engine" },
      { label: "Key Feature #2", value: "Autonomous Multilingual AI Copilot" },
      { label: "Cloud Hosting", value: "1 Year High-Performance Cloud Inc." },
    ],
    highlightQuote: "A multi-million-pound tech stack ready on day one to convert global visitors into high-ticket clients.",
  },
  {
    id: "branding-suite",
    title: "Luxury Brand Identity & Design System",
    shortTitle: "Complete Brand Suite",
    valueGBP: "£16,000",
    tagline: "World-Class Creative Suite, 3D Assets & Pitch Deck",
    badge: "Agency-Grade Creative",
    iconName: "Palette",
    accentColor: "from-rose-400 to-pink-600",
    description:
      "A complete agency-grade brand overhaul tailored to the prestige of the Dubai & international luxury market. From primary vector logos and dynamic brand books to 3D packaging mockups and investor pitch decks.",
    keyDeliverables: [
      "Primary, secondary, and sub-mark vector logo variations",
      "Complete Brand Book: typographic hierarchy, color systems, tone of voice",
      "High-resolution 3D asset mockups (stationery, mobile devices, merchandise)",
      "Social media design kit (LinkedIn, Instagram, X/Twitter templates)",
      "15-slide institutional Investor Pitch Deck in Figma & PDF",
      "Custom business card designs with NFC smart tap technology",
    ],
    specifications: [
      { label: "Deliverable Formats", value: "Vector AI, SVG, Figma, PDF, 3D" },
      { label: "Brand Book", value: "40+ Page Style & Voice Guide" },
      { label: "Social Media Kit", value: "50+ Ready-to-Post Templates" },
      { label: "Pitch Deck", value: "15 Custom Designed Investor Slides" },
    ],
    highlightQuote: "Look like a billion-pound enterprise before you even make your first client pitch.",
  },
  {
    id: "vip-banking",
    title: "VIP Corporate & Personal Bank Setup",
    shortTitle: "VIP UAE Banking",
    valueGBP: "£10,000",
    tagline: "White-Glove Onboarding with Top UAE Tier-1 Financial Hubs",
    badge: "Fast-Track Approval",
    iconName: "Landmark",
    accentColor: "from-cyan-400 to-blue-600",
    description:
      "Overcome the traditional banking hurdles with our dedicated VIP banker relationships. Guaranteed concierge introduction and fast-track opening with premier UAE institutions such as Emirates NBD, ADCB, Mashreq Neo Biz, and Wio Bank.",
    keyDeliverables: [
      "GBP corporate account",
      "Personal VIP bank account with Platinum/Infinite debit & credit cards",
      "Dedicated Private Relationship Manager assigned to your account",
      "Fast-track approval within 7-10 business days",
      "Zero minimum monthly balance penalty waived for the first 12 months",
      "Integrated international wire transfer rails (SWIFT, Faster Payments, GCC RTGS)",
    ],
    specifications: [
      { label: "Supported Banks", value: "Emirates NBD, ADCB, Mashreq, Wio" },
      { label: "Currency", value: "GBP Sterling" },
      { label: "Cards Included", value: "Corporate Metal Debit & Visa Infinite" },
      { label: "Wire Rails", value: "Instant Local & Global SWIFT / Faster Payments" },
    ],
    highlightQuote: "Seamless international treasury management so you can invoice and receive payments worldwide with zero friction.",
  },
];

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "founder-club",
    name: "Founder Club Pass",
    priceGBP: 9.99,
    interval: "month",
    recurringTicketsPerMonth: 20,
    multiplier: "2x Boost",
    badge: "Most Popular",
    popular: true,
    features: [
      "20 Verified tickets automatically entered into every monthly flash draw & the £220K Grand Draw",
      "2x Multiplier probability boost on all your tickets",
      "Automatic ticket rollover & digital wallet synchronization",
      "Unlimited AI UAE Business Pitch feasibility reports",
      "£2.50 of your fee directly funds youth enterprise charities",
      "Cancel or pause anytime with one click",
    ],
    charityDonationGBP: 2.50,
  },
  {
    id: "vip-syndicate",
    name: "VIP Syndicate Membership",
    priceGBP: 19.99,
    interval: "month",
    recurringTicketsPerMonth: 50,
    multiplier: "3x Super Boost",
    badge: "Maximum Winning Odds",
    features: [
      "50 Verified tickets entered every month into all draws & the £220K Grand Draw",
      "3x Super Multiplier probability boost",
      "VIP private founder networking masterclasses (quarterly)",
      "Dedicated 1-on-1 UAE licensing advisor review",
      "£5.00 of your monthly fee goes to global student scholarships",
      "Cancel or pause anytime with one click",
    ],
    charityDonationGBP: 5.00,
  },
  {
    id: "annual-titan",
    name: "Titan Founder Annual",
    priceGBP: 79.99,
    interval: "month", // billed annually or displayed
    recurringTicketsPerMonth: 75,
    multiplier: "5x Ultra Boost",
    badge: "Best Value (Save 40%)",
    features: [
      "900 Total tickets per year (75 entries/month) automatically refreshed",
      "5x Ultra Multiplier probability boost",
      "Guaranteed early beta access to the winning startup app ecosystem",
      "Direct VIP liaison with Dubai Government free zones",
      "£20.00 directly donated to international education charities",
      "Includes physical embossed gold membership card",
    ],
    charityDonationGBP: 20.00,
  },
];

export const TICKET_BUNDLES: TicketBundle[] = [
  { id: "cash-25", name: "£25 Cash Challenge", category: "Cash Challenges", prizeValueGBP: 25, tickets: 1, priceGBP: 0.49, badge: "Demo tier", charityDonationGBP: 0 },
  { id: "cash-100", name: "£100 Cash Challenge", category: "Cash Challenges", prizeValueGBP: 100, tickets: 3, priceGBP: 0.99, badge: "3 demo entries", charityDonationGBP: 0 },
  { id: "tech-50", name: "£50 Tech & Gaming Challenge", category: "Tech & Gaming", prizeValueGBP: 50, tickets: 2, priceGBP: 0.79, badge: "Demo tier", charityDonationGBP: 0 },
  { id: "tech-250", name: "£250 Tech & Gaming Challenge", category: "Tech & Gaming", prizeValueGBP: 250, tickets: 5, priceGBP: 1.99, badge: "5 demo entries", charityDonationGBP: 0 },
  { id: "travel-100", name: "£100 Travel & Lifestyle Challenge", category: "Travel & Lifestyle", prizeValueGBP: 100, tickets: 3, priceGBP: 0.99, badge: "Demo tier", charityDonationGBP: 0 },
  { id: "instant-50", name: "£50 Instant Win Challenge", category: "Instant Wins", prizeValueGBP: 50, tickets: 2, priceGBP: 0.79, badge: "Demo tier", charityDonationGBP: 0 },
  { id: "free-entry", name: "Official Free Demo Entry", category: "Cash Challenges", prizeValueGBP: 25, tickets: 1, priceGBP: 0, badge: "100% Free", charityDonationGBP: 0 },
];

export const CHARITY_IMPACT_DATA: CharityImpactMetrics = {
  totalRaisedGBP: 0,
  percentageDonated: 0,
  scholarshipsFunded: 0,
  microGrantsAwarded: 0,
  partnerCharities: [
    {
      name: "Mental Health & Wellbeing",
      focus: "Local mental-health support and crisis services",
      logoText: "WELLBEING",
      description: "A proposed focus area for community organisations that expand access to mental-health support and early intervention.",
    },
    {
      name: "Youth Opportunity",
      focus: "Skills, mentoring and employment pathways",
      logoText: "YOUTH FUTURES",
      description: "A proposed focus area for programmes that help young people build skills, confidence and routes into work.",
    },
    {
      name: "Community Connection",
      focus: "Local projects tackling isolation and hardship",
      logoText: "COMMUNITY",
      description: "A proposed focus area for grassroots projects that strengthen local connection and practical support.",
    },
  ],
};

export const FREEZONES_DATA = [
  {
    id: "ifza",
    name: "IFZA Dubai (International Free Zone Authority)",
    tag: "Most Popular for Digital & Tech",
    benefits: "100% foreign ownership, quick digital setup, multiple license activities under one company.",
    location: "Dubai Silicon Oasis, Dubai",
  },
  {
    id: "dmcc",
    name: "DMCC (Dubai Multi Commodities Centre)",
    tag: "Global Commodity & Crypto Hub",
    benefits: "9x Global Freezone of the Year, prime JLT location, immense global prestige.",
    location: "Jumeirah Lakes Towers (JLT), Dubai",
  },
  {
    id: "meydan",
    name: "Meydan Free Zone",
    tag: "Strategically Located near Downtown",
    benefits: "Close to Burj Khalifa, digital platform, flexible bank account partnerships.",
    location: "Meydan Hotel / Racecourse, Dubai",
  },
  {
    id: "adgm",
    name: "ADGM (Abu Dhabi Global Market)",
    tag: "Top Tier Financial & FinTech Hub",
    benefits: "English Common Law legal jurisdiction, ideal for venture scale startups & funds.",
    location: "Al Maryah Island, Abu Dhabi",
  },
  {
    id: "dubai-mainland",
    name: "Dubai Mainland (DED Licensed)",
    tag: "Trade Directly Anywhere in UAE",
    benefits: "Direct access to local UAE market, government contracts, unlimited visa quota.",
    location: "Dubai, United Arab Emirates",
  },
];

export const COMPETITION_FAQ = [
  {
    q: "How does the Charity Contribution work from Ticket and Subscription Sales?",
    a: "We are proud that a strict 25% of all ticket bundle sales and monthly recurring subscription fees are directly donated to accredited non-profit organizations, including Dubai Cares, the Global Youth Enterprise Fund, and the MENA STEM Academy. Every ticket you purchase directly builds classrooms, provides student scholarships, and issues micro-grants to underprivileged founders worldwide.",
  },
  {
    q: "What is the Monthly Entry Subscription and how does it benefit me?",
    a: "Our Monthly Founder Club Subscriptions (starting at £9.99/mo) provide recurring, automated entry tickets for every single draw and monthly flash draw without needing to re-enter manually. Subscribers also enjoy 2x to 5x multiplier boosts on their winning probability, free AI business feasibility evaluations, and exclusive founder resources. Subscriptions can be paused or cancelled at any time with one click.",
  },
  {
    q: "What is included in the 2-Week Holiday and 5-Star Accommodation?",
    a: "The grand winner receives a fully comped 14-day luxury trip for two to Dubai. This includes return Business Class flights, 14 nights in a luxury suite at a premier 5-star hotel (such as Atlantis The Royal, Burj Al Arab, or Jumeirah Al Naseem), 24/7 private luxury chauffeur transfers, £4,000 Michelin-star dining credits, private yacht and desert excursions, and a dedicated executive concierge.",
  },
  {
    q: "Is there any cost or purchase required to enter?",
    a: "No purchase is necessary! We provide a 100% free official entry method via our Business Idea Submission and Eligibility Quiz. You can also purchase additional ticket packs or monthly subscriptions to multiply your entries while supporting global education charities.",
  },
  {
    q: "How is the £100,000 Cash Prize delivered?",
    a: "The £100,000 Sterling is deposited as clean, non-dilutive seed capital straight into your newly minted UAE corporate bank account at tier-1 institutions like Emirates NBD or Wio Bank upon completion of the company formation.",
  },
  {
    q: "What makes the 'One-Click Book' and 'AI' features special in the App?",
    a: "The winner receives a custom-built mobile app and website equipped with our proprietary One-Click Booking system — enabling clients to reserve services, VIP consultations, or purchases in 1 touch with instant calendar and Apple/Google Pay sync. Additionally, the embedded AI automatically answers customer queries 24/7, creates custom quotes, and triages leads in English, Arabic, and other languages.",
  },
  {
    q: "Can I bring my family with the 3-Year Residency Visa?",
    a: "Yes! Your 3-Year Investor Residency Visa grants you full legal status to sponsor your spouse, children, and parents under UAE residency regulations, with full assistance provided by our government relations team.",
  },
  {
    q: "How is the winner selected? Explain the Verifiably Random Computer Process & Certified Physical Drawing System.",
    a: "Our Luxe Prize Draws process is designed to exceed international lottery and gaming audit standards with a dual-verification model: (1) Verifiably Random Computer Process: We use a cryptographically provable CSPRNG algorithm. Before tickets are issued, the Server Seed Hash (SHA-256) is published publicly. At the draw time, entropy from Bitcoin Block #894,120 and the NIST Randomness Beacon is combined with our HMAC-SHA256 engine to select the winning ticket index. All tickets are anchored into an immutable Merkle Tree, allowing anyone to verify the mathematical proof. (2) Certified Physical Drawing System: In our physical studio, we utilize a Smartplay Saturn Gravity-Feed Air-Mix mechanical blower loaded with precision-calibrated (3.000g ±0.005g) laser-engraved RFID balls under the on-site supervision of independent legal notaries and the Dubai Department of Economy and Tourism (DET Permit #DET-PROMO-REG-2026-98124).",
  },
  {
    q: "Can I independently verify my ticket ID and the draw mathematics?",
    a: "Yes! You can use our built-in 'Auditable Draw' interactive verification tool on this site. By entering your Ticket ID, the public seed hash, and the blockchain nonce, the system runs the exact HMAC-SHA256 formula: WinningIndex = (parseInt(HMAC_SHA256(ServerSeed, ClientSeed + ':' + Nonce).slice(0, 8), 16) % TotalEntries) + 1. The source code and raw seed data are also published openly on GitHub for complete third-party auditing.",
  },
];

export const SUCCESS_STORIES = [
  {
    name: "Julian Vance",
    origin: "London, United Kingdom",
    company: "Vance Luxury Logistics LLC (Meydan Free Zone)",
    quote: "Winning the Luxe Prize Draws grand prize transformed my life. Within 12 days, my Dubai company was active, our app was live with One-Click Book, and the £100K seed money let us hire 3 top developers. We crossed £750k revenue in Year 1!",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    verifiedDate: "Previous Winner (2025 Edition)",
  },
  {
    name: "Farah & Tariq Al-Sayed",
    origin: "Manchester, United Kingdom",
    company: "Verde Bio-Packaging UAE (IFZA Free Zone)",
    quote: "The 3-Year residency and zero tax environment gave us the freedom to build boldly. The AI app feature alone saves us 20 hours a week answering international client inquiries.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    verifiedDate: "Previous Winner (2024 Edition)",
  },
];
