import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "linear-search",
  title: "Linear Search",
  category: "searching",
  subcategory: "Basics",
  difficulty: "core",
  order: 1,
  summary: "Check every element in order until the target turns up — the baseline every other search is measured against.",
  keywords: ["linear search", "sequential search", "scan", "find index"],
  problems: [
    { id: 1295, title: "Find Numbers with Even Number of Digits", difficulty: "Easy", slug: "find-numbers-with-even-number-of-digits", note: "A plain scan with a per-element test." },
    { id: 2089, title: "Find Target Indices After Sorting Array", difficulty: "Easy", slug: "find-target-indices-after-sorting-array", note: "Count smaller and equal values in one scan — no sort needed." },
    { id: 1351, title: "Count Negative Numbers in a Sorted Matrix", difficulty: "Easy", slug: "count-negative-numbers-in-a-sorted-matrix", note: "Scanning works; sortedness enables a faster staircase walk." },
  ],
};

export default meta;
