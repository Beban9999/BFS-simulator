import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "koko-bananas",
  title: "Binary Search on the Answer (Koko Eating Bananas)",
  category: "searching",
  subcategory: "Search on the answer",
  difficulty: "intermediate",
  order: 1,
  summary: "When 'can we do it with x?' is ✗✗✗✓✓✓ as x grows, binary search x itself for the first ✓.",
  keywords: ["binary search on answer", "feasibility", "monotonic predicate", "minimize maximum", "koko", "capacity", "parametric search"],
  problems: [
    { id: 875, title: "Koko Eating Bananas", difficulty: "Medium", slug: "koko-eating-bananas", note: "This page: smallest speed that finishes within h hours." },
    { id: 1011, title: "Capacity To Ship Packages Within D Days", difficulty: "Medium", slug: "capacity-to-ship-packages-within-d-days", note: "Smallest capacity whose greedy day count ≤ D." },
    { id: 410, title: "Split Array Largest Sum", difficulty: "Hard", slug: "split-array-largest-sum", note: "Minimise the largest part: same feasibility check as shipping." },
    { id: 1482, title: "Minimum Number of Days to Make m Bouquets", difficulty: "Medium", slug: "minimum-number-of-days-to-make-m-bouquets", note: "Search the day; feasibility counts bouquets of adjacent bloomed flowers." },
    { id: 2187, title: "Minimum Time to Complete Trips", difficulty: "Medium", slug: "minimum-time-to-complete-trips", note: "Search time t; trips(t) = Σ t // time[i]." },
  ],
};

export default meta;
