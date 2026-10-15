import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "lis",
  title: "Longest Increasing Subsequence",
  category: "dp",
  subcategory: "LIS",
  difficulty: "intermediate",
  order: 1,
  summary: "O(n²): dp[i] extends the best earlier subsequence that ends below nums[i]. O(n log n): keep the smallest tail for each length and binary-search where each number goes.",
  keywords: ["lis", "longest increasing subsequence", "patience sorting", "tails", "binary search", "bisect", "subsequence dp"],
  problems: [
    { id: 300, title: "Longest Increasing Subsequence", difficulty: "Medium", slug: "longest-increasing-subsequence", note: "Both versions on this page; the tails trick is the expected follow-up." },
    { id: 354, title: "Russian Doll Envelopes", difficulty: "Hard", slug: "russian-doll-envelopes", note: "Sort by width ascending, height descending, then LIS on heights." },
    { id: 673, title: "Number of Longest Increasing Subsequence", difficulty: "Medium", slug: "number-of-longest-increasing-subsequence", note: "O(n²) table plus a count of ways for each dp[i]." },
    { id: 1048, title: "Longest String Chain", difficulty: "Medium", slug: "longest-string-chain", note: "Same 'best predecessor' dp, where a predecessor is the word minus one letter." },
  ],
};

export default meta;
