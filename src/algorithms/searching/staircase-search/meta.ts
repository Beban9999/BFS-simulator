import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "staircase-search",
  title: "Staircase Search (rows & columns sorted)",
  category: "searching",
  subcategory: "2D search",
  difficulty: "intermediate",
  order: 2,
  summary: "Start at the top-right corner: too big → go left (drop a column), too small → go down (drop a row).",
  keywords: ["staircase", "saddleback search", "2d matrix ii", "top right corner", "sorted rows and columns"],
  problems: [
    { id: 240, title: "Search a 2D Matrix II", difficulty: "Medium", slug: "search-a-2d-matrix-ii", note: "This page: each comparison eliminates a whole row or column." },
    { id: 1351, title: "Count Negative Numbers in a Sorted Matrix", difficulty: "Easy", slug: "count-negative-numbers-in-a-sorted-matrix", note: "Walk the staircase boundary between ≥ 0 and < 0." },
    { id: 378, title: "Kth Smallest Element in a Sorted Matrix", difficulty: "Medium", slug: "kth-smallest-element-in-a-sorted-matrix", note: "Staircase counting inside a binary search on the value." },
    { id: 74, title: "Search a 2D Matrix", difficulty: "Medium", slug: "search-a-2d-matrix", note: "Stronger ordering allows the flattened binary search." },
  ],
};

export default meta;
