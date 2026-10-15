import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "quick-sort-lomuto",
  title: "Quick Sort (Lomuto partition)",
  category: "sorting",
  subcategory: "Divide & conquer",
  difficulty: "core",
  order: 2,
  summary: "Pick a pivot, move everything smaller to its left, then sort both sides recursively. Fast on average; the pivot choice decides the worst case.",
  keywords: ["quick sort", "quicksort", "partition", "lomuto", "pivot", "median of three", "divide and conquer"],
  problems: [
    { id: 912, title: "Sort an Array", difficulty: "Medium", slug: "sort-an-array", note: "Quick sort with a fixed last-element pivot hits the O(n²) case on sorted tests — randomise or use median-of-three." },
    { id: 215, title: "Kth Largest Element in an Array", difficulty: "Medium", slug: "kth-largest-element-in-an-array", note: "Partition once, then recurse into only one side (quickselect)." },
    { id: 905, title: "Sort Array By Parity", difficulty: "Easy", slug: "sort-array-by-parity", note: "A Lomuto-style partition where the 'pivot test' is x % 2 == 0." },
    { id: 75, title: "Sort Colors", difficulty: "Medium", slug: "sort-colors", note: "Three-way partitioning — the fix for quick sort on many duplicates." },
  ],
};

export default meta;
