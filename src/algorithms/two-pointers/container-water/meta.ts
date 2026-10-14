import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "container-water",
  title: "Container With Most Water",
  category: "two-pointers",
  subcategory: "Opposite ends",
  difficulty: "core",
  order: 3,
  summary: "Start with the widest container and always move the shorter wall inward — it is the only move that could help.",
  keywords: ["container", "most water", "area", "two pointers", "shorter wall", "greedy"],
  problems: [
    { id: 11, title: "Container With Most Water", difficulty: "Medium", slug: "container-with-most-water", note: "This page: area = width × min height; move the shorter side." },
    { id: 42, title: "Trapping Rain Water", difficulty: "Hard", slug: "trapping-rain-water", note: "Related two-pointer scan over the same kind of bar chart." },
    { id: 1984, title: "Minimum Difference Between Highest and Lowest of K Scores", difficulty: "Easy", slug: "minimum-difference-between-highest-and-lowest-of-k-scores", note: "Sort, then slide a pair of pointers k − 1 apart." },
  ],
};

export default meta;
