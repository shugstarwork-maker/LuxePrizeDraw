export type PrizeDraw = {
  id: string;
  prize: string;
  price: string;
  category: string;
  description: string;
  image: string;
  accent: string;
  status: "Preview" | "Coming soon";
};

export const PRIZE_DRAWS: PrizeDraw[] = [
  { id: "cash-500", prize: "£500 Cash", price: "10p", category: "Cash", description: "A smaller cash-prize draw preview.", image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1400&q=85", accent: "from-amber-300 via-yellow-500 to-orange-600", status: "Preview" },
  { id: "cash-1000", prize: "£1,000 Cash", price: "25p", category: "Cash", description: "A larger weekly cash-prize draw preview.", image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1400&q=85", accent: "from-rose-400 via-pink-500 to-violet-600", status: "Preview" },
  { id: "grand-tourer", prize: "Grand Tourer", price: "50p", category: "Vehicles", description: "A premium vehicle prize preview with a cash-alternative placeholder.", image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=85", accent: "from-sky-400 via-blue-500 to-indigo-700", status: "Coming soon" },
  { id: "heritage-watch", prize: "Heritage Watch", price: "50p", category: "Watches", description: "A premium timepiece prize preview with a cash-alternative placeholder.", image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1400&q=85", accent: "from-stone-200 via-amber-500 to-stone-700", status: "Coming soon" },
  { id: "tech-suite", prize: "Tech Suite", price: "25p", category: "Tech", description: "A high-end technology prize preview with a cash-alternative placeholder.", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1400&q=85", accent: "from-violet-400 via-fuchsia-500 to-pink-600", status: "Coming soon" },
  { id: "weekend-escape", prize: "Weekend Escape", price: "25p", category: "Experiences", description: "An original lifestyle-prize preview with a cash-alternative placeholder.", image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=85", accent: "from-emerald-400 via-teal-500 to-cyan-700", status: "Coming soon" },
];

export const getPrizeDraw = (id: string | null) => PRIZE_DRAWS.find((draw) => draw.id === id) || PRIZE_DRAWS[0];
