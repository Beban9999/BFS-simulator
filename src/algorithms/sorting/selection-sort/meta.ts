import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "selection-sort",
  title: "Selection Sort",
  category: "sorting",
  subcategory: "Simple sorts",
  difficulty: "core",
  order: 2,
  summary: "Scan the unsorted part for its minimum and swap it to the front; one swap per pass.",
  keywords: ["selection sort", "find minimum", "in place", "unstable", "few swaps", "O(n^2)"],
  problems: [
    { id: 912, title: "Sort an Array", difficulty: "Medium", slug: "sort-an-array", note: "Selection sort times out here; it is the baseline the O(n log n) sorts beat." },
    { id: 215, title: "Kth Largest Element in an Array", difficulty: "Medium", slug: "kth-largest-element-in-an-array", note: "k passes of selection give the answer in O(nk) — fine for tiny k, quickselect or a heap otherwise." },
    { id: 1051, title: "Height Checker", difficulty: "Easy", slug: "height-checker", note: "Compare the array with its sorted copy; any sort works at this size." },
  ],
};

export default meta;
