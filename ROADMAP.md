# Steplore roadmap

Source of truth for what exists and what's next. The full original spec is
[algo-visualizer-build-prompt.md](algo-visualizer-build-prompt.md) (section numbers below refer to it).
How to build a page: [docs/ADDING_AN_ALGORITHM.md](docs/ADDING_AN_ALGORITHM.md).
GitHub issues [#2–#19](https://github.com/Beban9999/BFS-simulator/issues) mirror the unchecked sections below (one per tab / feature); tick both when done.

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

Renderers: [x] `array` (cells) · [x] `bars` · [x] `matrix` · [x] `hashtable` · [x] `linkedlist` · [x] `stackqueue` · [x] `tree` · [x] `graph`

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

### Tab 5 — Sorting ✅ (12 pages; 3 items wait on Phase 4 features)
Shared helper: `src/algorithms/_shared/sorting.ts` (`Sortable` with stable ids → bars glide on swaps; `sortField`, `sortPresets`, `randomSortInput`, `sortedCopy`). Use `renderer: "bars"`.
Recursive pages (`merge-sort`, `quick-sort-lomuto`, `quick-sort-hoare`) show the pattern for nested generators + `callStack` frames.
- [x] Bubble *(bubble-sort)* · [x] Selection *(selection-sort)* · [x] Insertion, "nearly sorted" preset *(insertion-sort)* · [x] Shell *(shell-sort)*
- [x] Merge sort — buffer row + call stack *(merge-sort)*
- [x] Quick sort Lomuto — pivot rule select (last / middle / median-of-three) + sorted worst-case presets *(quick-sort-lomuto)*
- [x] Quick sort Hoare *(quick-sort-hoare)*
- [x] Heap sort — tree view + bars *(heap-sort)*
- [x] Counting sort (stable, prefix sums) *(counting-sort)* · [x] Radix LSD (buckets in the aux panel) *(radix-sort)* · [x] Bucket sort *(bucket-sort)*
- [x] Quickselect / Kth Largest *(quickselect)*
- [ ] Note page: stability demo (records with equal keys) — **needs:** note-page support (issue #10)
- [ ] Note page: built-in sorts (Timsort / introsort / pdqsort…) — verify current facts from docs before writing (issue #10)
- [ ] Sorting race / compare mode + complexity table — **needs:** compare mode (issue #17)

### Tab 6 — Linked Lists ✅ (13)
Renderer: `src/renderers/LinkedListView.tsx` + `src/algorithms/_shared/list.ts`. SVG nodes laid out by `rows` (node ids per row, `null` = gap); `next` arrows are single cubic paths whose `d` is CSS-transitioned, so re-wiring visibly morphs (straight to the right neighbour, arcs above otherwise, curves between rows). Optional `prev` (doubly, second arrow) and `random` (dashed arcs). Pointer labels under nodes; null pointers listed under the drawing. `ListModel` mirrors `node.next = …` in generators (`chain`, `place`, `layout`, `hide`, `values`). Highlight ids `nid(id)` → `n:<id>`, `eid(a, b)` → `e:<a>-<b>` (also `pid` prev, `rid` random).
- [x] Search / insert / delete; singly vs doubly *(list-basics)*
- [x] Reverse iterative (prev/curr/next) *(reverse-list)* · [x] Reverse recursive (call stack) *(reverse-list-recursive)* · [x] Reverse k-group *(reverse-k-group)* · [x] Palindrome list *(palindrome-list)*
- [x] Merge two sorted *(merge-two-lists)* · [x] Merge k sorted (heap aux) *(merge-k-lists)*
- [x] Floyd cycle + cycle start *(list-cycle)*
- [x] Middle node *(middle-node)* · [x] Remove n-th from end (gap pointers) *(remove-nth-end)* · [x] Reorder list *(reorder-list)*
- [x] Copy list with random pointer (hashmap + interleaving) *(copy-random-list)*
- [x] Add two numbers *(add-two-numbers)*

### Tab 7 — Stacks & Queues ✅ (12)
Renderer: `src/renderers/StackQueueView.tsx` + `src/algorithms/_shared/stackqueue.ts`. Optional `array` (an `ArrayState` drawn with the array renderer: tokens, bars, answer rows — ids `ai(i, row)`) above any number of containers: vertical `stack`, horizontal `queue` / `deque`, or `ring` (circular buffer slots + pointers). Items carry stable ids so they glide; build them with `Box` (`push`, `pushFront`, `pop`, `shift`, `view`). Highlight ids `qid(container, itemId)`, ring slots `slotId(container, slot)`. Op-sequence pages show the operations in an aux list; class-style pages (no "done" line) carry `result` on every step.
- [x] Stack / queue / deque operations playground *(stack-queue-ops)* · [x] Circular buffer *(circular-buffer)*
- [x] Valid Parentheses *(valid-parentheses)* · [x] Min stack *(min-stack)* · [x] Evaluate RPN *(eval-rpn)* · [x] Generate parentheses (backtracking, call stack) *(generate-parentheses)*
- [x] Monotonic stack: Daily Temperatures *(monotonic-stack)* · [x] Largest rectangle in histogram (bars) *(largest-rectangle)* · [x] Car Fleet *(car-fleet)*
- [x] Monotonic queue → cross-linked from `monotonic-stack` to `two-pointers/sliding-window-max`
- [x] Queue using stacks *(queue-via-stacks)* · [x] Stack using a queue *(stack-via-queues)*
- [x] Shunting-yard / basic calculator *(basic-calculator)*

## Phase 2 — Trees, heaps, graphs

### Renderers
- [x] `tree` — `src/renderers/TreeView.tsx` + `src/algorithms/_shared/tree.ts`. Binary + n-ary via `d3-hierarchy` (null children keep left/right positions), several trees per state (`trees: TreeView[]`), optional `array` (ArrayState, drawn below with the array renderer) in sync. Highlight ids `tn(id)` → `n:<id>`, `te(p, c)` → `e:<p>-<c>`; node ids must be unique across trees. Heaps: `heapView(items)` + `siftUpEvents` / `siftDownEvents` (yield compare/swap/stop so pages choose their own lines). Input field kind `tree` (level order with nulls) is used by the Tab 9 pages (`treeField`). Extra dashed links (`TreeView.links`, highlight `tl(from, to)`) draw Morris threads.
- [x] `graph` — `src/renderers/GraphView.tsx` + `src/algorithms/_shared/graph.ts`. SVG nodes/edges, directed (arrowheads; two-way pairs bend apart) or undirected, weight labels, node sub-labels (`sub`, e.g. distances) and colour groups (`groups`, 6 hues for components / bipartite sides). Optional `trees` (forest via the tree renderer, e.g. union-find) and `matrix` beside the drawing, `array` below. Highlight ids `gn(v)`, `ge(u, v)` (undirected edges match either order; the later highlight wins). Input field kind `graph` (`graphField`): value `{ n, edges: [[u, v, w?]], directed, pos?, labels? }`, text form `n=6 directed` + `0-1:4, 1>2`. On the canvas: drag nodes (view only), Add node / Add edge (+ weight) / Delete / Auto layout tools under it (edits are validated, then restart the run). Layout: `pos` from presets (`gridPos`), else deterministic force layout (`autoLayout`) or `layeredLayout` for DAGs.

### Tab 8 — Heaps ✅ (5)
- [x] Binary heap: build-heap O(n), push/sift-up, pop/sift-down — tree + array *(binary-heap)*
- [x] Top-K / k-th largest *(top-k)* · [x] Two heaps — median of stream *(two-heaps-median)* · [x] K-way merge *(k-way-merge)* · [x] Scheduling: Meeting Rooms II *(heap-scheduling)*
- [x] Tree view added to `sorting/heap-sort` (now `renderer: "tree"` with the bars as its `array`)

### Tab 9 — Trees ✅ (23)
Shared: `_shared/bintree.ts` (`BTree` with stable ids, level-order parse/serialize, `treeField`, `randomTree` / `randomBST` / `randomDistinctTree`, `isBST`) and `_shared/treetrace.ts` (`TreeTrace`: call frames, root→current path, per-node sub-labels and marks → TreeState steps). Copy `trees/max-depth` for a new recursive page.
- [x] Traversals: pre/in/post recursive *(dfs-traversals)* · explicit stack *(iterative-traversals)* · level order + zigzag *(level-order)* · Morris with dashed thread links *(morris-inorder)*
- [x] Tree recursion: *(max-depth)* · *(diameter)* · *(balanced-tree)* · *(max-path-sum)* · path sum II *(path-sum)* · *(good-nodes)*
- [x] BST: search + insert *(bst-search-insert)* · delete, 3 cases *(bst-delete)* · *(validate-bst)* · *(kth-smallest-bst)* · *(inorder-successor)* · LCA, BST + binary tree *(lowest-common-ancestor)*
- [x] Construct from preorder + inorder *(construct-pre-in)* · serialize / deserialize *(serialize-tree)*
- [x] AVL rotations *(avl-insert)* · red-black insert *(red-black-insert)*
- [x] Trie insert / search / prefix / delete *(trie)* (Word Search II listed in its problems)
- [x] Segment tree build / query / update *(segment-tree)* · Fenwick / BIT *(fenwick-tree)*
- [ ] Later: lazy propagation for the segment tree (range updates) — only described in its info tab; BST delete for AVL / red-black

### Tab 10 — Graphs ✅ (22; advanced pages moved to issue #19)
Shared: `_shared/graph.ts` (sample graphs `SAMPLE_UNDIRECTED`, `SAMPLE_DIRECTED`, `SAMPLE_DAG`, `SAMPLE_WEIGHTED`…, `randomGraph` / `randomDagish`, `adjacency`, `dsuForest`, `sourceField`). Grid pages use `charGridField` / `randomCharGrid` / `capFrames` from `_shared/grid.ts`. Copy `graphs/bfs-graph` for a new graph page, `graphs/number-of-islands` for a grid one.
- [x] BFS grid *(bfs-grid)* · [x] DFS grid *(dfs-grid)*
- [x] Representations: edge list → adjacency lists + matrix *(representations)*
- [x] BFS on graphs *(bfs-graph)* · DFS recursive vs iterative *(dfs-graph)*
- [x] Grid patterns: islands + max area *(number-of-islands)* · *(flood-fill)* · multi-source BFS *(rotting-oranges, Walls and Gates / 01 Matrix in its problems)* · *(pacific-atlantic)* · *(surrounded-regions)*
- [x] Cycle detection, undirected parent + directed 3-colour *(cycle-detection)* · topo sort Kahn *(topo-sort-kahn)* + DFS *(topo-sort-dfs)* · *(bipartite)*
- [x] Union-Find with path compression + union by rank, forest view *(union-find)*
- [x] Shortest paths: BFS (*bfs-graph*), 0-1 BFS *(zero-one-bfs)*, *(dijkstra)*, *(bellman-ford)*, *(floyd-warshall)*, A* on grid *(a-star)*
- [x] MST: *(kruskal)* (sorted edges + union-find forest) · *(prim)* (lazy heap)
- [ ] Later (issue #19): Tarjan/Kosaraju SCC, bridges/articulation points, Hierholzer, Edmonds-Karp, clone graph, word ladder

## Phase 3 — Backtracking & DP
- [x] `decisiontree` — `src/renderers/DecisionTreeView.tsx` + `src/algorithms/_shared/decision.ts`. Generators drive a `DecisionTree` builder (`child` = choose, `enter` = explore, `finish` = return / un-choose, `prune` = branch cut without exploring, `found`) and put `view()` in `state.tree`, `marks()` in the highlights (current path, solutions, pruned, finished). Concrete view beside the tree: `array` (ids `ai`) and/or `matrix` board (ids `mi`). Big trees fold finished subtrees off the current path into `+k` nodes (limit per tree, default 70); the box scrolls to keep the current node visible. Highlight ids `dn(node)`, `de(parent, child)`.
- [ ] `table2d` renderer = `matrix` + arrows from each cell to its dependencies + path reconstruction (extend `src/renderers/MatrixView.tsx`)
- [x] Tab 11 Backtracking ✅ (9): *(subsets)* ± dups · *(permutations)* ± dups · *(combinations)* · *(combination-sum)* I/II · *(n-queens)* · *(sudoku)* 4×4 / 9×9 · *(word-search)* · *(palindrome-partitioning)* · *(letter-combinations)*. Generate parentheses already lives in Stacks & Queues (`stacks-queues/generate-parentheses`, listed in the problems of the backtracking pages). Copy `backtracking/subsets` for a new page.
- [ ] Note page: universal backtracking template — **needs:** note-page support (issue #10)
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
- Editing only `?step=` in the address bar of an already-open page doesn't jump (the step param is read on mount); a reload or a link from another page works. Fix: watch `params.get("step")` in `AlgorithmPage`.
- Rows in the `array` renderer are centred independently, so rows of different lengths (e.g. `counting-sort`'s count row vs nums) don't share columns. Fine today; a left-aligned option may help later.
- `prefix-sum-2d`: P is drawn beside the matrix with the same row numbers; P's row r+1 corresponds to matrix row r — could shift P down one row.
- Long sequences (e.g. `happy-number` unhappy inputs) make many small cells; fine but could wrap.
- `legacy/` holds the original BFS/DFS simulator; delete once no longer wanted.
