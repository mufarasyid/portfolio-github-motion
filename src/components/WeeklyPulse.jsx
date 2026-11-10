import { useCallback } from "react";
import CanvasFrame from "./CanvasFrame.jsx";
import useMinWidth from "../lib/useMinWidth.js";
import {
  calendar,
  username,
  clamp01,
  easeInOutCubic,
  easeOutCubic,
  easeOutBack,
  roundRect,
  calendarLayout,
  LEVEL_COLORS,
  TEXT,
  TEXT_DIM,
  GREEN,
  FONT_SANS,
  FONT_MONO,
} from "../lib/github.js";
import { GRID_MIN_WIDTH } from "./ContributionGrid.jsx";

export default function WeeklyPulse() {
  const [wrapRef, width] = useMinWidth(GRID_MIN_WIDTH);
  const maxWeek = Math.max(1, ...calendar.weekTotals);
  const nWeeks = calendar.weekTotals.length;

  const draw = useCallback(
    (ctx, w, h, t) => {
      const chartH = Math.round(h * 0.36);
      const padX = 14;
      const top = 26;
      const bottom = chartH - 10;
      const px = (i) => padX + (i * (w - padX * 2)) / (nWeeks - 1);
      const py = (v) => bottom - (v / maxWeek) * (bottom - top);

      ctx.textAlign = "left";
      ctx.font = `10px ${FONT_MONO}`;
      ctx.fillStyle = TEXT_DIM;
      ctx.fillText("WEEKLY PULSE", padX, 17);
      ctx.textAlign = "right";
      ctx.fillText(`@${username}`, w - padX, 17);
      ctx.textAlign = "left";

      ctx.strokeStyle = "#21262d";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padX, bottom + 0.5);
      ctx.lineTo(w - padX, bottom + 0.5);
      ctx.stroke();

      const pts = calendar.weekTotals.map((v, i) => ({ x: px(i), y: py(v) }));

      ctx.globalAlpha = 0.18;
      ctx.strokeStyle = GREEN;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.stroke();
      ctx.globalAlpha = 1;

      const q = easeInOutCubic(clamp01(t / 1600));
      const headF = q * (nWeeks - 1);
      const full = Math.floor(headF);
      const segP = headF - full;
      ctx.strokeStyle = GREEN;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i <= full; i++) ctx.lineTo(pts[i].x, pts[i].y);
      if (full < nWeeks - 1 && segP > 0) {
        const a = pts[full];
        const b = pts[full + 1];
        ctx.lineTo(a.x + (b.x - a.x) * segP, a.y + (b.y - a.y) * segP);
      }
      ctx.stroke();

      const headPt = (() => {
        if (full >= nWeeks - 1) return pts[nWeeks - 1];
        const a = pts[full];
        const b = pts[full + 1];
        return { x: a.x + (b.x - a.x) * segP, y: a.y + (b.y - a.y) * segP };
      })();
      ctx.save();
      ctx.shadowColor = GREEN;
      ctx.shadowBlur = 7;
      ctx.fillStyle = "#eaffef";
      ctx.beginPath();
      ctx.arc(headPt.x, headPt.y, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      const L = calendarLayout(w, h, { header: 10, month: 4, left: 8, right: 8, gap: 3, bottom: 8 });
      const yOffset = chartH - 10;
      const cellCenterY = (row) => yOffset + L.top + row * (L.cell + L.gap) + L.cell / 2;
      const cellCenterX = (col) => L.left + col * (L.cell + L.gap) + L.cell / 2;

      ctx.font = `9px ${FONT_SANS}`;
      ctx.fillStyle = TEXT_DIM;
      for (const m of calendar.monthLabels) {
        ctx.fillText(m.label, L.left + m.col * (L.cell + L.gap), yOffset + 9);
      }

      for (const c of calendar.cells) {
        const delay = 1750 + c.col * 24;
        const p = clamp01((t - delay) / 620);
        if (p <= 0) continue;
        const e = easeOutCubic(p);
        const fromX = px(c.col);
        const fromY = py(calendar.weekTotals[c.col]);
        const x = fromX + (cellCenterX(c.col) - fromX) * e - L.cell / 2;
        const y = fromY + (cellCenterY(c.row) - fromY) * e - L.cell / 2;
        const size = L.cell * (0.4 + 0.6 * easeOutBack(p));
        ctx.globalAlpha = Math.min(1, p * 1.4);
        ctx.fillStyle = LEVEL_COLORS[c.level];
        roundRect(ctx, x + (L.cell - size) / 2, y + (L.cell - size) / 2, size, size, Math.min(2.5, size * 0.24));
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    },
    [maxWeek, nWeeks]
  );

  return (
    <div ref={wrapRef} className="overflow-x-auto">
      <div style={{ width }}>
        <CanvasFrame draw={draw} height={235} duration={3800} ariaLabel="Weekly contribution totals drawn as a line, then each week's days pouring down into the calendar grid" />
      </div>
    </div>
  );
}
