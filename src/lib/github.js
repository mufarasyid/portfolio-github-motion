import raw from "../data/github.json";

export const DAY_MS = 86_400_000;

export const LEVEL_COLORS = ["#21262d", "#0e4429", "#006d32", "#26a641", "#39d353"];
export const TEXT = "#e6edf3";
export const TEXT_DIM = "#8b949e";
export const GREEN = "#39d353";
export const FONT_SANS = "'Inter', system-ui, sans-serif";
export const FONT_MONO = "'JetBrains Mono', ui-monospace, monospace";

export const username = raw.username;
export const generatedAt = raw.generatedAt;
export const total = Number(raw.total) || 0;

const [sy, sm, sd] = raw.start.split("-").map(Number);
const startMs = Date.UTC(sy, sm - 1, sd);

export const days = raw.counts.map((count, i) => ({
  date: new Date(startMs + i * DAY_MS),
  count,
  level: Number(raw.levels[i] ?? 0),
}));

export const sumCounts = days.reduce((acc, d) => acc + d.count, 0);

const offset = new Date(startMs).getUTCDay();

function buildCells() {
  const cells = [];
  let maxCol = 0;
  for (let i = 0; i < days.length; i++) {
    const idx = i + offset;
    const col = Math.floor(idx / 7);
    const row = idx % 7;
    cells.push({ i, col, row, ...days[i] });
    if (col > maxCol) maxCol = col;
  }
  return { cells, cols: maxCol + 1 };
}

const { cells, cols } = buildCells();

function buildMonthLabels() {
  const labels = [];
  let lastMonth = -1;
  for (let col = 0; col < cols; col++) {
    const cell = cells.find((c) => c.col === col);
    if (!cell) continue;
    const month = cell.date.getUTCMonth();
    if (month !== lastMonth) {
      labels.push({ col, label: cell.date.toLocaleString("en-US", { month: "short", timeZone: "UTC" }) });
      lastMonth = month;
    }
  }
  return labels;
}

function buildWeekTotals() {
  const totals = Array.from({ length: cols }, () => 0);
  for (const c of cells) totals[c.col] += c.count;
  return totals;
}

const best = days.reduce((acc, d, i) => (d.count > acc.count ? { ...d, i } : acc), { ...days[0], i: 0 });

function computeStreak() {
  let end = days.length - 1;
  if (days[end].count === 0) end -= 1;
  let start = end;
  while (start >= 0 && days[start].count > 0) start -= 1;
  const streakStart = start + 1;
  const length = end >= streakStart ? end - streakStart + 1 : 0;
  const indices = [];
  for (let i = streakStart; i <= end; i++) indices.push(i);
  return { length, indices, offIdx: streakStart - 1 >= 0 ? streakStart - 1 : null, endIdx: end };
}

function computeLongestStreak() {
  let bestLen = 0, cur = 0;
  for (const d of days) {
    cur = d.count > 0 ? cur + 1 : 0;
    if (cur > bestLen) bestLen = cur;
  }
  return bestLen;
}

export const calendar = {
  offset,
  cols,
  rows: 7,
  cells,
  cellsByPos: new Map(cells.map((c) => [`${c.col}:${c.row}`, c])),
  monthLabels: buildMonthLabels(),
  weekTotals: buildWeekTotals(),
};

export const stats = {
  total,
  sum: sumCounts,
  best,
  streak: computeStreak(),
  longestStreak: computeLongestStreak(),
};

export function clamp01(x) {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

export function easeOutCubic(x) {
  return 1 - Math.pow(1 - clamp01(x), 3);
}

export function easeInOutCubic(x) {
  const t = clamp01(x);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function easeOutBack(x) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  const t = clamp01(x);
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

export function mixHex(a, b, p) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const r = Math.round(((pa >> 16) & 255) + (((pb >> 16) & 255) - ((pa >> 16) & 255)) * p);
  const g = Math.round(((pa >> 8) & 255) + (((pb >> 8) & 255) - ((pa >> 8) & 255)) * p);
  const bl = Math.round((pa & 255) + ((pb & 255) - (pa & 255)) * p);
  return `rgb(${r},${g},${bl})`;
}

export function roundRect(ctx, x, y, w, h, r) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

export function calendarLayout(w, h, opts = {}) {
  const { header = 26, month = 16, left = 8, right = 8, gap = 3, bottom = 6 } = opts;
  const top = header + month;
  const rows = 7;
  const colsCount = calendar.cols;
  const cell = Math.max(
    4,
    Math.floor(Math.min((h - top - bottom - (rows - 1) * gap) / rows, (w - left - right - (colsCount - 1) * gap) / colsCount))
  );
  const neededW = left + colsCount * cell + (colsCount - 1) * gap + right;
  const centeredLeft = Math.max(left, Math.floor((w - (colsCount * cell + (colsCount - 1) * gap)) / 2));
  return { cell, gap, left: centeredLeft, top, rows, cols: colsCount, neededW, header, month };
}

export const fmtInt = (n) => Math.round(n).toLocaleString("en-US");

export function formatDayLong(date) {
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export function formatDayShort(date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}
