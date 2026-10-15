import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "diameter",
  title: "Diameter of a Binary Tree",
  category: "trees",
  subcategory: "Tree recursion",
  difficulty: "core",
  order: 2,
  summary: "Every longest path bends at some node: left height + right height. Compute heights bottom-up and keep the best bend.",
  keywords: ["diameter", "longest path", "tree recursion", "height", "global best"],
  problems: [
    { id: 543, title: "Diameter of Binary Tree", difficulty: "Easy", slug: "diameter-of-binary-tree", note: "This page: heights returned upward, best bend kept in a variable." },
    { id: 124, title: "Binary Tree Maximum Path Sum", difficulty: "Hard", slug: "binary-tree-maximum-path-sum", note: "Same \"bend here vs. continue upward\" split, with sums instead of lengths." },
    { id: 687, title: "Longest Univalue Path", difficulty: "Medium", slug: "longest-univalue-path", note: "Same shape; an arm only counts while values stay equal." },
    { id: 1522, title: "Diameter of N-Ary Tree", difficulty: "Medium", slug: "diameter-of-n-ary-tree", note: "Combine the two tallest children instead of left and right." },
  ],
};

export default meta;
