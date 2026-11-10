import Panel from "./components/Panel.jsx";
import ContributionGrid from "./components/ContributionGrid.jsx";
import Skyline from "./components/Skyline.jsx";
import WeeklyPulse from "./components/WeeklyPulse.jsx";
import YearRing from "./components/YearRing.jsx";
import StreakTracer from "./components/StreakTracer.jsx";
import TerminalView from "./components/TerminalView.jsx";
import { days, stats, username, formatDayShort } from "./lib/github.js";

const lastDay = days[days.length - 1].date;

const GITHUB_ICON = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
  </svg>
);

const LINKEDIN_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.55V9h3.57v11.45Z" />
  </svg>
);

const MAIL_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
    <path d="m4 7 8 6 8-6" />
  </svg>
);

const STATS = [
  { value: stats.total.toLocaleString("en-US"), label: "contributions" },
  { value: String(stats.streak.length), label: "current streak (days)" },
  { value: String(stats.longestStreak), label: "longest streak (days)" },
  { value: String(stats.best.count), label: `best day (${formatDayShort(stats.best.date)})` },
];

export default function App() {
  return (
    <div className="min-h-screen bg-[#0d1117] font-sans text-[#e6edf3]">
      <header className="sticky top-0 z-20 border-b border-white/5 bg-[#0d1117]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <a href="/" className="inline-flex min-h-11 items-center rounded-md focus-visible:outline-2">
            <span className="text-sm font-semibold tracking-tight">
              M. Fadillah Rasyid
              <span className="ml-2 hidden font-mono text-[11px] font-normal text-[#8b949e] sm:inline">@{username}</span>
            </span>
          </a>
          <nav className="flex items-center gap-1.5">
            <a
              href="https://github.com/mufarasyid"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub profile"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-[#8b949e] transition-colors hover:bg-white/5 hover:text-[#e6edf3]"
            >
              {GITHUB_ICON}
            </a>
            <a
              href="https://www.linkedin.com/in/muhammad-fadillah-rasyid/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn profile"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-[#8b949e] transition-colors hover:bg-white/5 hover:text-[#e6edf3]"
            >
              {LINKEDIN_ICON}
            </a>
            <a
              href="mailto:rasyid08mufara@gmail.com"
              aria-label="Send email"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-[#8b949e] transition-colors hover:bg-white/5 hover:text-[#e6edf3]"
            >
              {MAIL_ICON}
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        <section className="pb-10 pt-14 sm:pb-14 sm:pt-20">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8b949e]">
            @{username} · last 12 months of contributions
          </div>

          <h1 className="mt-5 max-w-3xl text-5xl font-extrabold leading-[1.02] tracking-[-0.03em] text-[#e6edf3] sm:text-7xl">
            A year on GitHub,
            <br />
            <span className="text-[#39d353]">drawn six ways.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#8b949e]">
            Every day of my last year on GitHub, pulled from the GraphQL API and drawn on canvas. No
            screenshots, no chart plugins. Hover the grid, replay any panel.
          </p>

          <dl className="mt-9 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[#30363d]/60 bg-[#30363d]/60 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col bg-[#161b22] px-4 py-3.5 sm:px-5">
                <dd className="font-mono text-2xl font-semibold tabular-nums text-[#e6edf3]">{s.value}</dd>
                <dt className="mt-1 font-mono text-[9px] uppercase leading-snug tracking-wider text-[#8b949e]">{s.label}</dt>
              </div>
            ))}
          </dl>
        </section>

        <section className="grid grid-cols-1 gap-5 pb-16">
          <Panel
            index="01"
            title="The grid"
            blurb="Every day, dropped in on a diagonal wave. GitHub's own cell colors. Hover any square."
          >
            <ContributionGrid />
          </Panel>
          <Panel
            index="02"
            title="Skyline"
            blurb="Each day a building. Height by square-root of commits, so one huge day doesn't flatten the rest."
          >
            <Skyline />
          </Panel>
          <Panel
            index="03"
            title="Weekly pulse"
            blurb="Weekly totals as a line with a rider, then each week pours down into its seven days."
          >
            <WeeklyPulse />
          </Panel>
          <Panel
            index="04"
            title="Round the year"
            blurb="The calendar bent into a ring: seven day rings, one spoke per week, swept by a hand."
          >
            <YearRing />
          </Panel>
          <Panel
            index="05"
            title="The streak"
            blurb="Everything before the streak fades out; a dot runs the streak day by day."
          >
            <StreakTracer />
          </Panel>
          <Panel
            index="06"
            title="In the terminal"
            blurb="The GraphQL query types itself, then every day settles into a glyph from . to @."
          >
            <TerminalView />
          </Panel>
        </section>
      </main>

      <footer className="border-t border-white/5">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 font-mono text-[10px] uppercase tracking-wider text-[#8b949e] sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>
            Data as of {lastDay.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })} ·{" "}
            <a className="underline decoration-[#30363d] underline-offset-2 transition-colors hover:text-[#e6edf3]" href="https://github.com/mufarasyid" target="_blank" rel="noopener noreferrer">
              graphql api
            </a>
          </span>
          <span>React + canvas · no animation libraries</span>
        </div>
      </footer>
    </div>
  );
}
