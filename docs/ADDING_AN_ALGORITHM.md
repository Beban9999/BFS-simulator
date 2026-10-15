# Adding an algorithm page

Every page is **one folder** under `src/algorithms/<category>/<id>/`. The registry
(`src/registry.ts`) finds it automatically with `import.meta.glob` — no other file needs editing.
A tab with zero pages is hidden; adding the first folder makes it appear.

```
src/algorithms/<category>/<id>/
  meta.ts        # light metadata, loaded eagerly (menus, search, practice problems)
  index.ts       # the AlgorithmModule: generator, reference, presets... (lazy-loaded chunk)
  code.py.txt    # Python shown in the code panel, with @mark comments
  code.js.txt    # JavaScript, same markers
  info.md        # explanation tabs
```

`<category>` must be a `CategoryId` from `src/engine/types.ts`, and `<id>` must equal `meta.id`
(the test suite checks this). Good reference implementations to copy from:

| Shape of the page | Copy from |
|---|---|
| Array + pointers + ranges | `arrays-hashing/kadane`, `two-pointers/three-sum` |
| Bars (heights) | `two-pointers/trapping-rain`, `sorting/bubble-sort` |
| Array + hash map in the aux panel | `arrays-hashing/two-sum-hash`, `two-pointers/min-window-substring` |
| Matrix | `arrays-hashing/spiral-matrix`, `searching/staircase-search` |
| Grid with drawing | `graphs/bfs-grid` |
| Custom renderer | `arrays-hashing/hash-table` + `src/renderers/HashTableView.tsx` |
| Nested helper generators (`yield*`) | `searching/bounds`, `arrays-hashing/hash-table` |
| Recursion with a call-stack panel | `sorting/merge-sort`, `sorting/quick-sort-lomuto` (frames array pushed/popped around `yield*`) |
| Extra rows under bars (buffer) | `sorting/merge-sort` |
| Heap as tree + array (bars) in sync | `heaps/binary-heap`, `sorting/heap-sort` (tree renderer with `array`) |
| Select-field option that changes behaviour | `sorting/quick-sort-lomuto` (pivot rule), `linked-lists/copy-random-list` (approach) |
| Stack / queue containers (+ token row) | `stacks-queues/valid-parentheses`; op sequences: `stacks-queues/min-stack`; bars + stack: `stacks-queues/largest-rectangle` |
| Recursive binary-tree page (call stack, sub-labels) | `trees/max-depth`, `trees/diameter` (via `_shared/treetrace.ts`) |
| Tree that changes shape (rotations, deletes) | `trees/avl-insert`, `trees/bst-delete` |
| Graph (nodes/edges, distances, queue/heap) | `graphs/bfs-graph`, `graphs/dijkstra`; recursion: `graphs/dfs-graph`; forest beside it: `graphs/union-find`; matrix beside it: `graphs/floyd-warshall` |
| Grid puzzle on the `grid` renderer (own alphabet + paint tools) | `graphs/number-of-islands`, `graphs/rotting-oranges` |
| Backtracking with a decision tree (+ array or board) | `backtracking/subsets`, `backtracking/permutations`; board: `backtracking/n-queens`, `backtracking/sudoku` |
| Linked list re-wiring | `linked-lists/reverse-list`; several rows: `linked-lists/merge-two-lists`; recursion: `linked-lists/reverse-list-recursive` |

## 1. `meta.ts`

```ts
import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "kadane",
  title: "Kadane's Algorithm",
  category: "arrays-hashing",
  subcategory: "Array scans",      // must match (or will be appended to) CATEGORIES[...].subcategories
  difficulty: "core",              // core | intermediate | advanced
  order: 1,                        // sort order inside the subcategory
  summary: "One sentence shown in lists and search.",
  keywords: ["maximum subarray", "running sum"],   // extra Ctrl+K search terms
  problems: [
    // LeetCode: number, title, difficulty, slug, and a one-line note IN OUR OWN WORDS.
    // Never copy problem statements. Double-check every entry is a real problem.
    { id: 53, title: "Maximum Subarray", difficulty: "Medium", slug: "maximum-subarray", note: "Best sum ending here vs. best overall." },
  ],
};
export default meta;
```

## 2. `code.py.txt` / `code.js.txt` — line markers

Put a trailing marker comment on any line a step should highlight:

```python
    for i in range(1, len(nums)):               # @mark loop
        if cur < 0:                             # @mark check
```

- Python uses `# @mark name`, JS uses `// @mark name`. Several names: `# @mark a, b`.
- A line may also carry a normal comment before the marker: `x = 1  # explain   # @mark init`.
- Markers are stripped for display. Every marker a step uses must exist in **every** language, and
  a name may appear **only once per file** (both are enforced by tests).
- Write idiomatic interview-style code; keep the two languages structurally parallel.

## 3. `info.md`

Sections are split on `## ` headings and become tabs, in this order:

```
## Explanation      3–6 sentences of intuition + **Invariant:** line
## Complexity       table with best/avg/worst where relevant (+ stable? for sorts)
## When to use      bullet list of problem "signals"
## Pitfalls         2–4 bullets
## Template         minimal reusable code block
```

The first four are required by the tests. "Practice problems" is added automatically from `meta.problems`.
Keep factual claims short; check documentation for anything version-dependent.

## 4. `index.ts`

```ts
import type { AlgorithmModule } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { ai, numbersField, randomNumbers, type ArrayState } from "../../_shared/array";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input { nums: number[] }

function* generate({ nums }: Input) {
  const t = new Tracer<ArrayState>();
  // ...run the algorithm, and at every interesting moment:
  yield t.step("check", `Plain-English narration of this exact step.`, {
    state: { rows: [{ values: nums }], pointers: [{ name: "i", index: i }], ranges: [...] },
    vars: { i, cur, best },                       // watch panel
    aux: [{ label: "seen", kind: "map", items: [...map.entries()] }],   // optional
    callStack: [{ call: "dfs(2, 3)" }],           // optional, bottom → top
    highlights: [...hl("current", ai(i)), ...hl("found", ai(j))],
  });
  t.count("comparisons");                         // live counters (cumulative)
  // The LAST step's state must carry the answer (e.g. state.result) for outputOf.
}

const algorithm: AlgorithmModule<Input, ArrayState> = {
  ...meta,
  renderer: "array",
  inputSchema: { fields: [numbersField("nums", "nums", { minLength: 1 })], validate: (input) => null },
  presets: [ /* ≥ 3: typical/LeetCode example, edge case, worst case */ ],
  randomInput: (size, rng = Math.random) => ({ nums: randomNumbers(rng, size, -9, 9) }),
  code: { python, javascript },
  generate,
  reference: ({ nums }) => /* plain, obviously-correct implementation (brute force is fine) */,
  outputOf: (state) => state.result,
  info,
  legendLabels: { found: "Best subarray" },      // rename legend entries for this page
  legendExtra: ["window"],                        // kinds to always show
};
export default algorithm;
```

### Rules
- **Never sleep or animate inside the algorithm.** The generator only records snapshots; the player replays them.
- `Tracer.step` deep-copies everything, so mutating your working arrays after yielding is safe.
- Use `randomInput(size, rng)` with the passed `rng` (tests use a seeded RNG). Keep inputs small enough
  that traces stay well under 10 000 steps; the tests fail if a preset or random input exceeds it.
- `reference()` must agree with `outputOf(lastState)` for every preset and 200 random inputs —
  watch tie-breaking (which index/pair/window is returned) and `-0` vs `0`.
- Messages must be concrete: "Swap 9 and 3", never "step 37".
- Inputs must validate: use the field constraints and `inputSchema.validate` for cross-field rules
  (e.g. "k ≤ n", "matrix must be square"). Presets are validated by tests too.

### Highlight kinds (`HighlightKind`)
`current, compare, swap, pivot, frontier, visited, active, window, match, mismatch, found, sorted, path, pruned, removed, start, end, wall`.
Each has a colour and a shape/glyph (colour-blind friendly) and its own legend label (override with `legendLabels`).
The legend automatically shows every kind used in any step, plus the kinds of `ranges`.

Highlight ids per renderer:

| Renderer | State type | Ids |
|---|---|---|
| `array` / `bars` | `ArrayState` (`_shared/array.ts`) | `ai(index, row)` → `"row:index"` |
| `matrix` | `MatrixState` (`_shared/matrix.ts`) | `mi(r, c)` → `"m:r,c"`; nested `arrays` use `ai` |
| `grid` | `GridState` (`_shared/grid.ts`) | `cellId(r, c)`; bulk status via `state.marks` string (`Marks` helper) |
| `hashtable` | `HashState` (`_shared/hash.ts`) | `bi(bucket)`, `ei(bucket, entry)` |
| `stackqueue` | `SQState` (`_shared/stackqueue.ts`, items via `Box`) | `qid(container, itemId)`, ring slots `slotId(container, slot)`; the optional `array` uses `ai(i, row)` |
| `tree` | `TreeState` (`_shared/tree.ts`; heaps via `heapView`) | `tn(node)`, `te(parent, child)`; the optional `array` uses `ai(i, row)` |
| `graph` | `GraphState` (`_shared/graph.ts`) | `gn(node)`, `ge(u, v)` (undirected: either order); optional `trees` use `tn`/`te`, `matrix` uses `mi`, `array` uses `ai` |
| `decisiontree` | `DecisionState` (`_shared/decision.ts`, build it with `DecisionTree`) | `dn(node)`, `de(parent, child)`; `array` uses `ai`, `matrix` uses `mi` |
| `linkedlist` | `ListState` (`_shared/list.ts`, build it with `ListModel`) | `nid(node)`, `eid(from, to)` next edge, `pid` prev edge, `rid` random edge |

`ArrayState` extras: `rows[].bars` (draw heights), `rows[].ids` (stable identities → swaps animate),
`rows[].hideIndex`, `pointers` (labels under cells, index may be −1 or n), `ranges` (brackets with labels), `caption`.

### Input field kinds (`InputField`)
`numbers, number, text, words, select, grid, matrix, tree, graph, json` — parsed/validated in `src/engine/input.ts`,
rendered by `src/components/InputEditor.tsx`. A `grid` field with `tools` + `renderer: "grid"` enables drawing on the canvas (`empty` sets the toggled-off character). A `graph` field + `renderer: "graph"` enables the graph editing tools (opt out with `rendererOptions: { noEdit: true }`).

## 5. Adding a renderer
1. Create `src/renderers/<Name>View.tsx` exporting a component `(props: RendererProps<State>)`.
   It must be a pure view of `step.state` + `highlights` (no algorithm logic). Reuse `KIND_GLYPH` and the
   `[data-k]` CSS (`--k` colour variable) from `ArrayView.tsx` / `app.css` so colours match the legend.
2. Put the state type and id helpers in `src/algorithms/_shared/<name>.ts` (algorithms must not import renderer files).
3. Add the id to `RendererId` in `src/engine/types.ts` and register it in `src/renderers/index.ts`.
4. CSS goes in `src/styles/app.css`; define colours only through the existing theme variables so dark/light both work.

## 6. Checklist before committing (Definition of Done, spec §5)
- [ ] `npm test` passes (property test vs reference, markers, presets, info sections).
- [ ] `npx tsc -b` clean.
- [ ] Opened in the browser: plays to the end, every step's message makes sense, the highlighted code
      line matches what the step says, legend labels make sense, no console errors.
- [ ] ≥ 3 presets (typical, edge case, worst case); ≥ 3 real practice problems.
- [ ] Tick the page in `ROADMAP.md`.
