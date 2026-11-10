// Fetches the real contribution calendar for GITHUB_USER (default: mufarasyid)
// via the GitHub GraphQL API and writes src/data/github.json.
// Token: GITHUB_TOKEN env var, or `gh auth token` (run `gh auth login` first).
// The page imports the JSON — GitHub is never called at request time.

import { execSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const username = process.env.GITHUB_USER || "mufarasyid";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function resolveToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN.trim();
  try {
    return execSync("gh auth token", { encoding: "utf8" }).trim();
  } catch {
    console.error(
      "No token found. Run `gh auth login` first, or set GITHUB_TOKEN.\n" +
        "Any personal access token works — it only reads public profile data."
    );
    process.exit(1);
  }
}

const query = `query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            contributionLevel
          }
        }
      }
    }
  }
}`;

const res = await fetch("https://api.github.com/graphql", {
  method: "POST",
  headers: {
    Authorization: `bearer ${resolveToken()}`,
    "Content-Type": "application/json",
    "User-Agent": "portfo-fetch-github",
  },
  body: JSON.stringify({ query, variables: { login: username } }),
});

if (!res.ok) {
  console.error(`GitHub GraphQL HTTP ${res.status}: ${await res.text()}`);
  process.exit(1);
}

const body = await res.json();
if (body.errors) {
  console.error("GitHub GraphQL errors:", JSON.stringify(body.errors, null, 2));
  process.exit(1);
}

const calendar = body.data?.user?.contributionsCollection?.contributionCalendar;
if (!calendar) {
  console.error(`User "${username}" not found or calendar unavailable.`);
  process.exit(1);
}

const LEVEL = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };
const days = calendar.weeks
  .flatMap((w) => w.contributionDays)
  .sort((a, b) => a.date.localeCompare(b.date));

const out = {
  username,
  source: "github.com/graphql contributionsCollection.contributionCalendar",
  generatedAt: new Date().toISOString(),
  total: calendar.totalContributions,
  start: days[0].date,
  counts: days.map((d) => d.contributionCount),
  levels: days.map((d) => String(LEVEL[d.contributionLevel] ?? 0)).join(""),
};

mkdirSync(join(root, "src/data"), { recursive: true });
writeFileSync(join(root, "src/data/github.json"), JSON.stringify(out, null, 2));

const sum = out.counts.reduce((a, b) => a + b, 0);
console.log(`Wrote src/data/github.json — ${days.length} days, total ${out.total} (days sum to ${sum})`);
if (sum !== out.total) {
  console.log("Note: daily counts don't add up to GitHub's total (common) — the UI scales the count-up to GitHub's number.");
}
