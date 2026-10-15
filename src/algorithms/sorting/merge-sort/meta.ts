import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "merge-sort",
  title: "Merge Sort",
  category: "sorting",
  subcategory: "Divide & conquer",
  difficulty: "core",
  order: 1,
  summary: "Split in half, sort each half recursively, then merge the two sorted halves — O(n log n) always, and stable.",
  keywords: ["merge sort", "divide and conquer", "merge", "stable", "recursion", "inversions", "O(n log n)"],
  problems: [
    { id: 148, title: "Sort List", difficulty: "Medium", slug: "sort-list", note: "Merge sort is the natural fit for linked lists: split with slow/fast pointers, merge without extra arrays." },
    { id: 88, title: "Merge Sorted Array", difficulty: "Easy", slug: "merge-sorted-array", note: "Just the merge step — done from the back so it can happen in place." },
    { id: 912, title: "Sort an Array", difficulty: "Medium", slug: "sort-an-array", note: "A guaranteed O(n log n) solution with no bad-pivot worst case." },
    { id: 315, title: "Count of Smaller Numbers After Self", difficulty: "Hard", slug: "count-of-smaller-numbers-after-self", note: "Count, during each merge, how many right-half values jump ahead of a left-half value." },
    { id: 493, title: "Reverse Pairs", difficulty: "Hard", slug: "reverse-pairs", note: "Count cross-half pairs with two pointers before each merge." },
  ],
};

export default meta;
