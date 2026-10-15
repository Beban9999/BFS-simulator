import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "merge-k-lists",
  title: "Merge k Sorted Lists",
  category: "linked-lists",
  subcategory: "Merging",
  difficulty: "advanced",
  order: 2,
  summary: "Keep the front node of every list in a min-heap; pop the smallest, attach it, push its successor — O(N log k).",
  keywords: ["merge k sorted lists", "min heap", "priority queue", "k-way merge"],
  problems: [
    { id: 23, title: "Merge k Sorted Lists", difficulty: "Hard", slug: "merge-k-sorted-lists", note: "The heap of list fronts shown here (or pairwise divide-and-conquer merging)." },
    { id: 378, title: "Kth Smallest Element in a Sorted Matrix", difficulty: "Medium", slug: "kth-smallest-element-in-a-sorted-matrix", note: "Treat each row as a sorted list and pop from a heap of row fronts k times." },
    { id: 373, title: "Find K Pairs with Smallest Sums", difficulty: "Medium", slug: "find-k-pairs-with-smallest-sums", note: "Implicit sorted lists of pairs; the heap holds one candidate per list." },
    { id: 632, title: "Smallest Range Covering Elements from K Lists", difficulty: "Hard", slug: "smallest-range-covering-elements-from-k-lists", note: "Same heap of fronts, while also tracking the current maximum." },
  ],
};

export default meta;
