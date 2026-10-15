# Steplore — notes for coding sessions

Interactive algorithm visualizer (formerly a plain BFS/DFS grid demo). Every page = animated simulation +
code running line by line + explanation. Vite + React 19 + TypeScript (strict), static SPA on Netlify.

**Start here:** `ROADMAP.md` (what's done / next, with planned folder ids) →
`docs/ADDING_AN_ALGORITHM.md` (exact recipe + conventions) → the original spec
`algo-visualizer-build-prompt.md`. Open GitHub issues mirror the roadmap, one per tab/feature.

## Current status (update at the end of every session)
- **136 pages live**: Arrays & Hashing (16), Two Pointers (15), Searching (9), Sorting (12), Linked Lists (13), Stacks & Queues (12), Heaps (5), Trees (23), Graphs (22), Backtracking (9).
- Renderers built: `grid`, `array`, `bars`, `matrix`, `hashtable`, `linkedlist`, `stackqueue`, `tree`, `graph`, `decisiontree`.
- Last completed: `decisiontree` renderer + Tab 11 Backtracking, 9 pages (2026-10-15, closes issue #8). Earlier the same day: `graph` renderer + 22 Graphs pages (#7; advanced graph pages parked in #19).
- **Next up:** issue #9 — Tab 12 DP. The user asked for the meaningful core only, with the rest split into its own issue.

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
  `info.md`). `_shared/` holds state types + helpers per renderer (array, matrix, grid, hash, list, stackqueue, tree, bintree, treetrace, sorting, rotated, graph, decision).
- `src/registry.ts` — auto-collects folders with `import.meta.glob` (meta eager, module lazy).
- `src/renderers/` — pure views: `grid`, `array`/`bars`, `matrix`, `hashtable`, `linkedlist`, `stackqueue`, `tree`, `graph`, `decisiontree`. Registered in `renderers/index.ts`.
- `src/engine/graph.ts` — the `graph` input value (`{ n, edges, directed, pos?, labels? }`), its text form and validation.
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
- When checking a page in Chrome at a given step, navigate to `#/<cat>/<id>?step=N` **and reload** — changing only
  the hash of an open page doesn't re-read `step`. A quick whole-tab check: evaluate a script that sets
  `location.hash` per page, clicks "Jump to end (End)", and reads `.narration-text` / `.code-line.current`.
- If the chrome-devtools MCP says "browser is already running", ask the user to close that Chrome window; as a
  fallback, Playwright with `channel: "chrome"` can take screenshots (script must run from the repo root).
- `linkedlist` renderer: edges morph via CSS `d` transitions, so keep every edge a single `M … C …` cubic.
  Lay rows out so cross-row links stay short (e.g. `merge-two-lists` puts the merged row between the inputs);
  use distinct values in presets — narration names nodes by value.
- `stackqueue` renderer: call `Box.resetIds()` at the top of every generator; class-style pages (MinStack, MyQueue…)
  have no "done" line, so put `result` on every step instead of inventing a final step.
- `tree` renderer: node ids must be unique across all trees in one state (two-heaps uses one id counter).
  Heap pages animate `heapq` calls by turning `siftUpEvents`/`siftDownEvents` swaps into steps on the call's line.
- Binary-tree pages: build on `BTree` (`_shared/bintree.ts`) + `TreeTrace` (`_shared/treetrace.ts`); a tree drawn twice
  (serialize-tree) needs offset ids because node ids must be unique per state. Ops-style inputs (`sum:1-4`,
  `insert:cat`) use a `words` field with a regex + simulation in `validate`.
- Heredocs failed again this session on a large multi-file write; prefer the Write tool for anything long.
- `graph` renderer: positions are unit-square `pos` per node; give presets hand-placed `pos` via `gridPos([[x, y], …])`
  and check that no edge passes through a third node (collinear nodes hide edges). Random graphs fall back to the
  deterministic `autoLayout`. Editing tools (`AlgorithmPage` → `edit.tool`) only appear when the state graph has the
  same nodes/edges as the input field; tool state lives in `AlgorithmView` so it survives the remount after each edit.
- Grid pages with their own alphabet need `charGridField({ alphabet, empty, tools })` — the first tool is the default
  paint tool and `empty` is what a toggled cell becomes. A grid field without `tools` is not editable on the canvas.
- Grid cells with a label move their centre glyph (path diamond, frontier square) to the corner (`.cell.labelled`).
- `Tracer.step` deep-freezes every snapshot in dev/tests. `import.meta.env` is rebuilt on every access under Vitest,
  so it is read once into a constant in `engine/trace.ts` — reading it inside `deepFreeze` made steps ~50× slower
  (full suite went from 6.5 min to 40 s after the fix). Keep hot paths in the engine free of `import.meta` reads.
- `decisiontree`: `DecisionTree.finish("done")` never downgrades a node already marked `found`. Keep presets small
  (n ≤ 4–6): every choice is at least one step. Matrix cells: `null` draws an empty box with a faint dot, `""` draws nothing.
- Avoid floating-point maths (`Math.log10`, `Math.log2` of large values, divisions) for indices or labels in
  generators; use integer arithmetic (see `posOf` in `sorting/radix-sort`).
