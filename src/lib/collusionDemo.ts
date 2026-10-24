// Collusion demo telemetry — gives the verification centre realistic
// connection facts to exercise the proximity gate against. Pre-launch only.

import { checkPrizeSeating, type ProximityVerdict } from "./collusion";
import { demoDeviceFingerprint } from "./verification";

export type DemoScenario = {
  id: string;
  label: string;
  description: string;
  verdict: ProximityVerdict;
};

/** The three scenarios the demo walks through on /verify. */
export function demoScenarios(): DemoScenario[] {
  const me = { userId: "you", ip: "203.0.113.10", networkId: demoDeviceFingerprint() };
  return [
    {
      id: "clean",
      label: "Different opponent, different city",
      description: "Separate IP, separate network, no shared history.",
      verdict: checkPrizeSeating(me, { userId: "opp-clean", ip: "198.51.100.77", networkId: "demo-other" }, []),
    },
    {
      id: "same-ip",
      label: "Same household IP",
      description: "Both players connect from the same public IP address.",
      verdict: checkPrizeSeating(me, { userId: "opp-sameip", ip: "203.0.113.10", networkId: "demo-other" }, []),
    },
    {
      id: "repeat",
      label: "Repeated prize opponent",
      description: "Six prize matches against the same account this month.",
      verdict: checkPrizeSeating(me, { userId: "opp-repeat", ip: "198.51.100.9", networkId: "demo-other" },
        Array.from({ length: 6 }, (_, i) => ({ opponentId: "opp-repeat", stakes: "prize" as const, at: Date.now() - (i + 1) * 3 * 24 * 3600 * 1000 }))),
    },
  ];
}
