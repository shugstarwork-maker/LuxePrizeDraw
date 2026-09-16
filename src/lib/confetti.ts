import confetti from "canvas-confetti";

/**
 * Triggers a multi-stage golden luxury celebration explosion
 * when a user successfully enters the competition or purchases tickets.
 */
export const triggerCompetitionEntryConfetti = (isVipSubscriber: boolean = false) => {
  if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  // Main center burst
  confetti({
    particleCount: isVipSubscriber ? 180 : 120,
    spread: 100,
    startVelocity: 45,
    origin: { y: 0.6, x: 0.5 },
    colors: ["#D4AF37", "#F59E0B", "#10B981", "#E11D48", "#FFFFFF", "#FDE047"],
    shapes: ["circle", "square"],
    ticks: 250,
    scalar: 1.1,
  });

  // Left cannon shot
  setTimeout(() => {
    confetti({
      particleCount: isVipSubscriber ? 75 : 50,
      angle: 60,
      spread: 70,
      origin: { x: 0.05, y: 0.75 },
      colors: ["#D4AF37", "#FBBF24", "#34D399", "#FFFFFF"],
      startVelocity: 55,
      ticks: 220,
    });
  }, 180);

  // Right cannon shot
  setTimeout(() => {
    confetti({
      particleCount: isVipSubscriber ? 75 : 50,
      angle: 120,
      spread: 70,
      origin: { x: 0.95, y: 0.75 },
      colors: ["#D4AF37", "#FBBF24", "#60A5FA", "#FFFFFF"],
      startVelocity: 55,
      ticks: 220,
    });
  }, 320);

  // Final shimmering star shower
  setTimeout(() => {
    confetti({
      particleCount: isVipSubscriber ? 60 : 40,
      spread: 120,
      startVelocity: 30,
      origin: { y: 0.45, x: 0.5 },
      colors: ["#D4AF37", "#FEF08A", "#FCD34D", "#FFFFFF"],
      ticks: 280,
      scalar: 1.2,
    });
  }, 600);
};

/**
 * Triggers a brilliant celebratory confetti effect when an AI Pitch Evaluation completes.
 */
export const triggerAiPitchEvaluatedConfetti = () => {
  // Center high-energy burst
  confetti({
    particleCount: 110,
    spread: 80,
    startVelocity: 40,
    origin: { y: 0.6, x: 0.5 },
    colors: ["#D4AF37", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#FFFFFF"],
    ticks: 200,
    scalar: 1.05,
  });

  // Dual side fireworks
  setTimeout(() => {
    confetti({
      particleCount: 45,
      angle: 65,
      spread: 55,
      origin: { x: 0.15, y: 0.7 },
      colors: ["#D4AF37", "#8B5CF6", "#38BDF8"],
      startVelocity: 48,
    });
    confetti({
      particleCount: 45,
      angle: 115,
      spread: 55,
      origin: { x: 0.85, y: 0.7 },
      colors: ["#D4AF37", "#10B981", "#FBBF24"],
      startVelocity: 48,
    });
  }, 220);
};

/**
 * Triggers a quick instant booking celebration.
 */
export const triggerInstantBookingConfetti = () => {
  confetti({
    particleCount: 90,
    spread: 75,
    origin: { y: 0.65, x: 0.5 },
    colors: ["#D4AF37", "#10B981", "#3B82F6", "#F59E0B"],
    startVelocity: 38,
    ticks: 180,
  });
};
