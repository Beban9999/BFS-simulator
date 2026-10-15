import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "max-path-sum",
  title: "Binary Tree Maximum Path Sum",
  category: "trees",
  subcategory: "Tree recursion",
  difficulty: "advanced",
  order: 4,
  summary: "Each node reports its best downward arm (ignoring negative arms); the best path bends at some node and uses both arms there.",
  keywords: ["maximum path sum", "max gain", "tree dp", "negative values", "global best", "path bends"],
  problems: [
    { id: 124, title: "Binary Tree Maximum Path Sum", difficulty: "Hard", slug: "binary-tree-maximum-path-sum", note: "This page: return node + best arm, record node + both arms." },
    { id: 543, title: "Diameter of Binary Tree", difficulty: "Easy", slug: "diameter-of-binary-tree", note: "The same split with every node worth 1." },
    { id: 2246, title: "Longest Path With Different Adjacent Characters", difficulty: "Hard", slug: "longest-path-with-different-adjacent-characters", note: "General trees: combine the two best child arms that are allowed." },
    { id: 337, title: "House Robber III", difficulty: "Medium", slug: "house-robber-iii", note: "Another bottom-up tree DP that returns two numbers per node." },
  ],
};

export default meta;
