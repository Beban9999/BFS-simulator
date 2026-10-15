import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "level-order",
  title: "Level Order Traversal (BFS) & Zigzag",
  category: "trees",
  subcategory: "Traversals",
  difficulty: "core",
  order: 3,
  summary: "Breadth-first with a queue, one level at a time: the queue's length at the start of a round is exactly the size of that level.",
  keywords: ["level order", "bfs", "breadth first", "zigzag", "queue", "tree levels", "right side view"],
  problems: [
    { id: 102, title: "Binary Tree Level Order Traversal", difficulty: "Medium", slug: "binary-tree-level-order-traversal", note: "This page: snapshot the queue length to process one level per round." },
    { id: 103, title: "Binary Tree Zigzag Level Order Traversal", difficulty: "Medium", slug: "binary-tree-zigzag-level-order-traversal", note: "Same BFS; reverse every second level (or fill it from the back)." },
    { id: 199, title: "Binary Tree Right Side View", difficulty: "Medium", slug: "binary-tree-right-side-view", note: "Keep only the last node of each level." },
    { id: 637, title: "Average of Levels in Binary Tree", difficulty: "Easy", slug: "average-of-levels-in-binary-tree", note: "Sum each level while it is processed." },
  ],
};

export default meta;
