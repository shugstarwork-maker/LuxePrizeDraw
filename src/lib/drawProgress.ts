// Ticket progress toward unlocking a draw. Entries are not open yet, so no
// tickets are counted: every draw starts at zero. Real counts replace ticketsSold
// only once entries are licensed and open.
export const ticketsSold = (_drawId: string): number => 0;

// Tickets needed before the prize is covered, before admin and processing fees.
export const ticketsToUnlock = (prizeGBP: number, entryPence: number): number => Math.ceil((prizeGBP * 100) / entryPence);

export const formatTickets = (n: number) => n.toLocaleString("en-GB");
