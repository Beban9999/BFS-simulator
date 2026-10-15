import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "max-depth",
  title: "Maximum Depth of a Binary Tree",
  category: "trees",
  subcategory: "Tree recursion",
  difficulty: "core",
  order: 1,
  summary: "The depth of a tree is 1 + the deeper of its two subtrees — the simplest \"ask both children, combine\" recursion.",
  keywords: ["max depth", "height of tree", "tree recursion", "postorder", "bottom up"],
  problems: [
    { id: 104, title: "Maximum Depth of Binary Tree", difficulty: "Easy", slug: "maximum-depth-of-binary-tree", note: "Exactly this: 1 + max(left, right)." },
    { id: 111, title: "Minimum Depth of Binary Tree", difficulty: "Easy", slug: "minimum-depth-of-binary-tree", note: "Careful: a missing child is not a leaf — only take min over children that exist (or BFS)." },
    { id: 559, title: "Maximum Depth of N-ary Tree", difficulty: "Easy", slug: "maximum-depth-of-n-ary-tree", note: "Same recursion over a list of children." },
    { id: 543, title: "Diameter of Binary Tree", difficulty: "Easy", slug: "diameter-of-binary-tree", note: "Uses these heights to measure the longest path through each node." },
  ],
};

export default meta;
