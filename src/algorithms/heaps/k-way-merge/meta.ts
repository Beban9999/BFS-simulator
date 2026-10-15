import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "k-way-merge",
  title: "K-way Merge with a Heap",
  category: "heaps",
  subcategory: "Patterns",
  difficulty: "intermediate",
  order: 3,
  summary: "Merge k sorted arrays by keeping one front value per array in a min-heap: pop the smallest, push its successor — O(N log k).",
  keywords: ["k-way merge", "merge k sorted arrays", "heap of fronts", "external sort", "kth smallest in sorted matrix"],
  problems: [
    { id: 23, title: "Merge k Sorted Lists", difficulty: "Hard", slug: "merge-k-sorted-lists", note: "The linked-list version (see Linked Lists → Merge k Sorted Lists)." },
    { id: 378, title: "Kth Smallest Element in a Sorted Matrix", difficulty: "Medium", slug: "kth-smallest-element-in-a-sorted-matrix", note: "Rows are k sorted arrays; pop from the heap of fronts k times." },
    { id: 373, title: "Find K Pairs with Smallest Sums", difficulty: "Medium", slug: "find-k-pairs-with-smallest-sums", note: "Each nums1[i] defines a sorted array of pairs; merge them lazily." },
    { id: 632, title: "Smallest Range Covering Elements from K Lists", difficulty: "Hard", slug: "smallest-range-covering-elements-from-k-lists", note: "Same heap of fronts, also tracking the current maximum front." },
  ],
};

export default meta;
