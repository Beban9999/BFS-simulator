import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "good-nodes",
  title: "Count Good Nodes in a Binary Tree",
  category: "trees",
  subcategory: "Tree recursion",
  difficulty: "intermediate",
  order: 6,
  summary: "Pass the path maximum down, count up: a node is good when nothing above it on its root path is larger.",
  keywords: ["good nodes", "path maximum", "top down and bottom up", "dfs with state"],
  problems: [
    { id: 1448, title: "Count Good Nodes in Binary Tree", difficulty: "Medium", slug: "count-good-nodes-in-binary-tree", note: "This page: carry the max so far, add up the good counts." },
    { id: 1026, title: "Maximum Difference Between Node and Ancestor", difficulty: "Medium", slug: "maximum-difference-between-node-and-ancestor", note: "Carry both the path min and max down; compare at each node." },
    { id: 129, title: "Sum Root to Leaf Numbers", difficulty: "Medium", slug: "sum-root-to-leaf-numbers", note: "Carry the number built so far down, sum the leaves' numbers up." },
    { id: 1315, title: "Sum of Nodes with Even-Valued Grandparent", difficulty: "Medium", slug: "sum-of-nodes-with-even-valued-grandparent", note: "Pass the parent and grandparent values down as parameters." },
  ],
};

export default meta;
