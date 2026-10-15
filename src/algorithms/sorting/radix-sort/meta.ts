import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "radix-sort",
  title: "Radix Sort (LSD)",
  category: "sorting",
  subcategory: "Non-comparison",
  difficulty: "intermediate",
  order: 2,
  summary: "Sort by the last digit, then the tens, then the hundreds — each pass a stable bucket pass — so numbers end up fully sorted.",
  keywords: ["radix sort", "lsd", "least significant digit", "buckets", "digits", "stable", "non-comparison"],
  problems: [
    { id: 164, title: "Maximum Gap", difficulty: "Hard", slug: "maximum-gap", note: "Requires linear time: radix sort (or pigeonhole buckets), then scan adjacent gaps." },
    { id: 2343, title: "Query Kth Smallest Trimmed Number", difficulty: "Medium", slug: "query-kth-smallest-trimmed-number", note: "Sorting by the last t digits is literally the first t passes of LSD radix sort." },
    { id: 912, title: "Sort an Array", difficulty: "Medium", slug: "sort-an-array", note: "Radix sort works too once negatives are shifted to be non-negative." },
  ],
};

export default meta;
