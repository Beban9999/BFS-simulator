import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "iterative-traversals",
  title: "Tree Traversals with an Explicit Stack",
  category: "trees",
  subcategory: "Traversals",
  difficulty: "intermediate",
  order: 2,
  summary: "Replace recursion with your own stack: preorder pops-and-visits, inorder slides down left spines, postorder reverses a mirrored preorder.",
  keywords: ["iterative traversal", "explicit stack", "iterative inorder", "iterative preorder", "iterative postorder", "no recursion"],
  problems: [
    { id: 94, title: "Binary Tree Inorder Traversal", difficulty: "Easy", slug: "binary-tree-inorder-traversal", note: "The follow-up asks for the iterative left-spine version." },
    { id: 173, title: "Binary Search Tree Iterator", difficulty: "Medium", slug: "binary-search-tree-iterator", note: "Iterative inorder split into next() calls: keep the left-spine stack between calls." },
    { id: 230, title: "Kth Smallest Element in a BST", difficulty: "Medium", slug: "kth-smallest-element-in-a-bst", note: "Iterative inorder that stops after k pops." },
    { id: 145, title: "Binary Tree Postorder Traversal", difficulty: "Easy", slug: "binary-tree-postorder-traversal", note: "Reverse of a node-right-left preorder (or one stack with a last-visited pointer)." },
  ],
};

export default meta;
