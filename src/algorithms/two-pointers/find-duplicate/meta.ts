import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "find-duplicate",
  title: "Fast & Slow Pointers (Find the Duplicate Number)",
  category: "two-pointers",
  subcategory: "Fast & slow",
  difficulty: "intermediate",
  order: 1,
  summary: "Treat i → nums[i] as a linked list; the duplicate value is where the cycle begins, found with Floyd's tortoise and hare.",
  keywords: ["floyd", "tortoise and hare", "cycle detection", "find duplicate", "fast slow", "linked list cycle ii"],
  problems: [
    { id: 287, title: "Find the Duplicate Number", difficulty: "Medium", slug: "find-the-duplicate-number", note: "This page: values are next-pointers; the cycle entrance is the duplicate." },
    { id: 141, title: "Linked List Cycle", difficulty: "Easy", slug: "linked-list-cycle", note: "Phase 1 only: do slow and fast meet?" },
    { id: 142, title: "Linked List Cycle II", difficulty: "Medium", slug: "linked-list-cycle-ii", note: "Both phases: reset one pointer to the head to find the entrance." },
    { id: 202, title: "Happy Number", difficulty: "Easy", slug: "happy-number", note: "Implicit sequence; detect a cycle that isn't 1." },
  ],
};

export default meta;
