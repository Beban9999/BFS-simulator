import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "reverse-list-recursive",
  title: "Reverse a Linked List (recursive)",
  category: "linked-lists",
  subcategory: "Reversal",
  difficulty: "core",
  order: 2,
  summary: "Reverse the rest of the list first, then hook the current node onto its end — watch the call stack unwind.",
  keywords: ["reverse linked list", "recursion", "call stack", "head.next.next"],
  problems: [
    { id: 206, title: "Reverse Linked List", difficulty: "Easy", slug: "reverse-linked-list", note: "The follow-up asks for both versions; this is the recursive one." },
    { id: 24, title: "Swap Nodes in Pairs", difficulty: "Medium", slug: "swap-nodes-in-pairs", note: "Same shape of recursion: solve the rest, then fix up the first two nodes." },
    { id: 92, title: "Reverse Linked List II", difficulty: "Medium", slug: "reverse-linked-list-ii", note: "A recursive variant reverses the first n nodes and remembers the node after them." },
  ],
};

export default meta;
