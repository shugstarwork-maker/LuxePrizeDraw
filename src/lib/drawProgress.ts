// Ticket progress toward unlocking a draw. Entries are not open yet, so no
// tickets are counted: every draw starts at zero. Real counts replace ticketsSold
// only once entries are licensed and open.
export const ticketsSold = (_drawId: string): number => 0;

// Tickets needed before the prize is covered, before admin and processing fees.
export const ticketsToUnlock = (prizeGBP: number, entryPence: number): number => Math.ceil((prizeGBP * 100) / entryPence);

/** Proposed revenue target divided by the entry price, rounded up in whole pennies. */
export const indicativeTicketTarget = (targetGBP: number, priceGBP: number): number => {
  const pricePence = Math.round(priceGBP * 100);
  const targetPence = Math.round(targetGBP * 100);
  if (pricePence < 1) return 0;
  return Math.ceil(targetPence / pricePence);
};

export const formatTickets = (n: number) => n.toLocaleString("en-GB");
