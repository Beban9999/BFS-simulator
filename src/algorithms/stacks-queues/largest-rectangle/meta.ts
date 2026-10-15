import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "largest-rectangle",
  title: "Largest Rectangle in Histogram",
  category: "stacks-queues",
  subcategory: "Monotonic",
  difficulty: "advanced",
  order: 2,
  summary: "An increasing stack of bars: when a lower bar arrives, each popped bar learns both of its limits and its widest rectangle — O(n).",
  keywords: ["largest rectangle in histogram", "monotonic stack", "increasing stack", "maximal rectangle", "next smaller element"],
  problems: [
    { id: 84, title: "Largest Rectangle in Histogram", difficulty: "Hard", slug: "largest-rectangle-in-histogram", note: "Exactly this increasing stack with a height-0 sentinel." },
    { id: 85, title: "Maximal Rectangle", difficulty: "Hard", slug: "maximal-rectangle", note: "Build a histogram of consecutive 1s per row and run this page's algorithm on each row." },
    { id: 907, title: "Sum of Subarray Minimums", difficulty: "Medium", slug: "sum-of-subarray-minimums", note: "Same left/right limits per element; count how many subarrays it is the minimum of." },
    { id: 1793, title: "Maximum Score of a Good Subarray", difficulty: "Hard", slug: "maximum-score-of-a-good-subarray", note: "A min × width score again, constrained to contain index k." },
  ],
};

export default meta;
