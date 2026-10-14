import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "boyer-moore",
  title: "Boyer–Moore Majority Vote",
  category: "arrays-hashing",
  subcategory: "Array scans",
  difficulty: "intermediate",
  order: 2,
  summary: "Find the element appearing more than n/2 times in O(1) space by letting different values cancel each other out.",
  keywords: ["majority element", "voting", "candidate", "cancel", "more than half"],
  problems: [
    { id: 169, title: "Majority Element", difficulty: "Easy", slug: "majority-element", note: "One candidate, one counter; a majority is guaranteed so no verify pass is needed." },
    { id: 229, title: "Majority Element II", difficulty: "Medium", slug: "majority-element-ii", note: "Two candidates and two counters for elements above n/3, then verify." },
    { id: 1150, title: "Check If a Number Is Majority Element in a Sorted Array", difficulty: "Easy", slug: "check-if-a-number-is-majority-element-in-a-sorted-array", note: "Sorted input: binary search for the first occurrence instead." },
  ],
};

export default meta;
