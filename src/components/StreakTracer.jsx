import { useCallback } from "react";
import CanvasFrame from "./CanvasFrame.jsx";
import useMinWidth from "../lib/useMinWidth.js";
import {
  calendar,
  stats,
  clamp01,
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

const cellByDay = new Map(calendar.cells.map((c) => [c.i, c]));

export default function StreakTracer() {
  const [wrapRef, width] = useMinWidth(GRID_MIN_WIDTH);
  const streak = stats.streak;

  const draw = useCallback(
    (ctx, w, h, t) => {
      const L = calendarLayout(w, h, { header: 32, month: 0, left: 8, right: 8, gap: 3, bottom: 8 });
      const rowH = L.cell + L.gap;
      const colW = L.cell + L.gap;

      const p = clamp01((t - 400) / 2100);
      const pos = p * Math.max(0, streak.indices.length - 1);
      const litCount = Math.floor(pos);
      const dayNumber = Math.min(streak.indices.length, Math.round(pos) + 1);

      ctx.textAlign = "left";
      ctx.font = `600 16px ${FONT_SANS}`;
      ctx.fillStyle = TEXT;
      ctx.fillText(streak.length > 0 ? `Day ${dayNumber}` : "No active streak", 10, 21);
      if (streak.length > 0) {
        ctx.font = `600 16px ${FONT_SANS}`;
        const wDay = ctx.measureText(`Day ${dayNumber}`).width;
        ctx.fillStyle = TEXT_DIM;
        ctx.font = `11px ${FONT_MONO}`;
        ctx.fillText(` / ${streak.length} days`, 10 + wDay + 2, 21);
      }

      ctx.font = `10px ${FONT_MONO}`;
      ctx.fillStyle = TEXT_DIM;
      ctx.textAlign = "right";
      ctx.fillText("CURRENT STREAK", w - 8, 20);
      ctx.textAlign = "left";

      const streakSet = new Set(streak.indices);

      for (const c of calendar.cells) {
        const x = L.left + c.col * colW;
        const y = L.top + c.row * rowH;
        const isStreak = streakSet.has(c.i);
        ctx.globalAlpha = isStreak ? 1 : 0.16;
        if (stats.streak.offIdx === c.i) ctx.globalAlpha = 1;
        roundRect(ctx, x, y, L.cell, L.cell, Math.min(2.5, L.cell * 0.24));
        ctx.fillStyle = stats.streak.offIdx === c.i ? "#21262d" : LEVEL_COLORS[c.level];
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      if (stats.streak.offIdx !== null && stats.streak.offIdx !== undefined) {
        const c = cellByDay.get(stats.streak.offIdx);
        const x = L.left + c.col * colW;
        const y = L.top + c.row * rowH;
        const pad = L.cell * 0.28;
        ctx.strokeStyle = "#f85149";
        ctx.lineWidth = 1.6;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x + pad, y + pad);
        ctx.lineTo(x + L.cell - pad, y + L.cell - pad);
        ctx.moveTo(x + L.cell - pad, y + pad);
        ctx.lineTo(x + pad, y + L.cell - pad);
        ctx.stroke();
      }

      if (streak.indices.length === 0) return;

      for (let k = 0; k <= litCount && k < streak.indices.length; k++) {
        const c = cellByDay.get(streak.indices[k]);
        const x = L.left + c.col * colW;
        const y = L.top + c.row * rowH;
        ctx.save();
        ctx.shadowColor = GREEN;
        ctx.shadowBlur = 9;
        ctx.fillStyle = LEVEL_COLORS[Math.max(2, c.level)];
        roundRect(ctx, x, y, L.cell, L.cell, Math.min(2.5, L.cell * 0.24));
        ctx.fill();
        ctx.restore();
      }

      const c0 = cellByDay.get(streak.indices[Math.min(litCount, streak.indices.length - 1)]);
      const c1 = cellByDay.get(streak.indices[Math.min(litCount + 1, streak.indices.length - 1)]);
      const f = pos - litCount;
      const x0 = cellCenterInline(L, c0).x;
      const y0 = cellCenterInline(L, c0).y;
      const x1 = cellCenterInline(L, c1).x;
      const y1 = cellCenterInline(L, c1).y;
      const dotX = x0 + (x1 - x0) * f;
      const dotY = y0 + (y1 - y0) * f;

      for (let k = 14; k >= 1; k--) {
        const tp = pos - k * 0.42;
        if (tp < 0) continue;
        const iA = Math.floor(tp);
        const fA = tp - iA;
        const ca = cellByDay.get(streak.indices[iA]);
        const cb = cellByDay.get(streak.indices[Math.min(iA + 1, streak.indices.length - 1)]);
        const pa = cellCenterInline(L, ca);
        const pb = cellCenterInline(L, cb);
        const tx = pa.x + (pb.x - pa.x) * fA;
        const ty = pa.y + (pb.y - pa.y) * fA;
        ctx.globalAlpha = (1 - k / 14) * 0.5;
        ctx.fillStyle = GREEN;
        ctx.beginPath();
        ctx.arc(tx, ty, 3.6 * (1 - k / 14) + 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      if (t > 300) {
        ctx.save();
        ctx.shadowColor = GREEN;
        ctx.shadowBlur = 12;
        ctx.fillStyle = "#eaffef";
        ctx.beginPath();
        ctx.arc(dotX, dotY, 4.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    },
    [streak]
  );

  return (
    <div ref={wrapRef} className="overflow-x-auto">
      <div style={{ width }}>
        <CanvasFrame draw={draw} height={148} duration={3300} ariaLabel="The current contribution streak traced day by day with a moving dot" />
      </div>
    </div>
  );
}

function cellCenterInline(L, c) {
  return {
    x: L.left + c.col * (L.cell + L.gap) + L.cell / 2,
    y: L.top + c.row * (L.cell + L.gap) + L.cell / 2,
  };
}
