import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "kth-smallest-bst",
  title: "Kth Smallest Element in a BST",
  category: "trees",
  subcategory: "BST",
  difficulty: "intermediate",
  order: 4,
  summary: "An inorder walk of a BST yields values in sorted order — run it iteratively and stop at the k-th pop: O(h + k).",
  keywords: ["kth smallest", "bst inorder", "order statistic", "iterative inorder", "early stop"],
  problems: [
    { id: 230, title: "Kth Smallest Element in a BST", difficulty: "Medium", slug: "kth-smallest-element-in-a-bst", note: "This page; the follow-up (frequent queries) stores subtree sizes in each node." },
    { id: 173, title: "Binary Search Tree Iterator", difficulty: "Medium", slug: "binary-search-tree-iterator", note: "The same stack, paused between next() calls." },
    { id: 530, title: "Minimum Absolute Difference in BST", difficulty: "Easy", slug: "minimum-absolute-difference-in-bst", note: "Inorder gives sorted values; compare neighbours." },
    { id: 653, title: "Two Sum IV - Input is a BST", difficulty: "Easy", slug: "two-sum-iv-input-is-a-bst", note: "Two inorder iterators (ascending and descending) act as two pointers." },
  ],
};

export default meta;
