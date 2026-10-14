import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "longest-unique-substring",
  title: "Variable Window (Longest Substring Without Repeats)",
  category: "two-pointers",
  subcategory: "Variable window",
  difficulty: "core",
  order: 1,
  summary: "Expand right one character at a time; when a repeat appears, shrink from the left until the window is valid again.",
  keywords: ["sliding window", "variable window", "longest substring", "no repeating characters", "expand shrink", "hash set"],
  problems: [
    { id: 3, title: "Longest Substring Without Repeating Characters", difficulty: "Medium", slug: "longest-substring-without-repeating-characters", note: "This page: shrink while the new char is already in the window." },
    { id: 159, title: "Longest Substring with At Most Two Distinct Characters", difficulty: "Medium", slug: "longest-substring-with-at-most-two-distinct-characters", note: "Same shape; the window is valid while it has ≤ 2 distinct chars." },
    { id: 904, title: "Fruit Into Baskets", difficulty: "Medium", slug: "fruit-into-baskets", note: "At most two distinct values, in disguise." },
    { id: 1004, title: "Max Consecutive Ones III", difficulty: "Medium", slug: "max-consecutive-ones-iii", note: "Valid while the window has ≤ k zeros." },
    { id: 209, title: "Minimum Size Subarray Sum", difficulty: "Medium", slug: "minimum-size-subarray-sum", note: "Shortest window instead of longest: shrink while still valid." },
  ],
};

export default meta;
