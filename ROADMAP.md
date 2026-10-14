# Steplore roadmap

Source of truth for what exists and what's next. The full original spec is
[algo-visualizer-build-prompt.md](algo-visualizer-build-prompt.md) (section numbers below refer to it).
How to build a page: [docs/ADDING_AN_ALGORITHM.md](docs/ADDING_AN_ALGORITHM.md).

Legend: `[x]` done (tests pass + checked in the browser) · `[ ]` to do · *(id)* = planned folder name ·
**needs:** = renderer/feature that must exist first.

Tabs without any page are hidden from the header automatically and listed as "Coming soon" on the
landing page — so a tab goes live the moment its first algorithm folder is added.

---

## Phase 0 — Port & engine ✅

- [x] Vite + React + TS (strict) app, HashRouter deep links (`#/<category>/<id>?input=…&step=…`)
- [x] Step-trace engine (`src/engine/`): `Tracer`, immutable snapshots, 10 000-step cap
- [x] Line markers (`# @mark name` / `// @mark name`) mapped per language
- [x] Player: play/pause/step/scrub/speed (0.25×–64×), keyboard `Space ← → Home End + -`
- [x] Code panel with Python/JS tabs, current-line highlight, floating draggable/resizable popup (remembers position)
- [x] Watch panel (vars with change highlight), call stack, aux structures (queue/stack/deque/set/map/list/heap)
- [x] Counters, legend (colour + shape/glyph per kind), info tabs (markdown), practice problems
- [x] Input editor (fields generated from `inputSchema`, JSON mode, validation, presets, random, share link)
- [x] Progress marks (learned / review later) in localStorage, per-tab progress bar
- [x] Ctrl/Cmd+K command palette (algorithms, keywords, LeetCode problem titles/numbers)
- [x] Dark/light theme (original palette), responsive layout, `prefers-reduced-motion`
- [x] `Grid` renderer ported from the original simulator (draw walls, drag start/end)
- [x] Original BFS/DFS ported (`graphs/bfs-grid`, `graphs/dfs-grid`); original files kept in `legacy/`
- [x] Vitest suite: every module checked against `reference()` on presets + 200 random inputs, markers exist in every language, no duplicate markers
- [x] Rename to **Steplore**, grid-path "S" logo (`public/favicon.svg`)

## Phase 1 — Core renderers & high-frequency topics

Renderers: [x] `array` (cells) · [x] `bars` · [x] `matrix` · [x] `hashtable` · [ ] `linkedlist` · [ ] `stackqueue` · [ ] `tree` (moved to Phase 2)

### Tab 2 — Arrays & Hashing ✅ (16)
- [x] Hash table internals — chaining vs linear probing, resize/rehash *(hash-table)*
- [x] Two Sum hash map *(two-sum-hash)* · [x] Frequency counting / Valid Anagram *(frequency-count)* · [x] Longest consecutive sequence *(longest-consecutive)*
- [x] Prefix sum 1D *(prefix-sum)* · [x] 2D prefix sum *(prefix-sum-2d)* · [x] Subarray Sum Equals K *(subarray-sum-k)* · [x] Difference array *(difference-array)* · [x] Product except self *(product-except-self)*
- [x] Kadane *(kadane)* · [x] Boyer–Moore *(boyer-moore)*
- [x] Dutch National Flag *(dutch-flag)* · [x] Cyclic sort *(cyclic-sort)*
- [x] Spiral *(spiral-matrix)* · [x] Rotate 90° / transpose *(rotate-image)* · [x] Set matrix zeroes *(set-matrix-zeroes)*

### Tab 3 — Two Pointers & Sliding Window ✅ (15)
- [x] Two Sum II *(two-sum-sorted)* · [x] Valid Palindrome *(valid-palindrome)* · [x] Container With Most Water *(container-water)* · [x] 3Sum *(three-sum)* · [x] Trapping Rain Water *(trapping-rain)*
- [x] Remove duplicates *(remove-duplicates)* · [x] Move zeroes *(move-zeroes)*
- [x] Find the Duplicate (Floyd) *(find-duplicate)* · [x] Happy Number *(happy-number)*
- [x] Fixed window max sum *(fixed-window)* · [x] Find All Anagrams *(find-anagrams)*
- [x] Longest substring w/o repeats *(longest-unique-substring)* · [x] Char replacement *(char-replacement)* · [x] Minimum window substring *(min-window-substring)*
- [x] Sliding window max, monotonic deque *(sliding-window-max)*

### Tab 4 — Searching ✅ (9)
- [x] Linear *(linear-search)* · [x] Binary classic *(binary-search)* · [x] Lower/upper bound *(bounds)*
- [x] Rotated search *(rotated-search)* · [x] Rotated minimum *(rotated-min)*
- [x] Binary search on the answer — Koko *(koko-bananas)*
- [x] 2D flattened *(matrix-search)* · [x] Staircase *(staircase-search)*
- [x] Median of two sorted arrays *(median-two-arrays)*

### Tab 5 — Sorting (1 / 13)
Shared helper exists: `src/algorithms/_shared/sorting.ts` (`Sortable` with stable ids → bars glide on swaps; `sortField`, `sortPresets`, `randomSortInput`, `sortedCopy`). Use `renderer: "bars"`.
- [x] Bubble *(bubble-sort)*
- [ ] Selection *(selection-sort)*
- [ ] Insertion, with "nearly sorted" preset *(insertion-sort)*
- [ ] Shell *(shell-sort)*
- [ ] Merge sort — show merge buffer as an extra row + `callStack` frames `merge_sort(lo, hi)` *(merge-sort)*
- [ ] Quick sort Lomuto + pivot strategies + worst-case preset *(quick-sort-lomuto)*
- [ ] Quick sort Hoare *(quick-sort-hoare)*
- [ ] Heap sort — array bars now; add tree view once `tree` renderer exists *(heap-sort)*
- [ ] Counting sort *(counting-sort)* · [ ] Radix LSD (bucket rows per digit) *(radix-sort)* · [ ] Bucket sort *(bucket-sort)*
- [ ] Quickselect / Kth Largest *(quickselect)*
- [ ] Note page: stability demo (records with equal keys) — **needs:** note-page support (see Phase 4)
- [ ] Note page: built-in sorts (Timsort / introsort / pdqsort…) — verify current facts from docs before writing
- [ ] Sorting race / compare mode + complexity table — **needs:** compare mode (Phase 4)

### Tab 6 — Linked Lists (0) — **needs:** `linkedlist` renderer
Renderer plan: SVG nodes in a row (or `layout` positions from state), arrows for `next` that visibly re-wire (curved when not adjacent), optional `random` pointers drawn below, pointer labels (prev/curr/next/slow/fast) under nodes. State: `{ nodes: {id, val}[], next: Record<id, id|null>, order: id[], pointers: {name, node}[] }`. Highlight ids `n:<id>`, `e:<from>-<to>`.
- [ ] Traversal / insert / delete; singly vs doubly *(list-basics)*
- [ ] Reverse iterative (prev/curr/next) *(reverse-list)* · [ ] Reverse recursive (call stack) *(reverse-list-recursive)* · [ ] Reverse k-group *(reverse-k-group)* · [ ] Palindrome list *(palindrome-list)*
- [ ] Merge two sorted *(merge-two-lists)* · [ ] Merge k sorted (heap aux) *(merge-k-lists)*
- [ ] Floyd cycle + cycle start *(list-cycle)*
- [ ] Middle node *(middle-node)* · [ ] Remove n-th from end (gap pointers) *(remove-nth-end)* · [ ] Reorder list *(reorder-list)*
- [ ] Copy list with random pointer (hashmap + interleaving) *(copy-random-list)*
- [ ] Add two numbers *(add-two-numbers)*

### Tab 7 — Stacks & Queues (0) — **needs:** `stackqueue` renderer
Renderer plan: input token row (reuse array cells) + large vertical stack / horizontal queue/deque / circular buffer ring. Many pages can also use `array` + aux panel only.
- [ ] Stack / queue / deque / circular buffer operations playground *(stack-queue-ops)*, *(circular-buffer)*
- [ ] Valid Parentheses *(valid-parentheses)* · [ ] Min stack *(min-stack)* · [ ] Evaluate RPN *(eval-rpn)* · [ ] Generate parentheses (link to backtracking) *(generate-parentheses)*
- [ ] Monotonic stack: next greater / Daily Temperatures *(monotonic-stack)* · [ ] Largest rectangle in histogram (bars) *(largest-rectangle)* · [ ] Car Fleet *(car-fleet)*
- [ ] Monotonic queue → cross-link to `two-pointers/sliding-window-max`
- [ ] Queue using stacks *(queue-via-stacks)* · [ ] Stack using queues *(stack-via-queues)*
- [ ] Shunting-yard / basic calculator *(basic-calculator)*

## Phase 2 — Trees, heaps, graphs

### Renderers
- [ ] `tree` — binary + n-ary, layout via `d3-hierarchy` (already a dependency), optional array view for heaps (tree and array in sync), highlight ids `n:<id>` / `e:<parent>-<child>`. Input field kind `tree` (level order with nulls) already exists in `src/engine/input.ts`.
- [ ] `graph` — SVG nodes/edges, directed/undirected, weights, fixed layout + drag; graph builder input (click to add nodes/edges) + JSON edge-list field. Show distance table / heap in aux.

### Tab 8 — Heaps
- [ ] Binary heap insert/sift-up, extract/sift-down, build-heap O(n) *(binary-heap)*
- [ ] Top-K *(top-k)* · [ ] Two heaps — median of stream *(two-heaps-median)* · [ ] K-way merge *(k-way-merge)* · [ ] Scheduling (Task Scheduler / Meeting Rooms II) *(heap-scheduling)*
- [ ] Go back and add tree view to `sorting/heap-sort`

### Tab 9 — Trees
- [ ] Traversals: pre/in/post recursive (call stack) and iterative (explicit stack), level order, zigzag, Morris (advanced)
- [ ] Tree recursion: max depth, diameter, balanced, max path sum · path problems (path sum, root-to-leaf, good nodes)
- [ ] BST: search, insert, delete (3 cases), validate, kth smallest, successor · LCA (BST + binary tree)
- [ ] Construct from preorder+inorder · serialize/deserialize
- [ ] AVL rotations · red-black insert (advanced)
- [ ] Trie insert/search/prefix/delete (+ Word Search II link)
- [ ] Segment tree (build/query/update, lazy — advanced) · Fenwick / BIT

### Tab 10 — Graphs (2 done)
- [x] BFS grid *(bfs-grid)* · [x] DFS grid *(dfs-grid)*
- [ ] Representations toggle (adj list / matrix / edge list)
- [ ] BFS/DFS on graphs; recursive vs iterative DFS
- [ ] Grid patterns: number of islands, flood fill, max area, multi-source BFS (rotting oranges, walls & gates), Pacific Atlantic, surrounded regions — all on the existing `grid` renderer (use `rendererOptions.charKinds` to draw land/water)
- [ ] Cycle detection (undirected parent/DSU, directed 3-colour) · topo sort (Kahn + DFS) · bipartite
- [ ] Union-Find with path compression + union by rank (forest view)
- [ ] Shortest paths: BFS, 0-1 BFS, Dijkstra, Bellman-Ford, Floyd-Warshall, A* on grid
- [ ] MST: Kruskal, Prim
- [ ] Advanced: Tarjan/Kosaraju SCC, bridges/articulation points, Hierholzer, Edmonds-Karp, clone graph, word ladder

## Phase 3 — Backtracking & DP
- [ ] `decisiontree` renderer (choose → explore → un-choose, pruned branches greyed) synced with the concrete state view
- [ ] `table2d` renderer = `matrix` + arrows from each cell to its dependencies + path reconstruction (extend `src/renderers/MatrixView.tsx`)
- [ ] Tab 11 Backtracking: subsets (± dups), permutations, combinations, combination sum I/II, N-Queens, Sudoku, word search, palindrome partitioning, phone letters, generate parentheses, template note page
- [ ] Tab 12 DP: "From recursion to DP" (4 views), 1D (house robber I/II, coin change, decode ways, word break, min cost stairs), LIS (n² and n log n), grid (unique paths, min path sum), strings (LCS, edit distance + alignment, longest palindromic substring, distinct subsequences), knapsack (0/1 + 1D trick, unbounded, partition, target sum), interval (burst balloons, matrix chain), state machine (stock variants, automaton view), trees (House Robber III), bitmask TSP

## Phase 4 — The rest + platform features
- [ ] **Note-page support**: a module kind with a custom React page and no `generate` (Big-O chart, memory model, greedy-vs-DP counter-example, stability, built-in sorts, cheat sheet). Suggested: `kind: "note"` in meta + `Page` component export; update the registry, tests and `AlgorithmPage`.
- [ ] Tab 1 Fundamentals: Big-O growth chart + amortized doubling, recursion call stack/recursion tree (factorial, fib, power, overflow), memory model note
- [ ] Tab 13 Greedy & Intervals (`intervals` renderer: timeline bars + sweep line): merge/insert/non-overlapping intervals, meeting rooms I/II, min arrows, jump game I/II, gas station, partition labels, hand of straights, activity selection, Huffman, greedy-vs-DP note
- [ ] Tab 14 Strings (`stringmatch` renderer): naive, KMP (LPS table), Rabin-Karp (rolling hash), Z-algorithm, expand-around-centre, Manacher, encode/decode strings
- [ ] Tab 15 Bits (`bits` renderer): playground (AND/OR/XOR/NOT/shifts, two's complement), tricks, Single Number, Number of 1 Bits, Counting Bits, Reverse Bits, Missing Number, Sum of Two Integers, bitmask subsets
- [ ] Tab 16 Math & Geometry (`plane2d` renderer): GCD/LCM, sieve, fast pow, modular note, Fisher–Yates, reservoir sampling histogram, convex hull, segment intersection, point in polygon, Pow(x,n), Multiply Strings, Detect Squares
- [ ] Tab 17 Design: LRU (hashmap + DLL animated), LFU, min stack, iterators, time-based KV store, Bloom filter, skip list; optional rate limiter / consistent hashing / producer-consumer
- [ ] Tab 18 Cheat sheet: searchable signal → pattern → page table + Big-O tables (`src/pages/CheatSheet.tsx` is a placeholder; tab hidden until built — un-hide by removing the `countFor > 0` filter for it in `Header.tsx`)
- [ ] Compare mode (2–4 algorithms side by side, shared input, counters) for sorting / shortest paths / search
- [ ] "Predict the next step" quiz mode (`quiz` pref already exists in `src/store/prefs.ts`; `usePlayer` already accepts a `pauseAt` callback)

## Phase 5 — Polish
- [ ] Playwright smoke test: every route loads and plays to the end without console errors (`@playwright/test` is installed; can use system Chrome via `channel: "chrome"`)
- [ ] Accessibility audit (Lighthouse), keyboard-only pass, focus order in the popup
- [ ] Mobile: code/info as bottom sheets (currently stacked panels)
- [ ] Performance on big inputs (canvas grid for > 40×40, trace memory)
- [ ] Optional Java / C++ code tabs (CodePanel already supports `java` / `cpp` keys)

## Known small issues / ideas
- `prefix-sum-2d`: P is drawn beside the matrix with the same row numbers; P's row r+1 corresponds to matrix row r — could shift P down one row.
- Long sequences (e.g. `happy-number` unhappy inputs) make many small cells; fine but could wrap.
- `legacy/` holds the original BFS/DFS simulator; delete once no longer wanted.
