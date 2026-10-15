import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "remove-nth-end",
  title: "Remove N-th Node From End",
  category: "linked-lists",
  subcategory: "Fast & slow",
  difficulty: "intermediate",
  order: 3,
  summary: "Give fast a head start of n + 1 nodes from a dummy; when fast falls off the end, slow sits right before the node to delete.",
  keywords: ["remove nth node from end", "gap pointers", "two pointers", "dummy node", "one pass"],
  problems: [
    { id: 19, title: "Remove Nth Node From End of List", difficulty: "Medium", slug: "remove-nth-node-from-end-of-list", note: "The one-pass gap technique shown here." },
    { id: 1721, title: "Swapping Nodes in a Linked List", difficulty: "Medium", slug: "swapping-nodes-in-a-linked-list", note: "Find the k-th node from the front and, with the same gap trick, the k-th from the end; swap values." },
    { id: 61, title: "Rotate List", difficulty: "Medium", slug: "rotate-list", note: "The new tail is the (k mod n + 1)-th node from the end; cut there and reattach." },
    { id: 2095, title: "Delete the Middle Node of a Linked List", difficulty: "Medium", slug: "delete-the-middle-node-of-a-linked-list", note: "Same \"stop one before the target, then skip it\" deletion, located with fast/slow." },
  ],
};

export default meta;
