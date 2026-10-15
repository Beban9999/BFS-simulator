import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "unique-paths",
  title: "Unique Paths (with obstacles)",
  category: "dp",
  subcategory: "Grid",
  difficulty: "core",
  order: 1,
  summary: "Moving only right or down, every cell is entered from above or from the left, so its path count is the sum of those two; obstacles hold 0.",
  keywords: ["unique paths", "grid dp", "counting paths", "obstacles", "right and down", "binomial"],
  problems: [
    { id: 62, title: "Unique Paths", difficulty: "Medium", slug: "unique-paths", note: "No obstacles: dp[r][c] = dp[r-1][c] + dp[r][c-1] (equals C(m+n-2, m-1))." },
    { id: 63, title: "Unique Paths II", difficulty: "Medium", slug: "unique-paths-ii", note: "This page: an obstacle cell keeps 0 paths, which also cuts off what's behind it." },
    { id: 980, title: "Unique Paths III", difficulty: "Hard", slug: "unique-paths-iii", note: "Moving in all four directions and visiting every cell: that needs backtracking, not this DP." },
  ],
};

export default meta;
