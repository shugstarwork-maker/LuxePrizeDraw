export const soundEffects = {
  button: "/audio/button.mp3",
  ticketSelect: "/audio/ticket-select.mp3",
  ticketPurchase: "/audio/ticket-purchase.mp3",
  success: "/audio/success.mp3",
  error: "/audio/error.mp3",
  drawStart: "/audio/draw-start.mp3",
  drawSuspense: "/audio/draw-suspense.mp3",
  winnerReveal: "/audio/winner-reveal.mp3",
  jackpotReveal: "/audio/jackpot-reveal.mp3",
  notification: "/audio/notification.mp3",
} as const;

export type SoundEffect = keyof typeof soundEffects | "cardDeal" | "chipStack" | "levelUp" | "coinWin";
export const backgroundMusic = "/audio/luxe-ambient.mp3";
// Switch to true only after licensed files are added under public/audio/.
export const licensedAudioEnabled = false;
