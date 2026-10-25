// App Store / Google Play review mode.
// When ON, the app presents as a 100% free-play social game: prize lobbies,
// Sweep Ticket references and the redemption store are hidden from review
// builds. Flipped via remote config at launch (Firebase Remote Config);
// locally it is controlled by a toggle or the ?review=1 URL flag.

const REVIEW_KEY = "luxe-review-mode";

export function reviewModeEnabled(): boolean {
  try {
    if (typeof window !== "undefined" && window.location.search.includes("review=1")) return true;
    return localStorage.getItem(REVIEW_KEY) === "1";
  } catch {
    return false;
  }
}

export function setReviewMode(on: boolean): void {
  try {
    if (on) localStorage.setItem(REVIEW_KEY, "1");
    else localStorage.removeItem(REVIEW_KEY);
  } catch { /* demo only */ }
}
