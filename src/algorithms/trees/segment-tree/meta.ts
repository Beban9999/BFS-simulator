import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "segment-tree",
  title: "Segment Tree (range sum, point update)",
  category: "trees",
  subcategory: "Range queries",
  difficulty: "advanced",
  order: 1,
  summary: "Every node stores the sum of a range; a query combines O(log n) fully-covered nodes, and an update fixes the sums on one root-to-leaf path.",
  keywords: ["segment tree", "range sum query", "point update", "range minimum", "divide and conquer", "lazy propagation"],
  problems: [
    { id: 307, title: "Range Sum Query - Mutable", difficulty: "Medium", slug: "range-sum-query-mutable", note: "This page: sums with point updates." },
    { id: 315, title: "Count of Smaller Numbers After Self", difficulty: "Hard", slug: "count-of-smaller-numbers-after-self", note: "A segment tree over values counts how many smaller ones were already inserted." },
    { id: 699, title: "Falling Squares", difficulty: "Hard", slug: "falling-squares", note: "Range max with range assignment — needs lazy propagation." },
    { id: 2407, title: "Longest Increasing Subsequence II", difficulty: "Hard", slug: "longest-increasing-subsequence-ii", note: "DP where each step asks for a range maximum over values." },
  ],
};

export default meta;
