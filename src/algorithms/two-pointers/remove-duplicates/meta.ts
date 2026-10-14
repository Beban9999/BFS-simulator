import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "remove-duplicates",
  title: "Read / Write Pointers (Remove Duplicates)",
  category: "two-pointers",
  subcategory: "Read / write",
  difficulty: "core",
  order: 1,
  summary: "A fast read pointer scans every element; a slow write pointer marks where the next kept element goes.",
  keywords: ["remove duplicates", "in place", "slow fast", "read write", "compact", "sorted array"],
  problems: [
    { id: 26, title: "Remove Duplicates from Sorted Array", difficulty: "Easy", slug: "remove-duplicates-from-sorted-array", note: "This page: keep a value when it differs from the last kept one." },
    { id: 80, title: "Remove Duplicates from Sorted Array II", difficulty: "Medium", slug: "remove-duplicates-from-sorted-array-ii", note: "Allow two copies: compare with nums[write − 2]." },
    { id: 27, title: "Remove Element", difficulty: "Easy", slug: "remove-element", note: "Keep every value that isn't val." },
    { id: 283, title: "Move Zeroes", difficulty: "Easy", slug: "move-zeroes", note: "Same compaction, then zero-fill (or swap) the tail." },
  ],
};

export default meta;
