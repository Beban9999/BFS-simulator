import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "serialize-tree",
  title: "Serialize & Deserialize a Binary Tree",
  category: "trees",
  subcategory: "Construction",
  difficulty: "advanced",
  order: 2,
  summary: "Write the tree in preorder with a marker for every missing child; reading the tokens back in the same preorder rebuilds the exact shape.",
  keywords: ["serialize", "deserialize", "encode tree", "preorder with nulls", "codec", "string to tree"],
  problems: [
    { id: 297, title: "Serialize and Deserialize Binary Tree", difficulty: "Hard", slug: "serialize-and-deserialize-binary-tree", note: "This page: preorder with \"#\" markers, then a recursive reader." },
    { id: 449, title: "Serialize and Deserialize BST", difficulty: "Medium", slug: "serialize-and-deserialize-bst", note: "A BST needs no null markers: plain preorder plus value bounds is enough." },
    { id: 652, title: "Find Duplicate Subtrees", difficulty: "Medium", slug: "find-duplicate-subtrees", note: "Serialize every subtree and count identical strings in a hash map." },
    { id: 331, title: "Verify Preorder Serialization of a Binary Tree", difficulty: "Medium", slug: "verify-preorder-serialization-of-a-binary-tree", note: "Count open child slots while reading the same token format." },
  ],
};

export default meta;
