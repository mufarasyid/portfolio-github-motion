import { useCallback } from "react";
import CanvasFrame from "./CanvasFrame.jsx";
import useMinWidth from "../lib/useMinWidth.js";
import {
  calendar,
  stats,
  username,
  clamp01,
  easeOutCubic,
  mixHex,
  roundRect,
  calendarLayout,
  formatDayShort,
  LEVEL_COLORS,
  TEXT,
  TEXT_DIM,
  FONT_SANS,
  FONT_MONO,
} from "../lib/github.js";
import { GRID_MIN_WIDTH } from "./ContributionGrid.jsx";

export default function Skyline() {
  const [wrapRef, width] = useMinWidth(GRID_MIN_WIDTH);
  const maxCount = Math.max(1, stats.best.count);

  const draw = useCallback(
    (ctx, w, h, t) => {
      const L = calendarLayout(w, h, { header: 44, month: 0, left: 8, right: 8, gap: 3, bottom: 6 });
      const maxH = Math.min(L.cell * 4.4, 44);
      const depth = Math.max(3, L.cell * 0.55);

      ctx.textAlign = "left";
      ctx.font = `10px ${FONT_MONO}`;
      ctx.fillStyle = TEXT_DIM;
      ctx.fillText("HEIGHT ~ SQRT(COMMITS)", 10, 19);
      ctx.textAlign = "right";
      ctx.fillText(`@${username}`, w - 8, 19);
      ctx.textAlign = "left";

      for (let row = 0; row < 7; row++) {
        for (let col = 0; col < L.cols; col++) {
          const c = calendar.cellsByPos.get(`${col}:${row}`);
          if (!c) continue;
          const delay = (6 - row) * 80 + col * 7;
          const p = clamp01((t - delay) / 750);
          if (p <= 0) continue;
          const hP = easeOutCubic(p);
          const bh = c.count === 0 ? 2 : 3 + (Math.sqrt(c.count) / Math.sqrt(maxCount)) * maxH * hP;
          const bw = L.cell;
          const x = L.left + col * (L.cell + L.gap);
          const yBase = L.top + row * (L.cell + L.gap) + L.cell;
          const yTop = yBase - bh;
          const color = c.level === 0 ? LEVEL_COLORS[0] : LEVEL_COLORS[c.level];

          if (c.count === 0) {
            ctx.globalAlpha = p;
            ctx.fillStyle = color;
            roundRect(ctx, x, yBase - 2, bw, 2, 1);
            ctx.fill();
            ctx.globalAlpha = 1;
            continue;
          }

          ctx.fillStyle = mixHex(color, "#000000", 0.4);
          ctx.beginPath();
          ctx.moveTo(x + bw, yTop);
          ctx.lineTo(x + bw + depth, yTop - depth);
          ctx.lineTo(x + bw + depth, yBase - depth);
          ctx.lineTo(x + bw, yBase);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = mixHex(color, "#ffffff", 0.32);
          ctx.beginPath();
          ctx.moveTo(x, yTop);
          ctx.lineTo(x + depth, yTop - depth);
          ctx.lineTo(x + bw + depth, yTop - depth);
          ctx.lineTo(x + bw, yTop);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = color;
          roundRect(ctx, x, yTop, bw, bh, 1.5);
          ctx.fill();
        }
      }

      const bestCell = calendar.cells[stats.best.i];
      if (bestCell) {
        const lp = clamp01((t - 1750) / 500);
        if (lp > 0) {
          const bx = L.left + bestCell.col * (L.cell + L.gap) + L.cell / 2;
          const rowH2 = L.cell + L.gap;
          const yBase = L.top + bestCell.row * rowH2 + L.cell;
          const bh = 3 + (Math.sqrt(bestCell.count) / Math.sqrt(maxCount)) * maxH;
          const topY = yBase - bh - depth - 2;
          const anchorX = Math.min(Math.max(bx + 54, 140), w - 140);
          const anchorY = Math.max(10, topY - 30);
          ctx.globalAlpha = lp;
          ctx.strokeStyle = TEXT;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(bx, topY);
          ctx.lineTo(anchorX - 4, anchorY + 6);
          ctx.stroke();
          ctx.fillStyle = TEXT;
          ctx.beginPath();
          ctx.arc(bx, topY, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.font = `10px ${FONT_MONO}`;
          ctx.fillStyle = TEXT;
          const label = `Best day: ${bestCell.count} on ${formatDayShort(bestCell.date)}`;
          const tw = ctx.measureText(label).width;
          const px = Math.min(Math.max(anchorX - tw / 2, 8), w - tw - 8);
          roundRect(ctx, px - 6, anchorY - 4, tw + 12, 16, 8);
          ctx.fillStyle = "#161b22";
          ctx.fill();
          ctx.strokeStyle = "#30363d";
          ctx.stroke();
          ctx.fillStyle = "#e6edf3";
          ctx.fillText(label, px, anchorY + 7.5);
          ctx.globalAlpha = 1;
        }
      }
    },
    [maxCount]
  );

  return (
    <div ref={wrapRef} className="overflow-x-auto">
      <div style={{ width }}>
        <CanvasFrame draw={draw} height={150} duration={2600} ariaLabel="3D skyline of daily GitHub contributions, taller buildings for more commits" />
      </div>
    </div>
  );
}
