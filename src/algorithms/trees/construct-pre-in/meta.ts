import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "construct-pre-in",
  title: "Build a Tree from Preorder + Inorder",
  category: "trees",
  subcategory: "Construction",
  difficulty: "intermediate",
  order: 1,
  summary: "Preorder says which value is the root; its position in inorder splits the remaining values into the left and right subtrees. Recurse on both halves.",
  keywords: ["construct binary tree", "preorder inorder", "rebuild tree", "divide and conquer", "hash map index"],
  problems: [
    { id: 105, title: "Construct Binary Tree from Preorder and Inorder Traversal", difficulty: "Medium", slug: "construct-binary-tree-from-preorder-and-inorder-traversal", note: "This page: next preorder value = root, inorder position = split." },
    { id: 106, title: "Construct Binary Tree from Inorder and Postorder Traversal", difficulty: "Medium", slug: "construct-binary-tree-from-inorder-and-postorder-traversal", note: "Read postorder from the back and build the right subtree first." },
    { id: 889, title: "Construct Binary Tree from Preorder and Postorder Traversal", difficulty: "Medium", slug: "construct-binary-tree-from-preorder-and-postorder-traversal", note: "No inorder: the left child's postorder position sizes the left subtree (not unique in general)." },
    { id: 1008, title: "Construct Binary Search Tree from Preorder Traversal", difficulty: "Medium", slug: "construct-binary-search-tree-from-preorder-traversal", note: "For a BST, sorted order is the inorder — or use value bounds directly." },
  ],
};

export default meta;
