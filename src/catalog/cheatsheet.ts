/**
 * Data for the Pattern Cheat Sheet (src/pages/CheatSheet.tsx).
 * Page links are page ids; cheatsheet.test.ts checks that every id exists.
 */

export interface Signal {
  /** What the problem statement looks like. */
  signal: string;
  pattern: string;
  /** Short reason or hint. */
  hint: string;
  pages: string[];
  group: string;
}

export const SIGNALS: Signal[] = [
  // Arrays & hashing
  { group: "Arrays & hashing", signal: "Find a pair / complement in an unsorted array", pattern: "Hash map of seen values", hint: "Look up target − x in O(1) while scanning once.", pages: ["two-sum-hash"] },
  { group: "Arrays & hashing", signal: "Anagrams, duplicates, \"how many times\"", pattern: "Frequency counting", hint: "Count with a map or a 26-slot array, then compare counts.", pages: ["frequency-count", "find-anagrams"] },
  { group: "Arrays & hashing", signal: "Many range-sum queries on a static array", pattern: "Prefix sums", hint: "sum(l..r) = P[r+1] − P[l]; 2D works the same with inclusion–exclusion.", pages: ["prefix-sum", "prefix-sum-2d"] },
  { group: "Arrays & hashing", signal: "Count subarrays with sum (or xor) equal to k", pattern: "Prefix sum + hash map", hint: "Count earlier prefixes equal to current − k.", pages: ["subarray-sum-k"] },
  { group: "Arrays & hashing", signal: "Many range updates, read everything once at the end", pattern: "Difference array", hint: "+v at l, −v at r+1, then one prefix sum.", pages: ["difference-array"] },
  { group: "Arrays & hashing", signal: "Maximum sum contiguous subarray", pattern: "Kadane", hint: "Best sum ending here = max(x, best ending before + x).", pages: ["kadane"] },
  { group: "Arrays & hashing", signal: "Element appearing more than n/2 times, O(1) space", pattern: "Boyer–Moore vote", hint: "Cancel pairs of different values; the majority survives.", pages: ["boyer-moore"] },
  { group: "Arrays & hashing", signal: "Values in 1..n, find the missing / duplicate one in place", pattern: "Cyclic sort", hint: "Swap each value to index value − 1.", pages: ["cyclic-sort"] },
  { group: "Arrays & hashing", signal: "Sort 0s, 1s and 2s in one pass", pattern: "Dutch national flag (3-way partition)", hint: "Three regions: < pivot, = pivot, > pivot.", pages: ["dutch-flag"] },
  { group: "Arrays & hashing", signal: "Longest run of consecutive values, unsorted, O(n)", pattern: "Hash set, start only at run beginnings", hint: "x is a start when x − 1 is missing.", pages: ["longest-consecutive"] },

  // Two pointers & windows
  { group: "Two pointers & windows", signal: "Sorted array + find a pair / triplet with a sum", pattern: "Two pointers from both ends", hint: "Too small → move left; too big → move right.", pages: ["two-sum-sorted", "three-sum"] },
  { group: "Two pointers & windows", signal: "Palindrome check, reverse in place", pattern: "Two pointers from both ends", hint: "Compare and move inwards.", pages: ["valid-palindrome"] },
  { group: "Two pointers & windows", signal: "Maximise area / water between bars", pattern: "Two pointers, move the shorter side", hint: "The shorter bar limits every wider pair with it.", pages: ["container-water", "trapping-rain"] },
  { group: "Two pointers & windows", signal: "Remove / compact elements in place", pattern: "Read / write pointers", hint: "Write pointer marks the end of the kept prefix.", pages: ["remove-duplicates", "move-zeroes"] },
  { group: "Two pointers & windows", signal: "Contiguous subarray / substring of fixed size k", pattern: "Fixed sliding window", hint: "Add the entering element, remove the leaving one.", pages: ["fixed-window", "find-anagrams"] },
  { group: "Two pointers & windows", signal: "Longest / shortest substring satisfying a constraint", pattern: "Variable sliding window", hint: "Expand right; shrink left while the window is invalid (or valid, for shortest).", pages: ["longest-unique-substring", "char-replacement", "min-window-substring"] },
  { group: "Two pointers & windows", signal: "Max / min of every window of size k", pattern: "Monotonic deque", hint: "Deque of indexes with decreasing values; front is the max.", pages: ["sliding-window-max"] },
  { group: "Two pointers & windows", signal: "Cycle in a sequence / linked list, O(1) space", pattern: "Fast & slow pointers (Floyd)", hint: "Meet inside the cycle; restart one pointer to find the entry.", pages: ["list-cycle", "find-duplicate", "happy-number"] },

  // Searching
  { group: "Searching", signal: "Sorted array, find a value or insertion point", pattern: "Binary search / lower & upper bound", hint: "Keep an invariant on [lo, hi); stop when they meet.", pages: ["binary-search", "bounds"] },
  { group: "Searching", signal: "Sorted but rotated array", pattern: "Binary search on the sorted half", hint: "One half of [lo, hi] is always sorted — check if the target is in it.", pages: ["rotated-search", "rotated-min"] },
  { group: "Searching", signal: "\"Minimum speed / capacity such that…\", minimise the max, maximise the min", pattern: "Binary search on the answer", hint: "The feasibility check is monotonic in the answer.", pages: ["koko-bananas"] },
  { group: "Searching", signal: "Matrix sorted by rows and columns", pattern: "Staircase search / flattened binary search", hint: "Start at the top-right corner; each step drops a row or a column.", pages: ["staircase-search", "matrix-search"] },
  { group: "Searching", signal: "k-th smallest / largest, no full order needed", pattern: "Quickselect or a size-k heap", hint: "O(n) average with quickselect; O(n log k) with a heap.", pages: ["quickselect", "top-k"] },

  // Linked lists
  { group: "Linked lists", signal: "Reverse all or part of a list", pattern: "prev / curr / next pointer re-wiring", hint: "Save next before you overwrite curr.next.", pages: ["reverse-list", "reverse-k-group"] },
  { group: "Linked lists", signal: "Middle node, n-th from the end", pattern: "Two pointers with a gap or speed difference", hint: "Fast moves 2 (middle) or starts n ahead (n-th from end).", pages: ["middle-node", "remove-nth-end"] },
  { group: "Linked lists", signal: "Merge sorted lists", pattern: "Dummy head + two pointers; heap for k lists", hint: "Always append the smaller head.", pages: ["merge-two-lists", "merge-k-lists"] },
  { group: "Linked lists", signal: "Deep copy with extra pointers", pattern: "Old → new hash map (or interleaving)", hint: "Create nodes first, wire pointers second.", pages: ["copy-random-list"] },

  // Stacks & queues
  { group: "Stacks & queues", signal: "Matching brackets, nested structure, undo", pattern: "Stack", hint: "Push openers, pop and check on closers.", pages: ["valid-parentheses", "eval-rpn", "basic-calculator"] },
  { group: "Stacks & queues", signal: "Next greater / smaller element, span, days until warmer", pattern: "Monotonic stack", hint: "Pop while the new value beats the top: the new value is their answer.", pages: ["monotonic-stack", "largest-rectangle", "car-fleet"] },
  { group: "Stacks & queues", signal: "Get min / max in O(1) alongside push / pop", pattern: "Stack of (value, running min)", hint: "Each entry remembers the min below it.", pages: ["min-stack"] },

  // Heaps
  { group: "Heaps", signal: "Top k / k largest / k closest", pattern: "Heap of size k", hint: "Min-heap of size k for the k largest; pop when it grows past k.", pages: ["top-k"] },
  { group: "Heaps", signal: "Running median, balance two halves", pattern: "Two heaps", hint: "Max-heap for the lower half, min-heap for the upper half.", pages: ["two-heaps-median"] },
  { group: "Heaps", signal: "Merge k sorted streams", pattern: "K-way merge with a heap", hint: "Heap holds one head per stream.", pages: ["k-way-merge", "merge-k-lists"] },
  { group: "Heaps", signal: "Rooms / machines needed for overlapping intervals", pattern: "Sort by start + min-heap of end times", hint: "Reuse a room when its earliest end ≤ the new start.", pages: ["heap-scheduling"] },

  // Trees
  { group: "Trees", signal: "Answer depends on both subtrees (height, diameter, path sum)", pattern: "Post-order recursion returning a value", hint: "Return what the parent needs; update a global answer on the way.", pages: ["max-depth", "diameter", "max-path-sum", "balanced-tree"] },
  { group: "Trees", signal: "Level by level, nearest to the root, right side view", pattern: "BFS with a queue", hint: "Process the queue one level-size at a time.", pages: ["level-order"] },
  { group: "Trees", signal: "BST: sorted order, k-th smallest, validate", pattern: "In-order traversal / bounds", hint: "In-order of a BST is sorted; pass (low, high) bounds down.", pages: ["kth-smallest-bst", "validate-bst", "inorder-successor"] },
  { group: "Trees", signal: "Prefix lookups, autocomplete, word dictionary", pattern: "Trie", hint: "One node per prefix; mark word ends.", pages: ["trie"] },
  { group: "Trees", signal: "Range sum / min with point updates", pattern: "Segment tree or Fenwick tree", hint: "O(log n) query and update.", pages: ["segment-tree", "fenwick-tree"] },

  // Graphs
  { group: "Graphs", signal: "Shortest path, unweighted (or grid with equal steps)", pattern: "BFS", hint: "The first time you reach a node is the shortest.", pages: ["bfs-graph", "bfs-grid"] },
  { group: "Graphs", signal: "Several sources spreading at once (rot, fire, distance to nearest)", pattern: "Multi-source BFS", hint: "Put every source in the queue at distance 0.", pages: ["rotting-oranges"] },
  { group: "Graphs", signal: "Weights 0 or 1 only", pattern: "0-1 BFS with a deque", hint: "Weight-0 edges go to the front, weight-1 to the back.", pages: ["zero-one-bfs"] },
  { group: "Graphs", signal: "Shortest path, non-negative weights", pattern: "Dijkstra", hint: "Min-heap of (distance, node); skip stale entries.", pages: ["dijkstra"] },
  { group: "Graphs", signal: "Negative weights, or at most k edges", pattern: "Bellman–Ford", hint: "Relax every edge n − 1 times (or k times).", pages: ["bellman-ford"] },
  { group: "Graphs", signal: "All-pairs distances on a small graph", pattern: "Floyd–Warshall", hint: "Try every node k as a stop-over.", pages: ["floyd-warshall"] },
  { group: "Graphs", signal: "Count islands / regions / connected components", pattern: "DFS / BFS flood fill or union-find", hint: "Each unvisited start found is a new component.", pages: ["number-of-islands", "flood-fill", "union-find"] },
  { group: "Graphs", signal: "Dependencies, prerequisites, build order", pattern: "Topological sort", hint: "Kahn: repeatedly take in-degree-0 nodes; leftovers mean a cycle.", pages: ["topo-sort-kahn", "topo-sort-dfs"] },
  { group: "Graphs", signal: "Connectivity / grouping with merges, redundant edge", pattern: "Union-Find", hint: "Path compression + union by rank ≈ O(1) per operation.", pages: ["union-find"] },
  { group: "Graphs", signal: "Detect a cycle", pattern: "DFS colours (directed) / parent check or union-find (undirected)", hint: "A grey node reached again means a back edge.", pages: ["cycle-detection"] },
  { group: "Graphs", signal: "Split into two groups with no edge inside a group", pattern: "Bipartite colouring", hint: "BFS/DFS alternating colours; a clash means odd cycle.", pages: ["bipartite"] },
  { group: "Graphs", signal: "Connect all points at minimum total cost", pattern: "Minimum spanning tree", hint: "Kruskal (sort edges + union-find) or Prim (heap).", pages: ["kruskal", "prim"] },
  { group: "Graphs", signal: "Shortest path on a grid with a good distance estimate", pattern: "A*", hint: "Dijkstra ordered by g + h with an admissible h.", pages: ["a-star"] },
  { group: "Graphs", signal: "Region touching the border / reaching both oceans", pattern: "Reverse search from the border", hint: "Start from the edges instead of from every cell.", pages: ["surrounded-regions", "pacific-atlantic"] },

  // Backtracking
  { group: "Backtracking", signal: "All subsets / combinations / permutations", pattern: "Backtracking", hint: "Choose, explore, un-choose; start index or used[].", pages: ["backtracking-template", "subsets", "permutations", "combinations"] },
  { group: "Backtracking", signal: "Place items with constraints (queens, sudoku)", pattern: "Backtracking with pruning", hint: "Check constraints in O(1) with sets before recursing.", pages: ["n-queens", "sudoku"] },
  { group: "Backtracking", signal: "Find a word / path in a grid without reusing cells", pattern: "Grid DFS with backtracking", hint: "Mark the cell on entry, unmark on exit.", pages: ["word-search"] },
  { group: "Backtracking", signal: "Split a string in all valid ways", pattern: "Backtracking over cut positions", hint: "Each valid prefix is a choice.", pages: ["palindrome-partitioning", "word-break"] },

  // DP
  { group: "Dynamic programming", signal: "Count ways / min cost, answer built from smaller n", pattern: "1D DP", hint: "Define dp[i]; find which earlier cells it depends on.", pages: ["climbing-stairs", "house-robber", "coin-change"] },
  { group: "Dynamic programming", signal: "Grid paths moving right / down", pattern: "2D grid DP", hint: "dp[r][c] from the top and left neighbours.", pages: ["unique-paths", "min-path-sum"] },
  { group: "Dynamic programming", signal: "Two strings: common subsequence, edit operations", pattern: "2D string DP", hint: "dp[i][j] over prefixes; match → diagonal.", pages: ["lcs", "edit-distance"] },
  { group: "Dynamic programming", signal: "Longest increasing subsequence", pattern: "DP O(n²) or patience sorting O(n log n)", hint: "tails[k] = smallest end of an increasing run of length k + 1.", pages: ["lis"] },
  { group: "Dynamic programming", signal: "Pick items under a capacity (each once)", pattern: "0/1 knapsack", hint: "Loop capacity downwards for the 1D version.", pages: ["knapsack"] },
  { group: "Dynamic programming", signal: "Can the string be split into dictionary words", pattern: "DP over prefixes", hint: "dp[i] = some dp[j] true and s[j:i] in the dictionary.", pages: ["word-break"] },
  { group: "Dynamic programming", signal: "Local choice looks right but you can't prove it", pattern: "Greedy vs DP check", hint: "Brute-force small inputs to find a counter-example.", pages: ["greedy-vs-dp"] },
];

export interface ComplexityRow {
  name: string;
  cells: string[];
  page?: string;
}

export interface ComplexityTable {
  title: string;
  columns: string[];
  rows: ComplexityRow[];
  note?: string;
}

export const COMPLEXITY: ComplexityTable[] = [
  {
    title: "Data structure operations",
    columns: ["Access", "Search", "Insert", "Delete", "Space"],
    note: "Average case; worst case in brackets where it differs. * amortized.",
    rows: [
      { name: "Dynamic array", cells: ["O(1)", "O(n)", "O(1)* end, O(n) middle", "O(1) end, O(n) middle", "O(n)"] },
      { name: "Linked list", cells: ["O(n)", "O(n)", "O(1) at a known node", "O(1) at a known node", "O(n)"], page: "list-basics" },
      { name: "Stack / queue / deque", cells: ["top / ends O(1)", "O(n)", "O(1)", "O(1)", "O(n)"], page: "stack-queue-ops" },
      { name: "Hash table", cells: ["—", "O(1) (O(n))", "O(1)* (O(n))", "O(1) (O(n))", "O(n)"], page: "hash-table" },
      { name: "Binary heap", cells: ["min / max O(1)", "O(n)", "O(log n)", "pop O(log n)", "O(n)"], page: "binary-heap" },
      { name: "Binary search tree", cells: ["O(log n) (O(n))", "O(log n) (O(n))", "O(log n) (O(n))", "O(log n) (O(n))", "O(n)"], page: "bst-search-insert" },
      { name: "AVL / red-black tree", cells: ["O(log n)", "O(log n)", "O(log n)", "O(log n)", "O(n)"], page: "avl-insert" },
      { name: "Trie (key length L)", cells: ["—", "O(L)", "O(L)", "O(L)", "O(total chars)"], page: "trie" },
      { name: "Union-Find", cells: ["—", "find ≈ O(α(n))", "union ≈ O(α(n))", "—", "O(n)"], page: "union-find" },
      { name: "Segment / Fenwick tree", cells: ["—", "range query O(log n)", "point update O(log n)", "—", "O(n)"], page: "segment-tree" },
    ],
  },
  {
    title: "Sorting",
    columns: ["Best", "Average", "Worst", "Space", "Stable"],
    rows: [
      { name: "Bubble", cells: ["O(n)", "O(n²)", "O(n²)", "O(1)", "yes"], page: "bubble-sort" },
      { name: "Selection", cells: ["O(n²)", "O(n²)", "O(n²)", "O(1)", "no"], page: "selection-sort" },
      { name: "Insertion", cells: ["O(n)", "O(n²)", "O(n²)", "O(1)", "yes"], page: "insertion-sort" },
      { name: "Shell", cells: ["O(n log n)", "depends on gaps", "O(n²) (Shell's gaps)", "O(1)", "no"], page: "shell-sort" },
      { name: "Merge", cells: ["O(n log n)", "O(n log n)", "O(n log n)", "O(n)", "yes"], page: "merge-sort" },
      { name: "Quick", cells: ["O(n log n)", "O(n log n)", "O(n²)", "O(log n)", "no"], page: "quick-sort-lomuto" },
      { name: "Heap", cells: ["O(n log n)", "O(n log n)", "O(n log n)", "O(1)", "no"], page: "heap-sort" },
      { name: "Counting (range k)", cells: ["O(n + k)", "O(n + k)", "O(n + k)", "O(n + k)", "yes"], page: "counting-sort" },
      { name: "Radix (d digits, base b)", cells: ["O(d(n + b))", "O(d(n + b))", "O(d(n + b))", "O(n + b)", "yes"], page: "radix-sort" },
      { name: "Bucket", cells: ["O(n + k)", "O(n + k)", "O(n²)", "O(n + k)", "yes*"], page: "bucket-sort" },
      { name: "Timsort (Python, Java objects, V8)", cells: ["O(n)", "O(n log n)", "O(n log n)", "O(n)", "yes"], page: "built-in-sorts" },
    ],
    note: "* bucket sort is stable when each bucket is sorted with a stable sort.",
  },
  {
    title: "Searching & selection",
    columns: ["Time", "Space", "Needs"],
    rows: [
      { name: "Linear search", cells: ["O(n)", "O(1)", "nothing"], page: "linear-search" },
      { name: "Binary search", cells: ["O(log n)", "O(1)", "sorted input"], page: "binary-search" },
      { name: "Binary search on the answer", cells: ["O(log range · check)", "O(1)", "monotonic check"], page: "koko-bananas" },
      { name: "Quickselect", cells: ["O(n) avg, O(n²) worst", "O(1)", "nothing"], page: "quickselect" },
      { name: "Heap top-k", cells: ["O(n log k)", "O(k)", "nothing"], page: "top-k" },
    ],
  },
  {
    title: "Graph algorithms (V nodes, E edges)",
    columns: ["Time", "Space", "Use for"],
    rows: [
      { name: "BFS / DFS", cells: ["O(V + E)", "O(V)", "reachability, unweighted shortest path"], page: "bfs-graph" },
      { name: "Topological sort", cells: ["O(V + E)", "O(V)", "DAG ordering, cycle check"], page: "topo-sort-kahn" },
      { name: "Dijkstra (binary heap)", cells: ["O((V + E) log V)", "O(V)", "non-negative weights"], page: "dijkstra" },
      { name: "0-1 BFS", cells: ["O(V + E)", "O(V)", "weights 0 / 1"], page: "zero-one-bfs" },
      { name: "Bellman–Ford", cells: ["O(V · E)", "O(V)", "negative weights, ≤ k edges"], page: "bellman-ford" },
      { name: "Floyd–Warshall", cells: ["O(V³)", "O(V²)", "all pairs, small V"], page: "floyd-warshall" },
      { name: "Kruskal", cells: ["O(E log E)", "O(V)", "MST, sparse graphs"], page: "kruskal" },
      { name: "Prim (lazy heap)", cells: ["O(E log E)", "O(E)", "MST, dense graphs"], page: "prim" },
      { name: "Union-Find (m operations)", cells: ["O(m · α(n))", "O(n)", "dynamic connectivity"], page: "union-find" },
    ],
  },
  {
    title: "Input size → target complexity (rule of thumb, ~10⁸ simple steps per second)",
    columns: ["Fits", "Typical techniques"],
    rows: [
      { name: "n ≤ 10–12", cells: ["O(n!)", "permutations, brute force"], page: "permutations" },
      { name: "n ≤ 20–25", cells: ["O(2ⁿ)", "subsets, bitmask DP, backtracking"], page: "subsets" },
      { name: "n ≤ 500", cells: ["O(n³)", "Floyd–Warshall, interval DP"], page: "floyd-warshall" },
      { name: "n ≤ 5 000", cells: ["O(n²)", "2D DP, all pairs"], page: "lcs" },
      { name: "n ≤ 10⁶", cells: ["O(n log n)", "sorting, heaps, binary search"], page: "merge-sort" },
      { name: "n ≤ 10⁸", cells: ["O(n)", "one pass, two pointers, hashing"], page: "two-sum-hash" },
      { name: "n huge (10¹⁸)", cells: ["O(log n) / O(1)", "binary search, math"], page: "binary-search" },
    ],
  },
];
