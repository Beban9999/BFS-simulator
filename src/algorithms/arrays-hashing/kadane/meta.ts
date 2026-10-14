import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "kadane",
  title: "Kadane's Algorithm",
  category: "arrays-hashing",
  subcategory: "Array scans",
  difficulty: "core",
  order: 1,
  summary: "Maximum subarray sum in one pass: extend the running sum or restart whenever it goes negative.",
  keywords: ["maximum subarray", "max sum", "contiguous", "dp", "running sum"],
  problems: [
    { id: 53, title: "Maximum Subarray", difficulty: "Medium", slug: "maximum-subarray", note: "The textbook Kadane: best sum ending here vs. best overall." },
    { id: 152, title: "Maximum Product Subarray", difficulty: "Medium", slug: "maximum-product-subarray", note: "Kadane variant that tracks both the max and min product ending here (a negative flips them)." },
    { id: 918, title: "Maximum Sum Circular Subarray", difficulty: "Medium", slug: "maximum-sum-circular-subarray", note: "Answer is max(Kadane max, total − Kadane min), unless all numbers are negative." },
    { id: 121, title: "Best Time to Buy and Sell Stock", difficulty: "Easy", slug: "best-time-to-buy-and-sell-stock", note: "Kadane on the day-to-day price differences." },
    { id: 1749, title: "Maximum Absolute Sum of Any Subarray", difficulty: "Medium", slug: "maximum-absolute-sum-of-any-subarray", note: "Run Kadane for the max and for the min sum." },
  ],
};

export default meta;
