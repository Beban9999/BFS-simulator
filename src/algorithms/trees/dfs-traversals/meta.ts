import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "dfs-traversals",
  title: "Preorder / Inorder / Postorder (recursive)",
  category: "trees",
  subcategory: "Traversals",
  difficulty: "core",
  order: 1,
  summary: "One recursive DFS, three orders: record the node before, between or after visiting its two subtrees — watch the call stack.",
  keywords: ["preorder", "inorder", "postorder", "tree traversal", "dfs", "recursion", "call stack", "binary tree"],
  problems: [
    { id: 144, title: "Binary Tree Preorder Traversal", difficulty: "Easy", slug: "binary-tree-preorder-traversal", note: "Record the node first, then recurse left and right." },
    { id: 94, title: "Binary Tree Inorder Traversal", difficulty: "Easy", slug: "binary-tree-inorder-traversal", note: "Record between the two recursive calls; on a BST this yields sorted order." },
    { id: 145, title: "Binary Tree Postorder Traversal", difficulty: "Easy", slug: "binary-tree-postorder-traversal", note: "Record after both children — the order for computing things bottom-up." },
    { id: 100, title: "Same Tree", difficulty: "Easy", slug: "same-tree", note: "A simultaneous preorder walk over two trees, comparing as you go." },
  ],
};

export default meta;
