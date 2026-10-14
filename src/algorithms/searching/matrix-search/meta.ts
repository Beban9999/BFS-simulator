import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "matrix-search",
  title: "Search a 2D Matrix (flattened binary search)",
  category: "searching",
  subcategory: "2D search",
  difficulty: "core",
  order: 1,
  summary: "If rows are sorted and each row starts after the previous ends, the matrix is one sorted array: index k ↔ (k // C, k % C).",
  keywords: ["2d matrix", "flatten", "row major", "binary search", "index mapping"],
  problems: [
    { id: 74, title: "Search a 2D Matrix", difficulty: "Medium", slug: "search-a-2d-matrix", note: "This page: one binary search over R·C virtual indexes." },
    { id: 240, title: "Search a 2D Matrix II", difficulty: "Medium", slug: "search-a-2d-matrix-ii", note: "Weaker ordering — use the staircase walk instead." },
    { id: 378, title: "Kth Smallest Element in a Sorted Matrix", difficulty: "Medium", slug: "kth-smallest-element-in-a-sorted-matrix", note: "Binary search on the value with a staircase count." },
  ],
};

export default meta;
