import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "reorder-list",
  title: "Reorder List",
  category: "linked-lists",
  subcategory: "Other",
  difficulty: "intermediate",
  order: 1,
  summary: "L0→Ln→L1→Ln−1→… in place: find the middle, reverse the second half, then weave the two halves together.",
  keywords: ["reorder list", "weave", "interleave", "middle reverse merge", "fold list"],
  problems: [
    { id: 143, title: "Reorder List", difficulty: "Medium", slug: "reorder-list", note: "The three building blocks — middle, reverse, weave — in sequence." },
    { id: 234, title: "Palindrome Linked List", difficulty: "Easy", slug: "palindrome-linked-list", note: "Same middle + reverse; then compare the halves instead of weaving them." },
    { id: 328, title: "Odd Even Linked List", difficulty: "Medium", slug: "odd-even-linked-list", note: "The opposite move: un-weave alternate nodes into two lists and join them." },
    { id: 2130, title: "Maximum Twin Sum of a Linked List", difficulty: "Medium", slug: "maximum-twin-sum-of-a-linked-list", note: "Pairs the same nodes this page weaves together (i with n−1−i)." },
  ],
};

export default meta;
