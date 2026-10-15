import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "min-path-sum",
  title: "Minimum Path Sum",
  category: "dp",
  subcategory: "Grid",
  difficulty: "core",
  order: 2,
  summary: "The cheapest way into a cell comes from the cheaper of its top and left neighbours; walking back along the smaller neighbour recovers the path.",
  keywords: ["minimum path sum", "grid dp", "cheapest path", "path reconstruction", "right and down"],
  problems: [
    { id: 64, title: "Minimum Path Sum", difficulty: "Medium", slug: "minimum-path-sum", note: "This page: dp[r][c] = min(up, left) + grid[r][c]." },
    { id: 120, title: "Triangle", difficulty: "Medium", slug: "triangle", note: "Same min-of-two-parents idea on a triangle; bottom-up needs only one row." },
    { id: 931, title: "Minimum Falling Path Sum", difficulty: "Medium", slug: "minimum-falling-path-sum", note: "Three parents per cell (up-left, up, up-right) instead of two." },
    { id: 174, title: "Dungeon Game", difficulty: "Hard", slug: "dungeon-game", note: "Fill from the bottom-right instead, because the constraint depends on the future." },
  ],
};

export default meta;
