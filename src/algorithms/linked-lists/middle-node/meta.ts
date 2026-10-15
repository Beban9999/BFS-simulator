import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "middle-node",
  title: "Middle of the Linked List",
  category: "linked-lists",
  subcategory: "Fast & slow",
  difficulty: "core",
  order: 2,
  summary: "Fast moves two nodes for every one of slow, so slow is halfway when fast reaches the end — one pass, no length needed.",
  keywords: ["middle of linked list", "slow fast pointers", "tortoise hare", "split list"],
  problems: [
    { id: 876, title: "Middle of the Linked List", difficulty: "Easy", slug: "middle-of-the-linked-list", note: "Exactly this loop; for even lengths it returns the second middle." },
    { id: 2095, title: "Delete the Middle Node of a Linked List", difficulty: "Medium", slug: "delete-the-middle-node-of-a-linked-list", note: "Start fast one jump ahead so slow stops just before the middle, then unlink it." },
    { id: 148, title: "Sort List", difficulty: "Medium", slug: "sort-list", note: "Merge sort splits the list at the middle found this way." },
    { id: 109, title: "Convert Sorted List to Binary Search Tree", difficulty: "Medium", slug: "convert-sorted-list-to-binary-search-tree", note: "The middle node becomes the root; recurse on the two halves." },
  ],
};

export default meta;
