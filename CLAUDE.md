# Steplore — notes for coding sessions

Interactive algorithm visualizer (formerly a plain BFS/DFS grid demo). Every page = animated simulation +
code running line by line + explanation. Vite + React 19 + TypeScript (strict), static SPA on Netlify.

**Start here:** `ROADMAP.md` (what's done / next, with planned folder ids) →
`docs/ADDING_AN_ALGORITHM.md` (exact recipe + conventions) → the original spec
`algo-visualizer-build-prompt.md`. Open GitHub issues mirror the roadmap, one per tab/feature.

## Commands
- `npm run dev` — dev server (http://localhost:5173, hash routes like `#/searching/bounds?step=9`)
- `npm test` — Vitest; checks every algorithm against its `reference()` on presets + 200 random inputs
- `npx tsc -b` — typecheck · `npm run build` — typecheck + production build to `dist/`
- Deploy: push to `main`; Netlify runs `npm run build` and publishes `dist` (see `netlify.toml`).
  Live site: https://sweet-sopapillas-d5fe17.netlify.app/

## Architecture (one paragraph each)
- `src/engine/` — types (`AlgorithmModule`, `Step`, `InputField`…), `Tracer` (deep-copied immutable steps,
  cumulative counters), `buildTrace` (10 000-step cap), `@mark` line-marker parser, input parse/validate, seeded RNG.
- `src/algorithms/<category>/<id>/` — one folder per page (`meta.ts`, `index.ts`, `code.py.txt`, `code.js.txt`,
  `info.md`). `_shared/` holds state types + helpers per renderer (array, matrix, grid, hash, sorting, rotated).
- `src/registry.ts` — auto-collects folders with `import.meta.glob` (meta eager, module lazy).
- `src/renderers/` — pure views: `grid`, `array`/`bars`, `matrix`, `hashtable`. Registered in `renderers/index.ts`.
- `src/pages/AlgorithmPage.tsx` — wires input bar, renderer, narration, player, code panel, watch/aux, counters, legend, info tabs; syncs `?input=` / `?step=` in the URL.
- `src/store/prefs.ts` — zustand + localStorage (`steplore-prefs`): theme, language, speed, progress, popup geometry.
- Styling: `src/styles/app.css`, theme tokens on `:root` / `[data-theme="light"]`, highlight kinds use `.k-<kind>` and `[data-k]`.

## Working agreements
- Keep the quality bar of existing pages: concrete step messages, accurate invariants, ≥ 3 presets
  (typical / edge / worst), ≥ 3 real LeetCode problems with notes in our own words (never copy statements).
- One tab (or one renderer + its tab) per session is a good unit. After each batch: `npx tsc -b`, `npm test`,
  open the pages in Chrome (chrome-devtools MCP) and check for console errors, tick `ROADMAP.md`, close the GitHub issue items.
- Commit only when the user asks; they deploy from `main`.
- Ask before deleting things from the original project (`legacy/`, `Test1.gif`, `Test2.gif`).

## Gotchas learned the hard way
- **Shell heredocs break on apostrophes** in this environment (`doesn't` inside `<<'EOF'` fails). Write files
  with the Write tool, or put Python scripts in the scratchpad and run them.
- **Vite can cache a half-written file** (e.g. after `cat > file`), leading to "module does not provide an export"
  errors. `touch` the file and reload.
- Duplicate `@mark` names in one file silently highlight the first occurrence — tests now forbid duplicates.
- `Map` highlight priority: later highlights override earlier ones for the same id; put the important kind last.
- Grid traces store per-cell status in `state.marks` (one char per cell) instead of thousands of highlights — keep it that way for big inputs.
- When writing `meta.problems`, double-check every entry is a real problem (number, title, slug).
