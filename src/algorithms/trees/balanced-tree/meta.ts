import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "balanced-tree",
  title: "Balanced Binary Tree",
  category: "trees",
  subcategory: "Tree recursion",
  difficulty: "core",
  order: 3,
  summary: "A tree is height-balanced when every node's subtrees differ in height by at most 1 — check it in one pass by returning -1 as soon as something is off.",
  keywords: ["balanced binary tree", "height balanced", "sentinel -1", "early exit", "avl condition"],
  problems: [
    { id: 110, title: "Balanced Binary Tree", difficulty: "Easy", slug: "balanced-binary-tree", note: "This page: heights with -1 as an \"unbalanced\" signal, O(n)." },
    { id: 1382, title: "Balance a Binary Search Tree", difficulty: "Medium", slug: "balance-a-binary-search-tree", note: "Inorder to a sorted list, then rebuild by always picking the middle." },
    { id: 108, title: "Convert Sorted Array to Binary Search Tree", difficulty: "Easy", slug: "convert-sorted-array-to-binary-search-tree", note: "Middle element as root guarantees a balanced result." },
  ],
};

export default meta;
