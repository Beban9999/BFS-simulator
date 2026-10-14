import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "three-sum",
  title: "3Sum (sort + two pointers)",
  category: "two-pointers",
  subcategory: "Opposite ends",
  difficulty: "intermediate",
  order: 4,
  summary: "Sort, fix the first number, then find pairs summing to its negation with two pointers — skipping duplicates at every level.",
  keywords: ["3sum", "triplets", "sum zero", "skip duplicates", "sort", "two pointers", "k-sum"],
  problems: [
    { id: 15, title: "3Sum", difficulty: "Medium", slug: "3sum", note: "This page: fix i, two-pointer the rest, skip repeated values." },
    { id: 16, title: "3Sum Closest", difficulty: "Medium", slug: "3sum-closest", note: "Same scan, track the closest sum instead of exact matches." },
    { id: 18, title: "4Sum", difficulty: "Medium", slug: "4sum", note: "Two fixed indexes (or recursion) + the two-pointer scan." },
    { id: 259, title: "3Sum Smaller", difficulty: "Medium", slug: "3sum-smaller", note: "When the sum is small, every pair (left, left+1..right) counts at once." },
  ],
};

export default meta;
