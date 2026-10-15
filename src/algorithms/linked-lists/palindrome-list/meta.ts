import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "palindrome-list",
  title: "Palindrome Linked List",
  category: "linked-lists",
  subcategory: "Reversal",
  difficulty: "intermediate",
  order: 4,
  summary: "Find the middle with slow/fast pointers, reverse the second half, then compare the halves — O(n) time, O(1) space.",
  keywords: ["palindrome linked list", "slow fast", "reverse second half", "middle of list"],
  problems: [
    { id: 234, title: "Palindrome Linked List", difficulty: "Easy", slug: "palindrome-linked-list", note: "The O(1)-space follow-up is exactly middle + reverse + compare." },
    { id: 2130, title: "Maximum Twin Sum of a Linked List", difficulty: "Medium", slug: "maximum-twin-sum-of-a-linked-list", note: "Same three phases, but add mirrored pairs instead of comparing them." },
    { id: 143, title: "Reorder List", difficulty: "Medium", slug: "reorder-list", note: "Middle + reverse second half again; this time weave the halves together." },
  ],
};

export default meta;
