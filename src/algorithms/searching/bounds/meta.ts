import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "bounds",
  title: "Lower & Upper Bound (first / last occurrence)",
  category: "searching",
  subcategory: "Binary search",
  difficulty: "core",
  order: 2,
  summary: "Binary search for the boundary of a ✗✗✗✓✓✓ predicate: the first index with nums[i] ≥ target (lower) or > target (upper).",
  keywords: ["lower bound", "upper bound", "bisect left", "bisect right", "first occurrence", "last occurrence", "half open", "boundary"],
  problems: [
    { id: 34, title: "Find First and Last Position of Element in Sorted Array", difficulty: "Medium", slug: "find-first-and-last-position-of-element-in-sorted-array", note: "This page: lower bound and upper bound − 1." },
    { id: 35, title: "Search Insert Position", difficulty: "Easy", slug: "search-insert-position", note: "Exactly lower bound." },
    { id: 278, title: "First Bad Version", difficulty: "Easy", slug: "first-bad-version", note: "Lower bound on an isBad(v) predicate." },
    { id: 744, title: "Find Smallest Letter Greater Than Target", difficulty: "Easy", slug: "find-smallest-letter-greater-than-target", note: "Upper bound, wrapping around to index 0." },
    { id: 2529, title: "Maximum Count of Positive Integer and Negative Integer", difficulty: "Easy", slug: "maximum-count-of-positive-integer-and-negative-integer", note: "Two bounds around zero give both counts." },
  ],
};

export default meta;
