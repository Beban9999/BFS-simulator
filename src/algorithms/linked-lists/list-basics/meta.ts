import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "list-basics",
  title: "Linked List Basics",
  category: "linked-lists",
  subcategory: "Basics",
  difficulty: "core",
  order: 1,
  summary: "Search, insert and delete by position in a singly or doubly linked list — walk to the node before, then re-wire a few pointers.",
  keywords: ["linked list", "singly linked", "doubly linked", "insert", "delete", "traverse", "search", "node"],
  problems: [
    { id: 707, title: "Design Linked List", difficulty: "Medium", slug: "design-linked-list", note: "Implement get / add-at-index / delete-at-index — the operations on this page." },
    { id: 203, title: "Remove Linked List Elements", difficulty: "Easy", slug: "remove-linked-list-elements", note: "Delete every node with a given value; a dummy head avoids the head special case." },
    { id: 237, title: "Delete Node in a Linked List", difficulty: "Medium", slug: "delete-node-in-a-linked-list", note: "No access to the previous node: copy the next value over and delete the next node instead." },
    { id: 83, title: "Remove Duplicates from Sorted List", difficulty: "Easy", slug: "remove-duplicates-from-sorted-list", note: "Walk once and bypass a node whenever it repeats the previous value." },
  ],
};

export default meta;
