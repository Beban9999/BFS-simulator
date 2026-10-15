import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "greedy-vs-dp",
  title: "Greedy vs DP: when greedy fails",
  category: "dp",
  subcategory: "Intro",
  difficulty: "core",
  order: 2,
  kind: "note",
  summary: "Try any coin system and watch largest-coin-first fail where DP doesn't, then see which classic problems greedy solves and which need DP.",
  keywords: ["greedy", "counter-example", "exchange argument", "greedy choice property", "canonical coins", "coin change greedy"],
  problems: [
    { id: 322, title: "Coin Change", difficulty: "Medium", slug: "coin-change", note: "The counter-example problem: arbitrary coins need DP over amounts." },
    { id: 860, title: "Lemonade Change", difficulty: "Easy", slug: "lemonade-change", note: "Bills of 5, 10, 20 are canonical, so giving the largest bill first is safe." },
    { id: 435, title: "Non-overlapping Intervals", difficulty: "Medium", slug: "non-overlapping-intervals", note: "Greedy works: keep the interval that ends first." },
    { id: 1235, title: "Maximum Profit in Job Scheduling", difficulty: "Hard", slug: "maximum-profit-in-job-scheduling", note: "Add weights to the intervals and greedy breaks: DP + binary search." },
    { id: 55, title: "Jump Game", difficulty: "Medium", slug: "jump-game", note: "Greedy farthest-reach is enough; the DP version is correct but slower." },
  ],
};

export default meta;
