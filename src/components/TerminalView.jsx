import { useCallback } from "react";
import CanvasFrame from "./CanvasFrame.jsx";
import useMinWidth from "../lib/useMinWidth.js";
import {
  calendar,
  stats,
  username,
  clamp01,
  fmtInt,
  formatDayShort,
  TEXT_DIM,
  FONT_MONO,
} from "../lib/github.js";
import { GRID_MIN_WIDTH } from "./ContributionGrid.jsx";

const CMD = "$ gh api graphql -f query='…contributionCalendar'";
const COMMENT = `# ${calendar.cols} weeks x 7 days, Sunday first, like the real graph`;
const SUMMARY_1 = `→ ${fmtInt(stats.total)} contributions in the last year`;
const SUMMARY_2 = `  best day ${stats.best.count} (${formatDayShort(stats.best.date)}) · streak ${stats.streak.length}d · longest ${stats.longestStreak}d`;
const GLYPHS = [".", ":", "+", "#", "@"];
const GLYPH_COLORS = ["#30363d", "#2ea043", "#3fb950", "#56d364", "#7ee787"];

const rand = (seed) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

function typedText(text, t, start, charMs) {
  if (t < start) return "";
  const n = Math.floor(clamp01((t - start) / (text.length * charMs)) * text.length);
  return text.slice(0, n);
}

export default function TerminalView() {
  const [wrapRef, width] = useMinWidth(GRID_MIN_WIDTH);
  const bestIdx = stats.best.i;

  const draw = useCallback(
    (ctx, w, h, t) => {
      ctx.fillStyle = "#0b0f14";
      ctx.fillRect(0, 0, w, h);

      const padX = 14;
      const cell = Math.max(9, Math.min(14, Math.floor((w - padX * 2 - (calendar.cols - 1) * 3) / calendar.cols)));
      const pitch = cell + 3;
      const gridW = calendar.cols * cell + (calendar.cols - 1) * 3;
      const origin = Math.max(padX, Math.floor((w - gridW) / 2));
      const dotY = 13;
      const dots = ["#ff5f57", "#febc2e", "#28c840"];
      dots.forEach((color, i) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(padX + i * 12 + 4, dotY, 4, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.font = `10px ${FONT_MONO}`;
      ctx.fillStyle = TEXT_DIM;
      ctx.textAlign = "center";
      ctx.fillText(`bash · @${username}`, w / 2, dotY + 3.5);
      ctx.textAlign = "left";
      ctx.strokeStyle = "#21262d";
      ctx.beginPath();
      ctx.moveTo(0, 24.5);
      ctx.lineTo(w, 24.5);
      ctx.stroke();

      const cmdText = typedText(CMD, t, 0, 22);
      ctx.font = `12px ${FONT_MONO}`;
      ctx.fillStyle = "#7ee787";
      ctx.fillText(cmdText, origin, 44);
      if (t < CMD.length * 22 + 100 && Math.floor(t / 530) % 2 === 0) {
        const tw = ctx.measureText(cmdText).width;
        ctx.fillRect(origin + tw + 1, 33, 7, 13);
      }

      if (t > CMD.length * 22 + 150) {
        ctx.fillStyle = TEXT_DIM;
        ctx.fillText(COMMENT, origin, 63);
      }

      const cellStart = 1650;
      const settleMs = 420;
      const perCell = 5.4;

      const gridY = 92;
      const cellX = (col) => origin + col * pitch;

      ctx.font = `9px ${FONT_MONO}`;
      ctx.fillStyle = TEXT_DIM;
      if (t > cellStart - 300) {
        for (const m of calendar.monthLabels) {
          ctx.fillText(m.label, cellX(m.col), 82);
        }
      }

      for (const c of calendar.cells) {
        const i = c.i;
        const start = cellStart + i * perCell;
        if (t < start) continue;
        const x = cellX(c.col);
        const y = gridY + c.row * pitch;
        const isBest = i === bestIdx;
        if (t < start + settleMs) {
          const frame = Math.floor(t / 70);
          const glyph = GLYPHS[Math.floor(rand(i * 13.7 + frame * 7.3) * GLYPHS.length)];
          ctx.fillStyle = "#3fb950";
          ctx.globalAlpha = 0.75;
          ctx.font = `11px ${FONT_MONO}`;
          ctx.fillText(glyph, x + cell / 2 - 3, y + cell - 2);
          ctx.globalAlpha = 1;
        } else {
          const ch = c.level === 0 ? "·" : isBest ? "@" : GLYPHS[c.level - 1];
          ctx.fillStyle = c.level === 0 ? "#30363d" : isBest ? "#a5f3c0" : GLYPH_COLORS[c.level];
          ctx.font = `11px ${FONT_MONO}`;
          ctx.fillText(ch, x + cell / 2 - 3, y + cell - 2);
        }
      }

      const gridEndY = gridY + 7 * pitch;
      const legendY = gridEndY + 16;
      const line1Y = legendY + 26;
      const line2Y = legendY + 46;
      if (t > cellStart + 600) {
        ctx.font = `10px ${FONT_MONO}`;
        let lx = origin;
        ctx.fillStyle = TEXT_DIM;
        ctx.fillText("LESS", lx, legendY);
        lx += 34;
        const legendGlyphs = [".", ":", "+", "#", "@"];
        legendGlyphs.forEach((g, gi) => {
          ctx.fillStyle = GLYPH_COLORS[gi + 1];
          ctx.fillText(g, lx, legendY);
          lx += 14;
        });
        ctx.fillStyle = TEXT_DIM;
        ctx.fillText("MORE", lx + 2, legendY);
      }

      const sumStart1 = cellStart + calendar.cells.length * perCell + 300;

      const s1 = typedText(SUMMARY_1, t, sumStart1, 12);
      ctx.font = `12px ${FONT_MONO}`;
      ctx.fillStyle = "#e6edf3";
      ctx.fillText(s1, origin, line1Y);

      const s2Start = sumStart1 + SUMMARY_1.length * 12 + 250;
      if (t > s2Start) {
        const s2 = typedText(SUMMARY_2, t, s2Start, 8);
        ctx.fillStyle = TEXT_DIM;
        ctx.fillText(s2, origin, line2Y);
        const done = t > s2Start + SUMMARY_2.length * 8;
        if (done && Math.floor(t / 530) % 2 === 0) {
          const tw = ctx.measureText(s2).width;
          ctx.fillStyle = "#7ee787";
          ctx.fillRect(origin + tw + 1, line2Y - 11, 7, 13);
        }
      }
    },
    [bestIdx]
  );

  return (
    <div ref={wrapRef} className="overflow-x-auto">
      <div style={{ width }}>
        <CanvasFrame draw={draw} height={284} duration={6800} ariaLabel="Terminal typing a GitHub GraphQL query, then decoding the contribution calendar into glyphs" />
      </div>
    </div>
  );
}
