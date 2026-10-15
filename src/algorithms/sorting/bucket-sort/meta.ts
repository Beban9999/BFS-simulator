import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "bucket-sort",
  title: "Bucket Sort",
  category: "sorting",
  subcategory: "Non-comparison",
  difficulty: "intermediate",
  order: 3,
  summary: "Split the value range into k equal slices, drop each value into its slice, sort the small buckets and concatenate them.",
  keywords: ["bucket sort", "buckets", "distribution sort", "uniform", "scatter gather", "pigeonhole"],
  problems: [
    { id: 347, title: "Top K Frequent Elements", difficulty: "Medium", slug: "top-k-frequent-elements", note: "Bucket by frequency (index = count), then read buckets from the highest — O(n)." },
    { id: 451, title: "Sort Characters By Frequency", difficulty: "Medium", slug: "sort-characters-by-frequency", note: "Same frequency-bucket trick for characters." },
    { id: 164, title: "Maximum Gap", difficulty: "Hard", slug: "maximum-gap", note: "With n − 1 buckets the max gap must cross a bucket boundary, so only bucket min/max matter." },
    { id: 220, title: "Contains Duplicate III", difficulty: "Hard", slug: "contains-duplicate-iii", note: "Buckets of width t + 1: close values land in the same or a neighbouring bucket." },
  ],
};

export default meta;
