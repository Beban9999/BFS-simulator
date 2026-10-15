import type { CategoryId } from "../engine/types";

export interface Category {
  id: CategoryId;
  title: string;
  short: string;
  blurb: string;
  /** Subcategory display order. Subcategories not listed are appended alphabetically. */
  subcategories: string[];
}

export const CATEGORIES: Category[] = [
  {
    id: "fundamentals",
    title: "Fundamentals",
    short: "Basics",
    blurb: "Big-O, recursion and the memory model everything else builds on.",
    subcategories: ["Big-O", "Recursion", "Memory model"],
  },
  {
    id: "arrays-hashing",
    title: "Arrays & Hashing",
    short: "Arrays",
    blurb: "Hash maps, counting, prefix sums and in-place array tricks.",
    subcategories: ["Hashing", "Prefix sums", "Array scans", "In-place", "Matrix"],
  },
  {
    id: "two-pointers",
    title: "Two Pointers & Sliding Window",
    short: "Two Pointers",
    blurb: "Move two indexes cleverly to turn O(n²) scans into O(n).",
    subcategories: ["Opposite ends", "Read / write", "Fast & slow", "Fixed window", "Variable window", "Monotonic deque"],
  },
  {
    id: "searching",
    title: "Searching",
    short: "Search",
    blurb: "Linear scans and every flavour of binary search.",
    subcategories: ["Basics", "Binary search", "Rotated arrays", "Search on the answer", "2D search", "Advanced"],
  },
  {
    id: "sorting",
    title: "Sorting",
    short: "Sorting",
    blurb: "Comparison sorts, non-comparison sorts and selection.",
    subcategories: ["Simple sorts", "Divide & conquer", "Heap-based", "Non-comparison", "Selection", "In practice"],
  },
  {
    id: "linked-lists",
    title: "Linked Lists",
    short: "Lists",
    blurb: "Pointer re-wiring, fast & slow pointers and merging.",
    subcategories: ["Basics", "Reversal", "Fast & slow", "Merging", "Other"],
  },
  {
    id: "stacks-queues",
    title: "Stacks & Queues",
    short: "Stacks",
    blurb: "LIFO, FIFO and monotonic structures.",
    subcategories: ["Basics", "Stack problems", "Monotonic", "Design"],
  },
  {
    id: "heaps",
    title: "Heaps / Priority Queues",
    short: "Heaps",
    blurb: "Binary heaps, top-K, two heaps and k-way merge.",
    subcategories: ["Binary heap", "Patterns"],
  },
  {
    id: "trees",
    title: "Trees",
    short: "Trees",
    blurb: "Traversals, tree recursion, BSTs, tries and range trees.",
    subcategories: ["Traversals", "Tree recursion", "BST", "Construction", "Self-balancing", "Trie", "Range queries"],
  },
  {
    id: "graphs",
    title: "Graphs",
    short: "Graphs",
    blurb: "Traversal, grid patterns, shortest paths, MST and more.",
    subcategories: [
      "Traversal",
      "Grid patterns",
      "Representations",
      "Cycles & ordering",
      "Union-Find",
      "Shortest paths",
      "Spanning trees",
      "Advanced",
    ],
  },
  {
    id: "backtracking",
    title: "Backtracking",
    short: "Backtrack",
    blurb: "Choose, explore, un-choose — with pruning.",
    subcategories: ["Template", "Subsets & permutations", "Boards", "Strings"],
  },
  {
    id: "dp",
    title: "Dynamic Programming",
    short: "DP",
    blurb: "From recursion to memoization to tables.",
    subcategories: ["Intro", "1D", "LIS", "Grid", "Strings", "Knapsack", "Interval", "State machine", "Trees", "Bitmask"],
  },
  {
    id: "greedy",
    title: "Greedy & Intervals",
    short: "Greedy",
    blurb: "Local choices that add up, and interval sweeps.",
    subcategories: ["Intervals", "Greedy classics", "Encoding"],
  },
  {
    id: "strings",
    title: "Strings",
    short: "Strings",
    blurb: "Pattern matching, palindromes and encodings.",
    subcategories: ["Pattern matching", "Palindromes", "Encoding"],
  },
  {
    id: "bits",
    title: "Bit Manipulation",
    short: "Bits",
    blurb: "Binary playground and classic bit tricks.",
    subcategories: ["Playground", "Tricks"],
  },
  {
    id: "math",
    title: "Math & Geometry",
    short: "Math",
    blurb: "Number theory, randomness and computational geometry.",
    subcategories: ["Number theory", "Randomness", "Geometry"],
  },
  {
    id: "design",
    title: "Data-Structure Design",
    short: "Design",
    blurb: "Interview design questions: caches, iterators, filters.",
    subcategories: ["Caches", "Structures", "Probabilistic"],
  },
  {
    id: "cheatsheet",
    title: "Pattern Cheat Sheet",
    short: "Cheat sheet",
    blurb: "Problem signal → pattern → page, plus Big-O tables.",
    subcategories: [],
  },
];

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<CategoryId, Category>;
