import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "subarray-sum-k",
  title: "Subarray Sum Equals K (prefix + hash map)",
  category: "arrays-hashing",
  subcategory: "Prefix sums",
  difficulty: "intermediate",
  order: 3,
  summary: "Count subarrays with sum k by asking, at each prefix total T, how many earlier prefixes equal T − k.",
  keywords: ["prefix sum", "hash map", "count subarrays", "running sum", "negative numbers"],
  problems: [
    { id: 560, title: "Subarray Sum Equals K", difficulty: "Medium", slug: "subarray-sum-equals-k", note: "This page: count of earlier prefixes equal to total − k." },
    { id: 525, title: "Contiguous Array", difficulty: "Medium", slug: "contiguous-array", note: "Map 0 → −1, then find the longest subarray with sum 0 (store first index of each prefix)." },
    { id: 974, title: "Subarray Sums Divisible by K", difficulty: "Medium", slug: "subarray-sums-divisible-by-k", note: "Same counting, keyed by prefix mod k." },
    { id: 523, title: "Continuous Subarray Sum", difficulty: "Medium", slug: "continuous-subarray-sum", note: "Prefix mod k seen before at least two positions back." },
    { id: 1248, title: "Count Number of Nice Subarrays", difficulty: "Medium", slug: "count-number-of-nice-subarrays", note: "Treat odd numbers as 1 and count subarrays summing to k." },
  ],
};

export default meta;
