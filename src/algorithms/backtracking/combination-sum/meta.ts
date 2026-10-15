import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "combination-sum",
  title: "Combination Sum I & II",
  category: "backtracking",
  subcategory: "Subsets & permutations",
  difficulty: "core",
  order: 4,
  summary: "Track the remaining target; sorted candidates let one comparison cut every larger branch. Reuse means recursing on the same index.",
  keywords: ["combination sum", "target sum", "backtracking", "reuse", "pruning", "sorted candidates", "combination sum ii"],
  problems: [
    { id: 39, title: "Combination Sum", difficulty: "Medium", slug: "combination-sum", note: "Mode I: recurse with the same index so a number can be used again." },
    { id: 40, title: "Combination Sum II", difficulty: "Medium", slug: "combination-sum-ii", note: "Mode II: next index, plus the sorted 'skip equal sibling' rule." },
    { id: 216, title: "Combination Sum III", difficulty: "Medium", slug: "combination-sum-iii", note: "Digits 1–9 used once and exactly k of them: add a length check." },
    { id: 377, title: "Combination Sum IV", difficulty: "Medium", slug: "combination-sum-iv", note: "Order matters and only the count is asked: that's DP, not backtracking." },
  ],
};

export default meta;
