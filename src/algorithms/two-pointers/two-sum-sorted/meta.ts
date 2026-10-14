import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "two-sum-sorted",
  title: "Opposite-Ends Two Pointers (Two Sum II)",
  category: "two-pointers",
  subcategory: "Opposite ends",
  difficulty: "core",
  order: 1,
  summary: "In a sorted array, start at both ends: too small → move left right, too big → move right left.",
  keywords: ["two pointers", "sorted array", "pair sum", "left right", "two sum ii", "converge"],
  problems: [
    { id: 167, title: "Two Sum II - Input Array Is Sorted", difficulty: "Medium", slug: "two-sum-ii-input-array-is-sorted", note: "This page: shrink from the side that can only make things worse." },
    { id: 15, title: "3Sum", difficulty: "Medium", slug: "3sum", note: "Fix one number, run this two-pointer scan on the rest." },
    { id: 11, title: "Container With Most Water", difficulty: "Medium", slug: "container-with-most-water", note: "Opposite ends again; move the shorter wall." },
    { id: 977, title: "Squares of a Sorted Array", difficulty: "Easy", slug: "squares-of-a-sorted-array", note: "The largest square is at one of the two ends." },
    { id: 881, title: "Boats to Save People", difficulty: "Medium", slug: "boats-to-save-people", note: "Sort, then pair the heaviest with the lightest when they fit." },
  ],
};

export default meta;
