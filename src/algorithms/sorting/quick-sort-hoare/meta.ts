import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "quick-sort-hoare",
  title: "Quick Sort (Hoare partition)",
  category: "sorting",
  subcategory: "Divide & conquer",
  difficulty: "intermediate",
  order: 3,
  summary: "Two pointers walk inward from both ends and swap misplaced pairs — fewer swaps than Lomuto and better with duplicates.",
  keywords: ["quick sort", "hoare", "partition", "two pointers", "pivot", "duplicates"],
  problems: [
    { id: 912, title: "Sort an Array", difficulty: "Medium", slug: "sort-an-array", note: "Hoare's partition with a middle pivot copes with sorted input and runs of equal values." },
    { id: 2161, title: "Partition Array According to Given Pivot", difficulty: "Medium", slug: "partition-array-according-to-given-pivot", note: "Partitioning around a value — but this one must keep relative order, which in-place Hoare does not." },
    { id: 75, title: "Sort Colors", difficulty: "Medium", slug: "sort-colors", note: "Pointers converging from both ends, extended to three zones." },
  ],
};

export default meta;
