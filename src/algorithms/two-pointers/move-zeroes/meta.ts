import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "move-zeroes",
  title: "Move Zeroes (swap compaction)",
  category: "two-pointers",
  subcategory: "Read / write",
  difficulty: "core",
  order: 2,
  summary: "Swap each non-zero forward to the write pointer; zeros drift to the end and the non-zero order is kept.",
  keywords: ["move zeroes", "stable partition", "swap", "in place", "read write"],
  problems: [
    { id: 283, title: "Move Zeroes", difficulty: "Easy", slug: "move-zeroes", note: "This page: swap non-zeros into the write slot." },
    { id: 27, title: "Remove Element", difficulty: "Easy", slug: "remove-element", note: "Same compaction, the tail doesn't matter." },
    { id: 905, title: "Sort Array By Parity", difficulty: "Easy", slug: "sort-array-by-parity", note: "Swap evens forward the same way." },
    { id: 2460, title: "Apply Operations to an Array", difficulty: "Easy", slug: "apply-operations-to-an-array", note: "Simulate, then move zeroes to the end." },
  ],
};

export default meta;
