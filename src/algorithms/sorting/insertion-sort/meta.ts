import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "insertion-sort",
  title: "Insertion Sort",
  category: "sorting",
  subcategory: "Simple sorts",
  difficulty: "core",
  order: 3,
  summary: "Grow a sorted prefix by sliding each new element left past every larger one — fast on nearly sorted data.",
  keywords: ["insertion sort", "shift", "stable", "adaptive", "nearly sorted", "inversions", "O(n^2)"],
  problems: [
    { id: 147, title: "Insertion Sort List", difficulty: "Medium", slug: "insertion-sort-list", note: "The same algorithm on a linked list: walk the sorted part to find each node's spot." },
    { id: 35, title: "Search Insert Position", difficulty: "Easy", slug: "search-insert-position", note: "Finding where one value belongs in a sorted prefix — binary search speeds up that step." },
    { id: 912, title: "Sort an Array", difficulty: "Medium", slug: "sort-an-array", note: "Too slow alone, but real sorts (Timsort, introsort) use insertion sort for small runs." },
  ],
};

export default meta;
