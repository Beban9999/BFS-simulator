import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "fixed-window",
  title: "Fixed-Size Sliding Window (max sum of k)",
  category: "two-pointers",
  subcategory: "Fixed window",
  difficulty: "core",
  order: 1,
  summary: "Slide a window of size k one step at a time: add the element entering on the right, subtract the one leaving on the left.",
  keywords: ["sliding window", "fixed size", "window sum", "average", "k consecutive"],
  problems: [
    { id: 643, title: "Maximum Average Subarray I", difficulty: "Easy", slug: "maximum-average-subarray-i", note: "This page with a final divide by k." },
    { id: 1456, title: "Maximum Number of Vowels in a Substring of Given Length", difficulty: "Medium", slug: "maximum-number-of-vowels-in-a-substring-of-given-length", note: "Window count of vowels instead of a sum." },
    { id: 2090, title: "K Radius Subarray Averages", difficulty: "Medium", slug: "k-radius-subarray-averages", note: "Window of size 2k + 1 centred on each index." },
    { id: 1343, title: "Number of Sub-arrays of Size K and Average ≥ Threshold", difficulty: "Medium", slug: "number-of-sub-arrays-of-size-k-and-average-greater-than-or-equal-to-threshold", note: "Count windows whose sum reaches k × threshold." },
  ],
};

export default meta;
