import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "house-robber",
  title: "House Robber",
  category: "dp",
  subcategory: "1D",
  difficulty: "core",
  order: 1,
  summary: "For each house: skip it (keep dp[i-1]) or rob it (dp[i-2] + its money). The table answers every prefix, and walking it back shows which houses.",
  keywords: ["house robber", "1d dp", "take or skip", "no two adjacent", "maximum sum", "path reconstruction"],
  problems: [
    { id: 198, title: "House Robber", difficulty: "Medium", slug: "house-robber", note: "This page: dp[i] = max(dp[i-1], dp[i-2] + nums[i])." },
    { id: 213, title: "House Robber II", difficulty: "Medium", slug: "house-robber-ii", note: "Houses in a circle: run this twice, once without the first and once without the last house." },
    { id: 740, title: "Delete and Earn", difficulty: "Medium", slug: "delete-and-earn", note: "Bucket the values; then it is House Robber over the value line." },
    { id: 746, title: "Min Cost Climbing Stairs", difficulty: "Easy", slug: "min-cost-climbing-stairs", note: "Same two-back recurrence, minimising instead of maximising." },
  ],
};

export default meta;
