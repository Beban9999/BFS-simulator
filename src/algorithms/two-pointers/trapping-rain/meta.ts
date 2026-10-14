import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "trapping-rain",
  title: "Trapping Rain Water (two pointers)",
  category: "two-pointers",
  subcategory: "Opposite ends",
  difficulty: "intermediate",
  order: 5,
  summary: "Water above a bar = min(max to its left, max to its right) − its height; two pointers settle the smaller side each step.",
  keywords: ["trapping rain water", "left max", "right max", "elevation map", "two pointers"],
  problems: [
    { id: 42, title: "Trapping Rain Water", difficulty: "Hard", slug: "trapping-rain-water", note: "This page: process whichever side has the smaller running max." },
    { id: 11, title: "Container With Most Water", difficulty: "Medium", slug: "container-with-most-water", note: "Simpler cousin: pick the best two walls only." },
    { id: 407, title: "Trapping Rain Water II", difficulty: "Hard", slug: "trapping-rain-water-ii", note: "2D version: a min-heap of boundary cells replaces the two pointers." },
    { id: 84, title: "Largest Rectangle in Histogram", difficulty: "Hard", slug: "largest-rectangle-in-histogram", note: "Another bar-chart classic, solved with a monotonic stack." },
  ],
};

export default meta;
