import { useEffect, useRef } from "react";

// Luxe casino felt: radial onyx cloth, walnut-and-gold rail, chip-stack
// pot display, faint gold watermark. Pure canvas decoration — no game logic.
export function PokerTableCanvas({ pot, stage, seats }: { pot: number; stage: string; seats?: { name: string; chips: string }[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const draw = () => {
      const r = c.getBoundingClientRect(), d = Math.min(devicePixelRatio, 2);
      c.width = r.width * d; c.height = r.height * d; ctx.setTransform(d, 0, 0, d, 0, 0);
      const w = r.width, h = r.height, cx = w / 2, cy = h / 2;
      const RX = w * 0.44, RY = h * 0.33;

      // --- rail: outer gold band + walnut ring ---
      const rail = ctx.createLinearGradient(0, cy - RY - 26, 0, cy + RY + 26);
      rail.addColorStop(0, "#8a6420"); rail.addColorStop(0.5, "#d4af37"); rail.addColorStop(1, "#6b4c12");
      ctx.fillStyle = rail;
      ctx.beginPath(); ctx.ellipse(cx, cy, RX + 26, RY + 26, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#1c1208";
      ctx.beginPath(); ctx.ellipse(cx, cy, RX + 17, RY + 17, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(212,175,55,.55)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(cx, cy, RX + 21, RY + 21, 0, 0, Math.PI * 2); ctx.stroke();

      // --- felt: radial onyx with vignette ---
      const felt = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.max(RX, RY) * 1.25);
      felt.addColorStop(0, "#3a332a"); felt.addColorStop(0.45, "#221d16"); felt.addColorStop(0.8, "#131009"); felt.addColorStop(1, "#070503");
      ctx.fillStyle = felt;
      ctx.beginPath(); ctx.ellipse(cx, cy, RX, RY, 0, 0, Math.PI * 2); ctx.fill();

      // suit watermark
      ctx.save();
      ctx.globalAlpha = 0.05; ctx.fillStyle = "#f8e7b0";
      ctx.font = `900 ${Math.round(RY * 0.9)}px Georgia, serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("♠", cx, cy - RY * 0.12);
      ctx.restore();

      // --- pot: gold ellipse + chip stack + amount ---
      if (pot > 0) {
        ctx.save();
        ctx.shadowColor = "rgba(212,175,55,.6)"; ctx.shadowBlur = 22;
        ctx.fillStyle = "rgba(12,10,7,.85)";
        ctx.beginPath(); ctx.ellipse(cx, cy + RY * 0.28, RX * 0.34, RY * 0.2, 0, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(212,175,55,.8)"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.ellipse(cx, cy + RY * 0.28, RX * 0.34, RY * 0.2, 0, 0, Math.PI * 2); ctx.stroke();
        // chip stack: three offset discs with gold edges
        const chips = Math.min(5, Math.max(1, Math.round(pot / 400)));
        for (let i = 0; i < chips; i++) {
          const y = cy + RY * 0.28 - 4 - i * 6;
          ctx.fillStyle = i % 2 ? "#d4af37" : "#f3f0e6";
          ctx.beginPath(); ctx.ellipse(cx - RX * 0.2, y, 14, 5, 0, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = "#d4af37"; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.ellipse(cx - RX * 0.2, y, 14, 5, 0, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.fillStyle = "#f8e7b0";
        ctx.font = "900 17px system-ui, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(`POT ${pot.toLocaleString()}`, cx + RX * 0.03, cy + RY * 0.24);
        ctx.font = "800 10px system-ui, sans-serif"; ctx.fillStyle = "rgba(248,231,176,.75)";
        ctx.fillText(stage.toUpperCase(), cx + RX * 0.03, cy + RY * 0.37);
        ctx.restore();
      }

      // --- seats: drop shadows + chip piles (perspective ellipse, same math as DOM seats) ---
      if (seats) {
        const ANGLES = [180, 55, 125, 235, 305, 270];
        seats.forEach((seat, i) => {
          const th = (ANGLES[i] * Math.PI) / 180;
          const px = (0.5 + 0.42 * Math.cos(th)) * w, py = (0.44 - 0.27 * Math.sin(th)) * h;
          const sc = 1.06 - 0.34 * ((Math.sin(th) + 1) / 2);
          // shadow
          ctx.save();
          ctx.globalAlpha = 0.35; ctx.fillStyle = "#000";
          ctx.beginPath(); ctx.ellipse(px, py + 26 * sc, 26 * sc, 7 * sc, 0, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
          // chip pile between seat and centre
          const cxp = px + (cx - px) * 0.34, cyp = py + (cy - py) * 0.34;
          const n = Math.min(4, Math.max(1, Math.round((parseFloat(seat.chips.replace(/,/g, "")) || 0) / 1200)));
          for (let k = 0; k < n; k++) {
            const yy = cyp - k * 4.4 * sc;
            ctx.fillStyle = k % 2 ? "#d4af37" : "#1e1b14";
            ctx.beginPath(); ctx.ellipse(cxp, yy, 10 * sc, 3.8 * sc, 0, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = "rgba(212,175,55,.85)"; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.ellipse(cxp, yy, 10 * sc, 3.8 * sc, 0, 0, Math.PI * 2); ctx.stroke();
          }
        });
      }

      // watermark brand
      ctx.save();
      ctx.globalAlpha = 0.12; ctx.fillStyle = "#d4af37";
      ctx.font = `900 ${Math.max(11, Math.round(RY * 0.14))}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("L U X E   P O K E R", cx, cy - RY * 0.62);
      ctx.restore();
    };
    draw();
    const o = new ResizeObserver(draw); o.observe(c);
    return () => o.disconnect();
  }, [pot, stage, seats]);
  return <canvas ref={ref} aria-hidden="true" className="absolute inset-0 h-full w-full rounded-[2rem]"/>;
}
