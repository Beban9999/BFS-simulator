import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "avl-insert",
  title: "AVL Tree Insert (rotations)",
  category: "trees",
  subcategory: "Self-balancing",
  difficulty: "advanced",
  order: 1,
  summary: "Insert like a BST, then walk back up fixing heights; any node whose subtrees differ by 2 is repaired with one or two rotations (LL, RR, LR, RL).",
  keywords: ["avl tree", "rotation", "self-balancing", "balance factor", "left rotation", "right rotation", "LL RR LR RL"],
  problems: [
    { id: 1382, title: "Balance a Binary Search Tree", difficulty: "Medium", slug: "balance-a-binary-search-tree", note: "Offline rebalancing; AVL keeps the tree balanced online, insert by insert." },
    { id: 110, title: "Balanced Binary Tree", difficulty: "Easy", slug: "balanced-binary-tree", note: "The exact property AVL maintains at every node." },
    { id: 108, title: "Convert Sorted Array to Binary Search Tree", difficulty: "Easy", slug: "convert-sorted-array-to-binary-search-tree", note: "Building a balanced BST all at once instead of by rotations." },
    { id: 729, title: "My Calendar I", difficulty: "Medium", slug: "my-calendar-i", note: "Needs an ordered set with O(log n) inserts — what balanced trees (AVL, red-black) provide." },
  ],
};

export default meta;
