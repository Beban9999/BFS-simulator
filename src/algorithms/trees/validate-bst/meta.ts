import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "validate-bst",
  title: "Validate a Binary Search Tree",
  category: "trees",
  subcategory: "BST",
  difficulty: "intermediate",
  order: 3,
  summary: "Checking each node against its parent is not enough: pass down an allowed (low, high) range that every ancestor tightens.",
  keywords: ["validate bst", "is valid bst", "bounds", "min max range", "binary search tree"],
  problems: [
    { id: 98, title: "Validate Binary Search Tree", difficulty: "Medium", slug: "validate-binary-search-tree", note: "This page: open interval (low, high) passed down, tightened at every step." },
    { id: 99, title: "Recover Binary Search Tree", difficulty: "Medium", slug: "recover-binary-search-tree", note: "An inorder walk exposes the two swapped values as order violations." },
    { id: 1373, title: "Maximum Sum BST in Binary Tree", difficulty: "Hard", slug: "maximum-sum-bst-in-binary-tree", note: "Validate bottom-up: each subtree returns (is BST, min, max, sum)." },
  ],
};

export default meta;
