import { useCallback, useState } from "react";
import CanvasFrame from "./CanvasFrame.jsx";
import useMinWidth from "../lib/useMinWidth.js";
import {
  calendar,
  days,
  stats,
  username,
  clamp01,
  easeOutCubic,
  easeOutBack,
  mixHex,
  roundRect,
  calendarLayout,
  fmtInt,
  formatDayLong,
  formatDayShort,
  LEVEL_COLORS,
  TEXT,
  TEXT_DIM,
  FONT_SANS,
  FONT_MONO,
} from "../lib/github.js";

export const GRID_MIN_WIDTH = 8 + calendar.cols * 9 + (calendar.cols - 1) * 3 + 8;

export default function ContributionGrid() {
  const [wrapRef, width] = useMinWidth(GRID_MIN_WIDTH);
  const [hover, setHover] = useState(null);

  const draw = useCallback((ctx, w, h, t) => {
    const L = calendarLayout(w, h, { header: 32, month: 16, left: 8, right: 8, gap: 3, bottom: 8 });

    const countP = easeOutCubic(clamp01(t / 1700));
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.font = `600 16px ${FONT_SANS}`;
    ctx.fillStyle = TEXT;
    ctx.fillText(`${fmtInt(stats.total * countP)} contributions in the last year`, 10, 21);

    ctx.font = `11px ${FONT_MONO}`;
    ctx.fillStyle = TEXT_DIM;
    ctx.textAlign = "right";
    ctx.fillText(`@${username}`, w - 8, 20);
    ctx.textAlign = "left";

    ctx.font = `10px ${FONT_SANS}`;
    ctx.fillStyle = TEXT_DIM;
    for (const m of calendar.monthLabels) {
      ctx.fillText(m.label, L.left + m.col * (L.cell + L.gap), L.header + 11);
    }

    for (const c of calendar.cells) {
      const delay = (c.col + c.row * 1.6) * 20;
      const p = clamp01((t - delay) / 560);
      if (p <= 0) continue;
      const size = L.cell * (0.25 + 0.75 * easeOutBack(p));
      const x = L.left + c.col * (L.cell + L.gap) + (L.cell - size) / 2;
      const y = L.top + c.row * (L.cell + L.gap) + (L.cell - size) / 2;
      roundRect(ctx, x, y, size, size, Math.min(2.5, size * 0.24));
      if (c.level === 0) {
        ctx.globalAlpha = p;
        ctx.fillStyle = LEVEL_COLORS[0];
        ctx.fill();
        ctx.globalAlpha = 1;
      } else {
        ctx.fillStyle = mixHex("#7ee787", LEVEL_COLORS[c.level], easeOutCubic(p));
        ctx.fill();
      }
    }
  }, []);

  const handleMove = (e) => {
    const canvas = e.currentTarget.querySelector("canvas");
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const L = calendarLayout(rect.width, rect.height, { header: 32, month: 16, left: 8, right: 8, gap: 3, bottom: 8 });
    const col = Math.floor((x - L.left) / (L.cell + L.gap));
    const row = Math.floor((y - L.top) / (L.cell + L.gap));
    const inX = x - L.left - col * (L.cell + L.gap) <= L.cell;
    const inY = y - L.top - row * (L.cell + L.gap) <= L.cell;
    const hit = col >= 0 && col < L.cols && row >= 0 && row < 7 && inX && inY ? calendar.cellsByPos.get(`${col}:${row}`) : null;
    if (hit) {
      setHover({
        x: L.left + col * (L.cell + L.gap),
        y: L.top + row * (L.cell + L.gap),
        cell: L.cell,
        date: hit.date,
        count: hit.count,
      });
    } else {
      setHover(null);
    }
  };

  return (
    <div ref={wrapRef} className="overflow-x-auto">
      <div className="relative" style={{ width }} onMouseMove={handleMove} onMouseLeave={() => setHover(null)}>
        <CanvasFrame draw={draw} height={148} duration={2400} ariaLabel="Animated grid of daily GitHub contributions over the last year" />
        {hover && (
          <>
            <div
              className="pointer-events-none absolute rounded-[3px] border border-[#e6edf3]"
              style={{ left: hover.x - 1, top: hover.y - 1, width: hover.cell + 2, height: hover.cell + 2 }}
            />
            <div
              className="pointer-events-none absolute z-10 whitespace-nowrap rounded-md bg-[#f6f8fa] px-2 py-1 text-[10px] leading-tight font-medium text-[#0d1117] shadow-lg"
              style={{
                left: Math.min(Math.max(hover.x + hover.cell / 2, 60), width - 60),
                top: Math.max(hover.y - 44, 2),
                transform: "translateX(-50%)",
              }}
            >
              {hover.count === 0
                ? "No contributions"
                : `${hover.count} contribution${hover.count === 1 ? "" : "s"}`}
              <span className="block font-normal text-[#57606a]">{formatDayLong(hover.date)}</span>
            </div>
          </>
        )}
      </div>
      <table className="sr-only">
        <caption>
          Daily GitHub contributions, {formatDayShort(days[0].date)} to {formatDayShort(days[days.length - 1].date)}
        </caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Contributions</th>
            <th scope="col">Level</th>
          </tr>
        </thead>
        <tbody>
          {days.map((d) => (
            <tr key={d.date.toISOString()}>
              <td>{formatDayLong(d.date)}</td>
              <td>{d.count}</td>
              <td>{d.level}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
