import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "inorder-successor",
  title: "Inorder Successor in a BST",
  category: "trees",
  subcategory: "BST",
  difficulty: "intermediate",
  order: 5,
  summary: "Walk down from the root: every node bigger than p is a candidate, so remember it and go left for a smaller one; otherwise go right. O(h), no parent pointers.",
  keywords: ["inorder successor", "next larger", "ceiling", "bst", "floor and ceiling"],
  problems: [
    { id: 285, title: "Inorder Successor in BST", difficulty: "Medium", slug: "inorder-successor-in-bst", note: "This page: candidate-tracking walk from the root." },
    { id: 510, title: "Inorder Successor in BST II", difficulty: "Medium", slug: "inorder-successor-in-bst-ii", note: "With parent pointers: leftmost of the right subtree, or climb until you come from a left child." },
    { id: 701, title: "Insert into a Binary Search Tree", difficulty: "Medium", slug: "insert-into-a-binary-search-tree", note: "The same left/right walk, ending at an empty spot." },
    { id: 270, title: "Closest Binary Search Tree Value", difficulty: "Easy", slug: "closest-binary-search-tree-value", note: "Track the best candidate on both sides while walking down." },
  ],
};

export default meta;
