# Build Prompt: "AlgoAtlas" — Interactive Algorithm & Data-Structure Visualizer

> Paste this whole file into your coding agent. It is written as instructions to the agent.

---

## 0. Context & Goal

I have an existing small web page that visualizes **DFS and BFS on a grid**. Extend it into a full learning website that visualizes **every algorithm, data structure and pattern someone needs for LeetCode / coding interviews**, so I (and others) can learn them and quickly refresh my memory.

Every algorithm page must have three things working together:

1. **The simulation** — an animated, step-by-step visualization of the algorithm running on an input the user can change.
2. **The code, running live** — the source code with the currently executing line highlighted, a variables/watch panel, and (for recursive algorithms) a call-stack panel. The code must also be openable as a **floating, draggable, resizable popup** so it can sit on top of the simulation while it plays.
3. **A short explanation** — what it is, when to use it (the "signals" in a problem statement that point to it), complexity, common pitfalls, and a list of classic LeetCode problems that use it.

**First step before writing anything:** inspect my existing repo. Reuse whatever is good (grid rendering, styling, the DFS/BFS logic) and port the existing DFS/BFS grid demos into the new architecture as the first two working modules. If the existing project is plain HTML/JS, migrate it; don't throw away the look and feel without asking.

---

## 1. Tech Stack (default — adjust only with good reason)

- **Vite + React + TypeScript** (strict mode), client-only SPA, deployable as static files (GitHub Pages / Netlify / Vercel).
- **Rendering:** SVG for graphs/trees/linked lists/arrays (crisp, easy to animate), HTML Canvas only where node counts get large (big grids, sorting with 200+ bars).
- **Animation:** CSS transitions + `framer-motion` (or equivalent) for movement between steps.
- **Graph/tree layout:** `d3-hierarchy` for trees, `d3-force` (or a simple fixed layout + drag) for graphs. No heavy graph library needed.
- **Code display:** Shiki or Prism for syntax highlighting (read-only; no Monaco needed).
- **Routing:** React Router with deep links: `/#/graphs/dijkstra?input=<encoded>` so any simulation state/input can be shared.
- **State:** Zustand (or React context) for player state; `localStorage` for preferences and progress.
- **Tests:** Vitest for algorithm correctness, Playwright for a smoke test that every route loads and plays to the end without errors.
- No backend. Everything runs in the browser.

---

## 2. Core Architecture — the Step-Trace Engine (most important part)

Do **not** animate by sleeping inside the algorithm. Instead every algorithm is a **pure generator that records a trace of immutable snapshots**, which a generic player then replays. This makes step-back, scrubbing, speed control and code-line sync trivial.

```ts
// Shape every algorithm module exports
interface AlgorithmModule<I, S> {
  id: string;                    // "dijkstra"
  title: string;                 // "Dijkstra's Shortest Path"
  category: CategoryId;          // "graphs"
  subcategory: string;           // "Shortest Paths"
  difficulty: 'core' | 'intermediate' | 'advanced';
  renderer: RendererId;          // which visual component draws S
  inputSchema: InputSchema<I>;   // drives the input editor UI
  presets: { name: string; input: I }[];  // incl. "LeetCode example", "worst case", "edge case"
  randomInput: (size: number) => I;
  code: { python: string; javascript: string; java?: string; cpp?: string };
  generate: (input: I) => Generator<Step<S>>;
  reference: (input: I) => unknown;       // plain implementation used in tests
  info: AlgorithmInfo;           // explanation, complexity, signals, pitfalls, problems
}

interface Step<S> {
  line: string;            // semantic line marker, e.g. "relax-edge" (see below)
  state: S;                // full frozen snapshot for the renderer
  vars: Record<string, unknown>;   // shown in the watch panel
  callStack?: Frame[];     // for recursion
  aux?: AuxStructures;     // queue/stack/heap/hashmap/visited-set contents
  highlights: Highlight[]; // which cells/nodes/edges to colour and why
  message: string;         // plain-English narration: "Pop (3,4) from the queue; it has 2 unvisited neighbours"
}
```

**Line markers (multi-language sync):** the code strings contain marker comments such as `# @mark relax-edge` / `// @mark relax-edge`. The engine strips them for display and maps each marker to a line number per language. A step's `line: "relax-edge"` therefore highlights the correct line whichever language tab is open. Write a unit test that every marker used in `generate` exists in every language's code.

**Player:** precompute the whole trace (cap at ~10,000 steps; if exceeded, warn and suggest a smaller input). Controls: play / pause / step forward / step back / jump to start / jump to end / scrubber timeline / speed (0.25×–8×). Keyboard: `Space` play/pause, `←/→` step, `Home/End`, `+/-` speed.

**Renderers (build once, reuse everywhere):**

| Renderer | Used by |
|---|---|
| `ArrayBars` / `ArrayCells` (with pointer arrows i, j, lo, hi, mid, window brackets) | sorting, searching, two pointers, sliding window, prefix sums |
| `Grid` (from my existing code; walls, weights, start/end, draw-with-mouse) | grid BFS/DFS, islands, flood fill, A*, path DP |
| `Graph` (nodes/edges, directed/undirected, weights, drag nodes, click to add) | all graph algorithms |
| `Tree` (binary + n-ary, auto layout, also shows array form for heaps) | trees, BST, heaps, segment tree, trie, recursion trees |
| `LinkedList` (nodes + pointer arrows that visibly re-wire) | linked list section, LRU |
| `Table2D` (DP table with cell dependency arrows to the cells it was computed from) | all DP |
| `StackQueue` (vertical stack, horizontal queue/deque) | stacks, queues, monotonic structures |
| `HashTable` (buckets, collisions, chaining / probing) | hashing section, counters |
| `Bits` (binary rows with per-bit ops) | bit manipulation |
| `StringMatch` (text + sliding pattern, prefix-function table) | string algorithms |
| `Intervals` (horizontal timeline bars + sweep line) | intervals, scheduling, sweep line |
| `Plane2D` (points, lines, polygons) | geometry |
| `DecisionTree` (choose / un-choose branches, pruned branches greyed) | backtracking |

Every renderer must also render the `aux` structures (queue, stack, heap, visited set, distance table, hashmap) in a side panel.

---

## 3. UI / UX Requirements

- **Top-level tabs** = categories (Section 4). Inside a tab, a left sidebar lists subcategories → algorithms. `Ctrl/Cmd+K` command palette searches all algorithms and LeetCode problem names.
- **Algorithm page layout (desktop):** simulation (large, center) · code panel (right, with language tabs and current line highlighted) · watch/call-stack/aux panel · step narration bar under the simulation · info tabs below: *Explanation*, *Complexity*, *When to use*, *Pitfalls*, *Template*, *Practice problems*.
- **Code popup:** a button detaches the code panel into a floating draggable/resizable window (stays in sync, remembers position).
- **Input editor:** per-algorithm form generated from `inputSchema` — edit array text, draw on grid, click to build graph/tree, paste JSON, "Random", and presets. Validate and show friendly errors.
- **Compare mode** (sorting, shortest paths, search): run 2–4 algorithms side by side on the same input with a counter of comparisons/swaps/nodes visited.
- **Complexity counters** live during playback: comparisons, swaps, array accesses, nodes expanded, cells filled.
- **"Predict the next step" quiz mode** (optional toggle): pause before key decisions and ask the user what happens next.
- **Progress:** mark algorithms as "learned / review later" (localStorage), show progress per tab.
- **Legend** for every colour used (current, visited, in queue, final path, pruned, sorted…). Use colour + shape/pattern so it works for colour-blind users.
- Dark/light theme, responsive (on mobile: simulation on top, code/info as bottom sheets), respects `prefers-reduced-motion`.
- **Do not copy LeetCode problem statements.** For practice problems store only the problem number, title, difficulty, a link, and a one-line note in my own words about which pattern it uses.

---

## 4. Content Map — Tabs → Subcategories → Algorithms

Each bullet = one algorithm page (unless marked *note*). In brackets = example practice problems to list on that page.

### Tab 1 — Fundamentals
- **Big-O:** interactive growth-curve chart (O(1)…O(n!)) with an n slider and "operations at n" table; amortized analysis demo (dynamic array doubling).
- **Recursion:** call-stack visualizer + recursion tree (factorial, Fibonacci, power); show stack overflow on deep input; tail recursion *note*.
- **Memory model:** value vs reference, array vs linked memory layout *(simple diagram page)*.

### Tab 2 — Arrays & Hashing
- **Hash table internals:** hash function → bucket, collisions with chaining vs open addressing (linear probing), resize/rehash.
- **Frequency counting / hash set lookups** [Contains Duplicate, Valid Anagram, Two Sum, Group Anagrams, Top K Frequent].
- **Prefix sum** (1D and 2D) + **difference array** [Range Sum Query, Subarray Sum Equals K, Product of Array Except Self].
- **Kadane's algorithm** [Maximum Subarray, Maximum Product Subarray].
- **Boyer–Moore majority vote** [Majority Element].
- **Dutch National Flag** (3-way partition) [Sort Colors].
- **Cyclic sort** [Missing Number, Find All Duplicates, First Missing Positive].
- **Matrix traversal:** spiral, rotate 90°, transpose, set-matrix-zeroes [Spiral Matrix, Rotate Image].
- **Longest consecutive sequence with a set** [Longest Consecutive Sequence].

### Tab 3 — Two Pointers & Sliding Window
- **Opposite-ends two pointers** [Valid Palindrome, Two Sum II, 3Sum, Container With Most Water, Trapping Rain Water].
- **Same-direction (read/write) pointers** [Remove Duplicates, Move Zeroes].
- **Fast & slow pointers** (also linked in Tab 6) [Happy Number, Find the Duplicate Number].
- **Fixed-size sliding window** [Max sum of size k, Find All Anagrams].
- **Variable sliding window** (expand right, shrink left) [Longest Substring Without Repeating Characters, Longest Repeating Character Replacement, Minimum Window Substring, Permutation in String].
- **Sliding window maximum with monotonic deque** [Sliding Window Maximum].

### Tab 4 — Searching
- **Linear search** (baseline).
- **Binary search — classic**, **lower bound / upper bound** (first/last occurrence) — show the invariant and the `lo/hi/mid` arrows; highlight off-by-one pitfalls (`lo<=hi` vs `lo<hi`).
- **Binary search in rotated sorted array** [Search in Rotated Sorted Array, Find Minimum in Rotated Sorted Array].
- **Binary search on the answer space** — show a monotonic feasibility function as a bar of ✗✗✗✓✓✓ [Koko Eating Bananas, Capacity to Ship Packages, Split Array Largest Sum].
- **2D matrix search** (flattened + staircase) [Search a 2D Matrix I & II].
- **Median of two sorted arrays** (partition binary search) — advanced.

### Tab 5 — Sorting
- Bubble, Selection, Insertion (with "nearly sorted" preset), Shell.
- **Merge sort** (show recursion tree + merge buffer).
- **Quick sort** (Lomuto and Hoare partitions; pivot strategies; worst-case preset).
- **Heap sort** (tree + array dual view).
- **Counting sort, Radix sort (LSD), Bucket sort** (non-comparison).
- **Quickselect** [Kth Largest Element].
- *Note pages:* stability demo (sort records with equal keys), which built-in sort languages use (Timsort / introsort) — verify current facts before writing.
- Sorting **race/compare mode** + complexity table.

### Tab 6 — Linked Lists
- Traversal, insert, delete; singly vs doubly.
- **Reverse** (iterative with prev/curr/next arrows, and recursive) [Reverse Linked List, Reverse Nodes in k-Group, Palindrome Linked List].
- **Merge two sorted lists**, **merge k sorted lists** (heap) [Merge Two Sorted Lists, Merge k Sorted Lists].
- **Floyd cycle detection + finding cycle start** [Linked List Cycle I & II].
- **Middle node, remove n-th from end (gap pointers), reorder list** [Middle of the Linked List, Remove Nth Node From End, Reorder List].
- **Copy list with random pointer** (hashmap and interleaving).
- **Add two numbers**.

### Tab 7 — Stacks & Queues
- Stack, queue, deque, circular buffer operations.
- **Balanced parentheses** [Valid Parentheses], **Min stack**, **Evaluate RPN**, **Generate parentheses** (cross-link to backtracking).
- **Monotonic stack** — next greater/smaller element [Daily Temperatures, Next Greater Element, Largest Rectangle in Histogram, Car Fleet].
- **Monotonic queue** (cross-link to sliding window max).
- **Queue using stacks / stack using queues.**
- **Shunting-yard / basic calculator** — intermediate.

### Tab 8 — Heaps / Priority Queues
- **Binary heap:** insert (sift up), extract (sift down), build-heap in O(n) — tree view and array view in sync.
- **Top-K pattern** [Kth Largest in a Stream, K Closest Points, Top K Frequent].
- **Two heaps** [Find Median from Data Stream, Sliding Window Median].
- **K-way merge** [Merge k Sorted Lists, Kth Smallest in Sorted Matrix].
- **Scheduling with heap** [Task Scheduler, Meeting Rooms II].

### Tab 9 — Trees
- **Traversals:** preorder, inorder, postorder (recursive with call stack, iterative with explicit stack), level-order BFS, zigzag, Morris inorder (advanced). [Binary Tree Level Order, Right Side View, Inorder Traversal]
- **Tree recursion / post-order DP:** max depth, diameter, balanced check, max path sum [Maximum Depth, Diameter, Balanced Binary Tree, Binary Tree Maximum Path Sum].
- **Path problems:** path sum, root-to-leaf paths, good nodes.
- **BST:** search, insert, delete (3 cases), validate, kth smallest, inorder successor [Validate BST, Kth Smallest in BST, LCA of BST].
- **Lowest Common Ancestor** (binary tree).
- **Construct tree** from preorder + inorder; **serialize / deserialize**.
- **Self-balancing:** AVL rotations (LL, RR, LR, RL); red-black tree insert — advanced.
- **Trie:** insert, search, prefix search, delete [Implement Trie, Design Add and Search Words, Word Search II].
- **Segment tree** (build, range query, point update, lazy propagation — advanced) and **Fenwick / BIT** [Range Sum Query – Mutable, Count of Smaller Numbers After Self].

### Tab 10 — Graphs
- **Representations:** toggle the same graph between adjacency list, adjacency matrix and edge list.
- **Traversal:** BFS and DFS on graphs **and** grids (my existing demos go here); recursive vs iterative DFS.
- **Grid patterns:** connected components / number of islands, flood fill, multi-source BFS [Number of Islands, Max Area of Island, Rotting Oranges, Walls and Gates, Pacific Atlantic Water Flow, Surrounded Regions].
- **Cycle detection:** undirected (DFS with parent / union-find), directed (white-grey-black colouring).
- **Topological sort:** Kahn's (in-degree queue) and DFS post-order [Course Schedule I & II, Alien Dictionary].
- **Bipartite check** (2-colouring) [Is Graph Bipartite].
- **Union-Find / DSU:** show the forest, path compression and union by rank visually [Number of Connected Components, Redundant Connection, Accounts Merge].
- **Shortest paths:** BFS (unweighted), 0-1 BFS, **Dijkstra** (with min-heap panel and distance table), **Bellman-Ford** (negative edges, negative-cycle detection), **Floyd-Warshall** (matrix animation), **A\*** on grid (heuristic visualized) [Network Delay Time, Cheapest Flights Within K Stops, Path With Minimum Effort, Shortest Path in Binary Matrix].
- **Minimum spanning tree:** Kruskal (sorted edges + DSU), Prim (heap) [Min Cost to Connect All Points].
- **Advanced:** Tarjan / Kosaraju SCC, bridges & articulation points [Critical Connections], Eulerian path – Hierholzer [Reconstruct Itinerary], max flow – Edmonds-Karp, clone graph, word ladder (BFS on implicit graph).

### Tab 11 — Backtracking
Show **two synchronized views**: the decision tree (choose → explore → un-choose, pruned branches greyed out) and the concrete state (array/board).
- Subsets (with and without duplicates), Permutations, Combinations, Combination Sum I/II.
- N-Queens (board + conflicts highlighted), Sudoku solver.
- Word Search on grid, Palindrome Partitioning, Letter Combinations of a Phone Number, Generate Parentheses.
- *Note page:* the universal backtracking template.

### Tab 12 — Dynamic Programming
Lead with one **"From recursion to DP"** page on Fibonacci / Climbing Stairs showing the same problem 4 ways: brute-force recursion tree (repeated subtrees highlighted) → memoization (cache hits flash) → tabulation table → O(1) space rolling variables.
- **1D DP:** House Robber I/II, Coin Change, Decode Ways, Word Break, Min Cost Climbing Stairs.
- **LIS:** O(n²) table and O(n log n) patience sorting with binary search.
- **2D grid DP:** Unique Paths, Minimum Path Sum.
- **String DP:** LCS, Edit Distance (show the alignment at the end), Longest Palindromic Substring (expand-around-center vs DP table), Distinct Subsequences.
- **Knapsack:** 0/1 (with backwards-iteration 1D optimization explained), unbounded, partition equal subset sum, target sum.
- **Interval DP:** Burst Balloons, Matrix Chain Multiplication.
- **State-machine DP:** Best Time to Buy/Sell Stock (all variants, cooldown, fee) — show states as a small automaton.
- **DP on trees:** House Robber III.
- **Bitmask DP:** small TSP — advanced.
- Every DP page: show the recurrence formula, the table, arrows from each cell to the cells it depends on, and the path reconstruction at the end.

### Tab 13 — Greedy & Intervals
- **Interval patterns** with timeline view: merge intervals, insert interval, non-overlapping intervals, meeting rooms I/II (sweep line + heap), minimum arrows to burst balloons.
- **Greedy classics:** Jump Game I/II, Gas Station, Partition Labels, Hand of Straights, activity selection.
- **Huffman coding** (build tree from frequencies, then encode a string).
- *Note page:* "greedy vs DP" — a counter-example where greedy fails (coin change with coins [1,3,4], amount 6).

### Tab 14 — Strings
- **Pattern matching:** naive, **KMP** (build LPS table, then match), **Rabin-Karp** (rolling hash with live hash value), **Z-algorithm**.
- **Palindromes:** expand around center, **Manacher's** (advanced).
- **Anagram / frequency windows** (cross-link to sliding window).
- **String encoding/decoding** [Encode and Decode Strings].

### Tab 15 — Bit Manipulation
- Binary playground: type numbers, see AND / OR / XOR / NOT / shifts bit by bit, two's complement for negatives.
- Tricks: `x & (x-1)` (Brian Kernighan count bits), `x & -x` (lowest set bit), power of two check, swap with XOR.
- [Single Number (XOR cancel), Number of 1 Bits, Counting Bits, Reverse Bits, Missing Number, Sum of Two Integers], subsets via bitmask enumeration.

### Tab 16 — Math & Geometry
- Euclidean GCD / LCM, Sieve of Eratosthenes, fast exponentiation (binary exponentiation), modular arithmetic *note*.
- Fisher–Yates shuffle, reservoir sampling (with a distribution histogram proving uniformity).
- Geometry: convex hull (Graham scan / monotone chain), line intersection, point in polygon — intermediate.
- Matrix: rotate, spiral (cross-link), [Pow(x, n), Multiply Strings, Detect Squares].

### Tab 17 — Data-Structure Design (interview "design" questions)
- **LRU Cache** (hashmap + doubly linked list animated together), **LFU Cache**.
- Hash map from scratch (cross-link), Min Stack, Iterator patterns, Time-Based Key-Value Store (binary search).
- **Bloom filter** (bit array + k hashes, show false positive), **Skip list** (search path through levels) — advanced.
- **Beyond LeetCode (optional, Phase 5):** token-bucket rate limiter, consistent hashing ring, producer–consumer queue.

### Tab 18 — Pattern Cheat Sheet (no simulation)
A searchable table: **problem signal → pattern → link to page**. Examples: "sorted array + find pair" → two pointers; "contiguous subarray/substring with constraint" → sliding window; "next greater/smaller" → monotonic stack; "k largest/smallest" → heap; "dependencies / ordering" → topological sort; "connectivity / grouping" → union-find; "all combinations / permutations" → backtracking; "min/max ways with overlapping subproblems" → DP; "shortest path, unweighted" → BFS; "weighted, non-negative" → Dijkstra; "minimize the max / maximize the min" → binary search on answer. Plus a Big-O cheat table for all data structure operations and sorting algorithms.

---

## 5. Content Standard per Algorithm Page ("Definition of Done")

- [ ] `generate()` produces a correct trace; final state equals `reference(input)` for 200 random inputs (Vitest property test).
- [ ] Code in **Python and JavaScript** (Java/C++ optional later), idiomatic and interview-style, with markers mapped in every language.
- [ ] Every step has a clear `message` in plain English (no "step 37").
- [ ] At least 3 presets: a typical example, an edge case (empty / single element / disconnected / duplicates), and a worst case.
- [ ] Explanation: 3–6 sentences of intuition, the key invariant, time & space complexity (best/avg/worst where relevant), "use it when you see…" signals, 2–4 pitfalls, a minimal reusable template, 3–8 practice problems with links.
- [ ] Works with keyboard only, has a colour legend, renders on mobile.
- [ ] Deep link restores algorithm + input.

---

## 6. Build Phases (do them in order; show me a working site after each)

1. **Phase 0 — Port & engine:** inspect my repo, set up the stack, build the step engine, player controls, code panel with markers + popup, watch panel, `Grid` renderer. Port my DFS and BFS into it. Ship.
2. **Phase 1 — Core renderers & high-frequency topics:** `ArrayCells/Bars`, `StackQueue`, `HashTable`, `LinkedList`, `Tree`. Fill Tabs 2, 3, 4, 5, 6, 7.
3. **Phase 2 — Trees, heaps, graphs:** `Graph` renderer + graph builder. Tabs 8, 9, 10 (core items first, advanced last).
4. **Phase 3 — Backtracking & DP:** `DecisionTree`, `Table2D`. Tabs 11, 12.
5. **Phase 4 — The rest:** Tabs 1, 13, 14, 15, 16, 17, 18, compare mode, quiz mode, progress tracking, command palette.
6. **Phase 5 — Polish:** advanced items, performance on large inputs, accessibility audit, Playwright smoke test of every route, README with "how to add a new algorithm in 1 file".

Keep a `ROADMAP.md` checklist of every page from Section 4 and tick them off as you go.

---

## 7. Engineering Rules

- One algorithm = one folder: `src/algorithms/<category>/<id>/{index.ts, code.py.txt, code.js.txt, info.md}`; a central registry auto-collects them (`import.meta.glob`).
- Snapshots must be immutable (structural sharing or `structuredClone`); never mutate a previous step.
- Renderers are pure functions of `(state, highlights)`; no algorithm logic in components.
- Lazy-load each tab's algorithms so the initial bundle stays small.
- No external API calls; no tracking.
- When unsure about a factual detail (e.g., which sort a language's standard library uses today), check documentation rather than guessing, and keep such claims in `info.md` short.
- Ask me before deleting or rewriting anything from my original project that isn't clearly superseded.
