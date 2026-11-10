import { useCallback } from "react";
import CanvasFrame from "./CanvasFrame.jsx";
import {
  calendar,
  stats,
  clamp01,
  easeInOutCubic,
  easeOutCubic,
  fmtInt,
  LEVEL_COLORS,
  TEXT,
  TEXT_DIM,
  FONT_SANS,
} from "../lib/github.js";

export default function YearRing() {
  const draw = useCallback((ctx, w, h, t) => {
    const cx = w / 2;
    const cy = h / 2 + 8;
    const maxR = Math.min(w, h) / 2 - 34;
    const baseR = Math.max(18, maxR * 0.23);
    const ringGap = 2.5;
    const ringTh = (maxR - baseR) / 7 - ringGap;
    const weekAngle = (Math.PI * 2) / calendar.cols;
    const gapAngle = 0.022;

    const sweepP = easeInOutCubic(clamp01(t / 2300));
    const handAngle = -Math.PI / 2 + sweepP * Math.PI * 2;

    ctx.textAlign = "center";
    ctx.font = `10px ${FONT_SANS}`;
    ctx.fillStyle = TEXT_DIM;

    for (const c of calendar.cells) {
      const a0 = -Math.PI / 2 + c.col * weekAngle + gapAngle;
      const a1 = -Math.PI / 2 + (c.col + 1) * weekAngle - gapAngle;
      if (a1 <= a0) continue;
      const reveal = clamp01((handAngle - a0) / 0.5);
      if (reveal <= 0) continue;
      const r1 = baseR + c.row * (ringTh + ringGap) + ringTh;
      const r0 = r1 - ringTh;
      ctx.globalAlpha = reveal;
      ctx.fillStyle = LEVEL_COLORS[c.level];
      ctx.beginPath();
      ctx.arc(cx, cy, r1, a0, a1);
      ctx.arc(cx, cy, r0, a1, a0, true);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    const handAlpha = t < 2700 ? 1 : clamp01(1 - (t - 2700) / 500);
    if (handAlpha > 0) {
      ctx.globalAlpha = handAlpha * 0.9;
      ctx.strokeStyle = TEXT;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(handAngle) * (maxR + 4), cy + Math.sin(handAngle) * (maxR + 4));
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(cx + Math.cos(handAngle) * (maxR + 4), cy + Math.sin(handAngle) * (maxR + 4), 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    const shown = Math.round(stats.total * easeOutCubic(clamp01(t / 2300)));
    ctx.fillStyle = TEXT;
    ctx.font = `600 22px ${FONT_SANS}`;
    ctx.textBaseline = "alphabetic";
    ctx.fillText(fmtInt(shown), cx, cy + 2);
    ctx.fillStyle = TEXT_DIM;
    ctx.font = `600 8px ${FONT_SANS}`;
    ctx.fillText("C O N T R I B U T I O N S", cx, cy + 16);
    ctx.font = `9px ${FONT_SANS}`;
    ctx.fillText("last 12 months", cx, cy + 30);
  }, []);

  return (
    <CanvasFrame draw={draw} height={340} duration={3300} ariaLabel="The contribution calendar bent into a ring of seven day rings, revealed by a sweeping hand" />
  );
}
