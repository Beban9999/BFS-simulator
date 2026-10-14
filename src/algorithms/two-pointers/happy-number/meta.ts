import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "happy-number",
  title: "Happy Number (cycle in an implicit sequence)",
  category: "two-pointers",
  subcategory: "Fast & slow",
  difficulty: "core",
  order: 2,
  summary: "Repeatedly replace n by the sum of the squares of its digits; fast & slow pointers tell whether you reach 1 or loop forever.",
  keywords: ["happy number", "digit square sum", "cycle detection", "floyd", "implicit linked list"],
  problems: [
    { id: 202, title: "Happy Number", difficulty: "Easy", slug: "happy-number", note: "This page: Floyd on the sequence n → sum of squared digits." },
    { id: 287, title: "Find the Duplicate Number", difficulty: "Medium", slug: "find-the-duplicate-number", note: "Same cycle-finding idea on index → value links." },
    { id: 141, title: "Linked List Cycle", difficulty: "Easy", slug: "linked-list-cycle", note: "The explicit-list version." },
    { id: 258, title: "Add Digits", difficulty: "Easy", slug: "add-digits", note: "Another digit-transform sequence (with a closed-form answer)." },
  ],
};

export default meta;
