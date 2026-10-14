import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "prefix-sum",
  title: "Prefix Sum (1D range queries)",
  category: "arrays-hashing",
  subcategory: "Prefix sums",
  difficulty: "core",
  order: 1,
  summary: "Precompute running totals once so any range sum is a single subtraction: sum(l..r) = P[r+1] − P[l].",
  keywords: ["prefix sum", "cumulative sum", "running total", "range sum query", "immutable"],
  problems: [
    { id: 303, title: "Range Sum Query - Immutable", difficulty: "Easy", slug: "range-sum-query-immutable", note: "Exactly this page: build P once, answer each query in O(1)." },
    { id: 724, title: "Find Pivot Index", difficulty: "Easy", slug: "find-pivot-index", note: "Left sum is a prefix sum; right sum is total − left − nums[i]." },
    { id: 1480, title: "Running Sum of 1d Array", difficulty: "Easy", slug: "running-sum-of-1d-array", note: "Building the prefix array itself." },
    { id: 560, title: "Subarray Sum Equals K", difficulty: "Medium", slug: "subarray-sum-equals-k", note: "Prefix sums + a hash map of how often each prefix appeared (see its own page)." },
    { id: 1991, title: "Find the Middle Index in Array", difficulty: "Easy", slug: "find-the-middle-index-in-array", note: "Same as pivot index." },
  ],
};

export default meta;
