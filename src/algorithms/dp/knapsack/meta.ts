import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "knapsack",
  title: "0/1 Knapsack",
  category: "dp",
  subcategory: "Knapsack",
  difficulty: "core",
  order: 1,
  summary: "Item by item, every capacity either leaves the item (value from the row above) or takes it (value from w − weight in the row above, plus its value).",
  keywords: ["knapsack", "0/1 knapsack", "capacity", "take or leave", "subset sum", "1d backwards", "space optimisation"],
  problems: [
    { id: 416, title: "Partition Equal Subset Sum", difficulty: "Medium", slug: "partition-equal-subset-sum", note: "Boolean knapsack: can some subset reach exactly half the total?" },
    { id: 494, title: "Target Sum", difficulty: "Medium", slug: "target-sum", note: "Count subsets reaching (total + target) / 2 with the same table, adding instead of maximising." },
    { id: 474, title: "Ones and Zeroes", difficulty: "Medium", slug: "ones-and-zeroes", note: "Two capacities (zeros and ones); iterate both downwards in the 1D trick." },
    { id: 1049, title: "Last Stone Weight II", difficulty: "Medium", slug: "last-stone-weight-ii", note: "Find the subset sum closest to half the total." },
  ],
};

export default meta;
