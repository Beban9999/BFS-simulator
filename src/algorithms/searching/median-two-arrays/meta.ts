import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "median-two-arrays",
  title: "Median of Two Sorted Arrays (partition search)",
  category: "searching",
  subcategory: "Advanced",
  difficulty: "advanced",
  order: 1,
  summary: "Binary search the cut in the shorter array so the two left parts together hold half the elements and are all ≤ the right parts.",
  keywords: ["median", "two sorted arrays", "partition", "binary search", "kth element", "log min(m, n)"],
  problems: [
    { id: 4, title: "Median of Two Sorted Arrays", difficulty: "Hard", slug: "median-of-two-sorted-arrays", note: "This page: binary search the partition of the shorter array." },
    { id: 1539, title: "Kth Missing Positive Number", difficulty: "Easy", slug: "kth-missing-positive-number", note: "Smaller-scale 'binary search a count' practice." },
    { id: 719, title: "Find K-th Smallest Pair Distance", difficulty: "Hard", slug: "find-k-th-smallest-pair-distance", note: "Order statistics via binary search on the value." },
  ],
};

export default meta;
