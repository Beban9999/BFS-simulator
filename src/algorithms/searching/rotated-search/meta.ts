import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "rotated-search",
  title: "Search in Rotated Sorted Array",
  category: "searching",
  subcategory: "Rotated arrays",
  difficulty: "intermediate",
  order: 1,
  summary: "One half around mid is always sorted; check whether the target lies inside that sorted half to decide where to go.",
  keywords: ["rotated sorted array", "pivot", "binary search", "sorted half", "shifted"],
  problems: [
    { id: 33, title: "Search in Rotated Sorted Array", difficulty: "Medium", slug: "search-in-rotated-sorted-array", note: "This page: find the sorted half, test if target is inside it." },
    { id: 81, title: "Search in Rotated Sorted Array II", difficulty: "Medium", slug: "search-in-rotated-sorted-array-ii", note: "With duplicates, when nums[lo] == nums[mid] just shrink lo (worst case O(n))." },
    { id: 153, title: "Find Minimum in Rotated Sorted Array", difficulty: "Medium", slug: "find-minimum-in-rotated-sorted-array", note: "Find the rotation point instead (see its own page)." },
    { id: 1095, title: "Find in Mountain Array", difficulty: "Hard", slug: "find-in-mountain-array", note: "Find the peak, then binary search each monotonic side." },
  ],
};

export default meta;
