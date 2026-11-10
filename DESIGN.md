# DESIGN.md: portfo

Identity: the contribution graph itself. Every panel re-draws the same real calendar for @mufarasyid; nothing else competes for attention. The page is a specimen of his actual GitHub year, not a generic portfolio template.

Voice: terminal / CLI. Monospace (JetBrains Mono) for data, labels and commands; Inter for reading copy. English on-page. Zero emoji.

Color: #0d1117 page, #161b22 panels (hairline #30363d borders), #e6edf3 text, #8b949e dim text, single accent green family (#21262d empty, #0e4429 / #006d32 / #26a641 / #39d353 levels; #3fb950 for interactive green). One accent, used sparingly. Empty cells #21262d, not #ebedf0, because the theme is GitHub dark.

Type: Inter (body), JetBrains Mono (labels, numbers, terminal). Reason: the subject is a developer's literal output; mono is the native voice, Inter keeps reading calm. Do not add a third family.

Dial: ENERGY 2 / RHYTHM 2 / MOTION 3. Big display headline, stacked single column, one idea per panel. Sections are siblings of one idea (identical panel shell), variation lives inside the canvas. MOTION 3: every panel animates; each animation must carry meaning (drop-in = history settling, ring sweep = the year, terminal decode = literal API result), and all respect prefers-reduced-motion.

Components: one Panel shell (index / title / blurb) repeated six times on purpose; CanvasFrame host (DPR ≤ 2, IntersectionObserver 0.35, rAF only while visible, Replay); stats as a hairline grid, numbers tabular mono. Radius 16px cards; pill only for chips. No shadows.

Iconography: none beyond glyphs from the data itself (. : + # @) and inline stroke icons for GitHub / LinkedIn / mail / replay. Never stock icons or illustration sets.

Accessibility: WCAG AA text, focus-visible 2px #39d353 outlines, per-day values in a visually hidden table, role="img" + label on every canvas, Replay is a real button.

Notes / honest debt: theme is fixed dark (GitHub-dark is the subject). The graph is only as dense as the real 12 months (currently sparse); that is the truth of the data, not a bug.
