import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "fenwick-tree",
  title: "Fenwick Tree (Binary Indexed Tree)",
  category: "trees",
  subcategory: "Range queries",
  difficulty: "advanced",
  order: 2,
  summary: "tree[i] stores the sum of a block ending at i whose length is i's lowest set bit; prefix sums and point updates hop between blocks in O(log n).",
  keywords: ["fenwick tree", "binary indexed tree", "BIT", "lowbit", "i & -i", "prefix sum", "point update"],
  problems: [
    { id: 307, title: "Range Sum Query - Mutable", difficulty: "Medium", slug: "range-sum-query-mutable", note: "prefix(r) − prefix(l − 1) with point updates." },
    { id: 315, title: "Count of Smaller Numbers After Self", difficulty: "Hard", slug: "count-of-smaller-numbers-after-self", note: "Walk from the right; a BIT over values counts smaller numbers already seen." },
    { id: 493, title: "Reverse Pairs", difficulty: "Hard", slug: "reverse-pairs", note: "Coordinate-compress, then count earlier values above 2·x with a BIT." },
    { id: 1649, title: "Create Sorted Array through Instructions", difficulty: "Hard", slug: "create-sorted-array-through-instructions", note: "Two BIT prefix queries per insertion: how many smaller, how many larger." },
  ],
};

export default meta;
