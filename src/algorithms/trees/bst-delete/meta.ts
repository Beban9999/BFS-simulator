import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "bst-delete",
  title: "BST Delete (3 cases)",
  category: "trees",
  subcategory: "BST",
  difficulty: "intermediate",
  order: 2,
  summary: "Leaf: just remove it. One child: splice the child into its place. Two children: copy in the inorder successor, then delete that successor below.",
  keywords: ["bst delete", "delete node", "inorder successor", "three cases", "binary search tree"],
  problems: [
    { id: 450, title: "Delete Node in a BST", difficulty: "Medium", slug: "delete-node-in-a-bst", note: "Exactly the three cases on this page." },
    { id: 669, title: "Trim a Binary Search Tree", difficulty: "Medium", slug: "trim-a-binary-search-tree", note: "Delete whole out-of-range subtrees by returning the side that survives." },
    { id: 1110, title: "Delete Nodes And Return Forest", difficulty: "Medium", slug: "delete-nodes-and-return-forest", note: "Deleting arbitrary nodes in a plain tree; children of deleted nodes become new roots." },
  ],
};

export default meta;
