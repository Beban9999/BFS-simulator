import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "reverse-list",
  title: "Reverse a Linked List (iterative)",
  category: "linked-lists",
  subcategory: "Reversal",
  difficulty: "core",
  order: 1,
  summary: "Walk the list once with prev / curr / next and flip every arrow — O(n) time, O(1) space.",
  keywords: ["reverse linked list", "prev curr next", "pointer reversal", "in place"],
  problems: [
    { id: 206, title: "Reverse Linked List", difficulty: "Easy", slug: "reverse-linked-list", note: "The exact three-pointer loop shown here." },
    { id: 92, title: "Reverse Linked List II", difficulty: "Medium", slug: "reverse-linked-list-ii", note: "Same loop on a sub-range only; keep the node before the range to reconnect both ends." },
    { id: 234, title: "Palindrome Linked List", difficulty: "Easy", slug: "palindrome-linked-list", note: "Reverse the second half, then walk both halves side by side." },
    { id: 25, title: "Reverse Nodes in k-Group", difficulty: "Hard", slug: "reverse-nodes-in-k-group", note: "Run this reversal on each block of k nodes and stitch the blocks together." },
  ],
};

export default meta;
