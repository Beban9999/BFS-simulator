import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "bst-search-insert",
  title: "BST Search & Insert",
  category: "trees",
  subcategory: "BST",
  difficulty: "core",
  order: 1,
  summary: "Every comparison in a binary search tree discards one subtree: walk left for smaller, right for larger — O(h) to find a value or the empty spot for a new one.",
  keywords: ["binary search tree", "bst search", "bst insert", "O(log n)", "ordered tree"],
  problems: [
    { id: 700, title: "Search in a Binary Search Tree", difficulty: "Easy", slug: "search-in-a-binary-search-tree", note: "The search loop on this page." },
    { id: 701, title: "Insert into a Binary Search Tree", difficulty: "Medium", slug: "insert-into-a-binary-search-tree", note: "Walk down as in search and hang the new node on the empty side." },
    { id: 270, title: "Closest Binary Search Tree Value", difficulty: "Easy", slug: "closest-binary-search-tree-value", note: "Same walk, remembering the closest value seen." },
    { id: 1008, title: "Construct Binary Search Tree from Preorder Traversal", difficulty: "Medium", slug: "construct-binary-search-tree-from-preorder-traversal", note: "Insert the values one by one (O(n h)), or use bounds for O(n)." },
  ],
};

export default meta;
