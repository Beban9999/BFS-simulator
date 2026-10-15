import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "morris-inorder",
  title: "Morris Inorder Traversal (O(1) space)",
  category: "trees",
  subcategory: "Traversals",
  difficulty: "advanced",
  order: 4,
  summary: "No stack, no recursion: temporarily thread each inorder predecessor back to its successor, follow the thread, then remove it.",
  keywords: ["morris traversal", "threaded binary tree", "O(1) space traversal", "inorder predecessor", "constant space"],
  problems: [
    { id: 94, title: "Binary Tree Inorder Traversal", difficulty: "Easy", slug: "binary-tree-inorder-traversal", note: "The O(1)-extra-space answer to the follow-up." },
    { id: 99, title: "Recover Binary Search Tree", difficulty: "Medium", slug: "recover-binary-search-tree", note: "Find the two swapped nodes during an inorder walk; Morris makes it O(1) space." },
    { id: 538, title: "Convert BST to Greater Tree", difficulty: "Medium", slug: "convert-bst-to-greater-tree", note: "A reverse inorder (right, node, left) — also doable with mirrored Morris threads." },
  ],
};

export default meta;
