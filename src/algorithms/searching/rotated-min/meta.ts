import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "rotated-min",
  title: "Find Minimum in Rotated Sorted Array",
  category: "searching",
  subcategory: "Rotated arrays",
  difficulty: "intermediate",
  order: 2,
  summary: "Compare nums[mid] with nums[hi]: if mid is bigger, the drop (and the minimum) is to its right; otherwise it's at mid or left.",
  keywords: ["rotation point", "minimum", "pivot index", "rotated sorted array", "binary search"],
  problems: [
    { id: 153, title: "Find Minimum in Rotated Sorted Array", difficulty: "Medium", slug: "find-minimum-in-rotated-sorted-array", note: "This page: compare mid with the right end." },
    { id: 154, title: "Find Minimum in Rotated Sorted Array II", difficulty: "Hard", slug: "find-minimum-in-rotated-sorted-array-ii", note: "With duplicates, on a tie just do hi −= 1." },
    { id: 33, title: "Search in Rotated Sorted Array", difficulty: "Medium", slug: "search-in-rotated-sorted-array", note: "Alternative solution: find the pivot first, then a normal binary search." },
    { id: 162, title: "Find Peak Element", difficulty: "Medium", slug: "find-peak-element", note: "Same 'compare mid with a neighbour to pick a side' idea." },
  ],
};

export default meta;
