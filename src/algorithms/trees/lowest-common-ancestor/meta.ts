import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "lowest-common-ancestor",
  title: "Lowest Common Ancestor (BST & binary tree)",
  category: "trees",
  subcategory: "BST",
  difficulty: "intermediate",
  order: 6,
  summary: "BST: walk down while p and q are on the same side; the split point is the LCA. Any tree: the node where p and q come back from different subtrees.",
  keywords: ["lowest common ancestor", "lca", "split point", "bst lca", "binary tree lca"],
  problems: [
    { id: 235, title: "Lowest Common Ancestor of a Binary Search Tree", difficulty: "Medium", slug: "lowest-common-ancestor-of-a-binary-search-tree", note: "BST mode: compare both values with the node and walk down." },
    { id: 236, title: "Lowest Common Ancestor of a Binary Tree", difficulty: "Medium", slug: "lowest-common-ancestor-of-a-binary-tree", note: "Binary-tree mode: the first node where both sides report a find." },
    { id: 1650, title: "Lowest Common Ancestor of a Binary Tree III", difficulty: "Medium", slug: "lowest-common-ancestor-of-a-binary-tree-iii", note: "With parent pointers it becomes the intersection of two linked lists." },
    { id: 1123, title: "Lowest Common Ancestor of Deepest Leaves", difficulty: "Medium", slug: "lowest-common-ancestor-of-deepest-leaves", note: "Return (depth, lca) from each subtree; equal depths mean this node is the LCA." },
  ],
};

export default meta;
