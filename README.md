# Steplore

**Watch every interview algorithm run, one step at a time.**

Steplore is an interactive visualizer for the algorithms, data structures and patterns used in coding interviews.
Every page combines three things:

1. **The simulation** — an animated, step-by-step run on an input you can edit, randomise or pick from presets.
2. **The code, running live** — Python or JavaScript with the current line highlighted, a watch panel for variables,
   the call stack and auxiliary structures (queues, stacks, hash maps). The code can pop out into a floating window.
3. **A short explanation** — intuition, invariant, complexity, when to use it, pitfalls, a template and practice problems.

**Live site:** https://sweet-sopapillas-d5fe17.netlify.app/

It grew out of a small BFS/DFS grid simulator (kept in [`legacy/`](legacy/)).

## Features
- Player: play / pause / step / scrub / speed, keyboard shortcuts (`Space`, `←` `→`, `Home` `End`, `+` `-`).
- Deep links: every page, input and step is shareable (`#/searching/bounds?input=…&step=9`).
- `Ctrl/Cmd + K` search across algorithms and LeetCode problem names.
- Progress tracking (learned / review later) stored in your browser.
- Dark and light themes, colour + shape legend for colour-blind users, works on mobile, respects reduced motion.

## Status
54 pages so far across Arrays & Hashing, Two Pointers & Sliding Window, Searching, Sorting and Graphs.
See [ROADMAP.md](ROADMAP.md) for the full plan.

## Development
```bash
npm install
npm run dev      # http://localhost:5173
npm test         # algorithm correctness tests (Vitest)
npm run build    # typecheck + production build into dist/
```

Requires Node 20.19+.

## Adding an algorithm
Each page is a single folder `src/algorithms/<category>/<id>/` — it is picked up automatically.
Follow [docs/ADDING_AN_ALGORITHM.md](docs/ADDING_AN_ALGORITHM.md).

## Project structure
| Path | Purpose |
| --- | --- |
| `src/engine/` | Step-trace engine: types, tracer, line markers, input parsing, seeded RNG |
| `src/algorithms/` | One folder per algorithm page; `_shared/` holds helpers per renderer |
| `src/renderers/` | Visual components (grid, array/bars, matrix, hash table) |
| `src/components/` | Player, code panel/popup, watch panel, input editor, command palette, … |
| `src/pages/` | Home, category overview, algorithm page |
| `public/favicon.svg` | Logo: a search path tracing an "S" on a grid |
| `netlify.toml` | Netlify build config (`npm run build` → `dist`) |
| `legacy/` | The original plain-JS BFS/DFS simulator |
