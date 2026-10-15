import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "coin-change",
  title: "Coin Change (fewest coins)",
  category: "dp",
  subcategory: "1D",
  difficulty: "core",
  order: 2,
  summary: "dp[a] = 1 + the best dp[a − c] over every coin c: each amount looks back by each coin's value, and greedy can't replace this.",
  keywords: ["coin change", "fewest coins", "unbounded knapsack", "min coins", "1d dp", "greedy fails"],
  problems: [
    { id: 322, title: "Coin Change", difficulty: "Medium", slug: "coin-change", note: "This page: minimum number of coins, -1 if the amount can't be made." },
    { id: 518, title: "Coin Change II", difficulty: "Medium", slug: "coin-change-ii", note: "Count the combinations instead: loop coins outside, amounts inside, and add." },
    { id: 279, title: "Perfect Squares", difficulty: "Medium", slug: "perfect-squares", note: "Coin change where the coins are 1, 4, 9, 16, …" },
    { id: 983, title: "Minimum Cost For Tickets", difficulty: "Medium", slug: "minimum-cost-for-tickets", note: "Same look-back-by-option shape over days with three ticket lengths." },
  ],
};

export default meta;
