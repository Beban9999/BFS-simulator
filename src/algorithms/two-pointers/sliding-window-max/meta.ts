import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "sliding-window-max",
  title: "Sliding Window Maximum (monotonic deque)",
  category: "two-pointers",
  subcategory: "Monotonic deque",
  difficulty: "advanced",
  order: 1,
  summary: "Keep a deque of indexes with decreasing values: the front is always the window's maximum, and each index enters and leaves once.",
  keywords: ["sliding window maximum", "monotonic queue", "deque", "decreasing", "window max", "window min"],
  problems: [
    { id: 239, title: "Sliding Window Maximum", difficulty: "Hard", slug: "sliding-window-maximum", note: "This page: pop smaller values from the back, expired indexes from the front." },
    { id: 1438, title: "Longest Continuous Subarray With Absolute Diff ≤ Limit", difficulty: "Medium", slug: "longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit", note: "Two deques (max and min) inside a variable window." },
    { id: 862, title: "Shortest Subarray with Sum at Least K", difficulty: "Hard", slug: "shortest-subarray-with-sum-at-least-k", note: "Monotonic deque over prefix sums (works with negatives)." },
    { id: 1696, title: "Jump Game VI", difficulty: "Medium", slug: "jump-game-vi", note: "DP where each state needs the max of the previous k states." },
  ],
};

export default meta;
