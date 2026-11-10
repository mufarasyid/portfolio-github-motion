# portfo

Personal lab for **M. Fadillah Rasyid** ([@mufarasyid](https://github.com/mufarasyid)): one year of real GitHub contribution data, animated six ways on canvas.

## Stack

Vite + React 19 + Tailwind CSS v4. No animation or chart libraries. Each panel is one canvas and one pure `draw(ctx, w, h, t)` function (`t` = ms since the panel started).

## Develop

```bash
npm install
npm run dev
```

## Data pipeline

The page never calls GitHub at runtime. `src/data/github.json` is committed to the repo:

```bash
npm run fetch-github
```

`scripts/fetch-github.mjs` queries the GitHub GraphQL API (`user.contributionsCollection.contributionCalendar`) and writes `{ total, start, counts[], levels "0-4" }`. Auth via `GITHUB_TOKEN` env var or `gh auth token` (run `gh auth login` first). Any personal access token works; it only reads public profile data.

Notes from the field:

- Daily counts don't always add up to GitHub's `totalContributions`. The count-up in the UI scales to GitHub's number.
- Enable **Settings → Profile → Include private contributions on my profile** if you want private work counted.
- Levels come from GitHub's own `contributionLevel`, so quiet and busy accounts both get a full-looking graph.

An optional GitHub Action (`.github/workflows/refresh-github.yml`) can re-fetch and commit the JSON on a daily schedule, once the repo is pushed and Actions are enabled. It has not run yet; the committed `github.json` was seeded once from the public profile page.

## Panels

1. **The grid**: diagonal drop-in wave, count-up, hover tooltip per day
2. **Skyline**: a building per day, height by √commits, oblique 3D projection
3. **Weekly pulse**: weekly totals as a line with a riding dot, then cells pour down
4. **Round the year**: calendar bent into a ring of 7 day rings, swept by a hand
5. **The streak**: current streak traced day by day with a fading trail
6. **In the terminal**: the GraphQL query types itself; days settle into `. : + # @` glyphs (`@` = best day)

All panels respect `prefers-reduced-motion` (render the finished frame) and only run their animation loop while on screen.

## Credit

Pattern from [6 Ways to Put Your GitHub Graph on Your Portfolio](https://www.avivashishta.com/blog/animate-github-contribution-graph-portfolio) by [@AviVashishta29](https://github.com/AviVashishta29).
