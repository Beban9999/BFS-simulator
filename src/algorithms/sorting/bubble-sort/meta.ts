import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "bubble-sort",
  title: "Bubble Sort",
  category: "sorting",
  subcategory: "Simple sorts",
  difficulty: "core",
  order: 1,
  summary: "Repeatedly swap adjacent out-of-order pairs; each pass bubbles the largest remaining value to the end.",
  keywords: ["bubble sort", "adjacent swaps", "stable", "in place", "early exit", "O(n^2)"],
  problems: [
    { id: 912, title: "Sort an Array", difficulty: "Medium", slug: "sort-an-array", note: "Bubble sort is too slow here — a good reason to learn the O(n log n) sorts." },
    { id: 1047, title: "Remove All Adjacent Duplicates In String", difficulty: "Easy", slug: "remove-all-adjacent-duplicates-in-string", note: "Another adjacent-pair process (solved with a stack)." },
    { id: 2164, title: "Sort Even and Odd Indices Independently", difficulty: "Easy", slug: "sort-even-and-odd-indices-independently", note: "Small sorts where any simple algorithm works." },
  ],
};

export default meta;
