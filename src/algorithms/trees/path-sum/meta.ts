import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "path-sum",
  title: "Root-to-Leaf Path Sum",
  category: "trees",
  subcategory: "Tree recursion",
  difficulty: "intermediate",
  order: 5,
  summary: "Carry the remaining target down the tree and the current path on a stack; at a leaf, check the remainder — then undo the step on the way back up.",
  keywords: ["path sum", "root to leaf", "backtracking", "remaining target", "top down", "binary tree paths"],
  problems: [
    { id: 112, title: "Path Sum", difficulty: "Easy", slug: "path-sum", note: "Just answer yes/no: any leaf where the remainder hits 0." },
    { id: 113, title: "Path Sum II", difficulty: "Medium", slug: "path-sum-ii", note: "This page: collect every matching root-to-leaf path." },
    { id: 257, title: "Binary Tree Paths", difficulty: "Easy", slug: "binary-tree-paths", note: "Same path stack; record every leaf's path as a string." },
    { id: 437, title: "Path Sum III", difficulty: "Medium", slug: "path-sum-iii", note: "Paths may start anywhere: prefix sums in a hash map while walking down." },
  ],
};

export default meta;
