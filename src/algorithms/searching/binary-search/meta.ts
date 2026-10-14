import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "binary-search",
  title: "Binary Search (classic)",
  category: "searching",
  subcategory: "Binary search",
  difficulty: "core",
  order: 1,
  summary: "Halve a sorted search range each step by comparing the middle element with the target: O(log n).",
  keywords: ["binary search", "sorted array", "lo hi mid", "divide", "log n", "bisect"],
  problems: [
    { id: 704, title: "Binary Search", difficulty: "Easy", slug: "binary-search", note: "This page, exactly." },
    { id: 35, title: "Search Insert Position", difficulty: "Easy", slug: "search-insert-position", note: "When the loop ends, lo is the insertion point (a lower bound)." },
    { id: 374, title: "Guess Number Higher or Lower", difficulty: "Easy", slug: "guess-number-higher-or-lower", note: "Binary search where the comparison is an API call." },
    { id: 69, title: "Sqrt(x)", difficulty: "Easy", slug: "sqrtx", note: "Binary search over candidate answers 0..x." },
    { id: 278, title: "First Bad Version", difficulty: "Easy", slug: "first-bad-version", note: "First true in a false…true sequence — see lower bound." },
  ],
};

export default meta;
