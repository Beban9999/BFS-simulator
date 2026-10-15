import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "merge-two-lists",
  title: "Merge Two Sorted Lists",
  category: "linked-lists",
  subcategory: "Merging",
  difficulty: "core",
  order: 1,
  summary: "Splice two sorted lists together by re-pointing nodes behind a dummy head — no new nodes, O(n + m).",
  keywords: ["merge two sorted lists", "dummy node", "tail pointer", "splice"],
  problems: [
    { id: 21, title: "Merge Two Sorted Lists", difficulty: "Easy", slug: "merge-two-sorted-lists", note: "This exact dummy + tail splice." },
    { id: 23, title: "Merge k Sorted Lists", difficulty: "Hard", slug: "merge-k-sorted-lists", note: "Repeat this merge pairwise (divide and conquer) or pick fronts with a heap." },
    { id: 148, title: "Sort List", difficulty: "Medium", slug: "sort-list", note: "Merge sort on a list: split at the middle, sort halves, merge them with this routine." },
    { id: 88, title: "Merge Sorted Array", difficulty: "Easy", slug: "merge-sorted-array", note: "The array version; fill from the back to avoid overwriting." },
  ],
};

export default meta;
