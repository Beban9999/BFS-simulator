import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "copy-random-list",
  title: "Copy List with Random Pointer",
  category: "linked-lists",
  subcategory: "Other",
  difficulty: "advanced",
  order: 2,
  summary: "Deep-copy a list whose nodes also point at random nodes — with an old→new hash map, or by weaving copies between the originals.",
  keywords: ["copy list with random pointer", "deep copy", "clone", "hash map", "interleave", "weave"],
  problems: [
    { id: 138, title: "Copy List with Random Pointer", difficulty: "Medium", slug: "copy-list-with-random-pointer", note: "Both approaches on this page: old→new map, or interleaved copies for O(1) space." },
    { id: 133, title: "Clone Graph", difficulty: "Medium", slug: "clone-graph", note: "Same old→new map idea on a graph; create a clone the first time a node is seen." },
    { id: 1485, title: "Clone Binary Tree With Random Pointer", difficulty: "Medium", slug: "clone-binary-tree-with-random-pointer", note: "The map approach applied to a tree: clone structure first, then wire random links." },
  ],
};

export default meta;
