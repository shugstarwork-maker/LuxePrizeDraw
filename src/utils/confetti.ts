import confetti from "canvas-confetti";

/**
 * Fires a celebratory golden & emerald confetti explosion
 */
export const triggerGoldConfetti = () => {
  // Center burst
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#D4AF37", "#FFDF73", "#FFFFFF", "#10B981", "#F59E0B"],
    ticks: 250,
    gravity: 1.1,
    scalar: 1.1,
    shapes: ["circle", "square"],
  });

  // Left cannon
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: ["#D4AF37", "#FFD700", "#34D399", "#FBBF24"],
    });
  }, 150);

  // Right cannon
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: ["#D4AF37", "#FFD700", "#34D399", "#FBBF24"],
    });
  }, 300);
};
