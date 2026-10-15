import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "list-cycle",
  title: "Linked List Cycle (Floyd)",
  category: "linked-lists",
  subcategory: "Fast & slow",
  difficulty: "intermediate",
  order: 1,
  summary: "Tortoise and hare: a fast pointer laps a slow one only if there is a cycle; restarting one at the head finds where it begins.",
  keywords: ["floyd cycle detection", "tortoise and hare", "linked list cycle", "cycle start", "fast slow pointers"],
  problems: [
    { id: 141, title: "Linked List Cycle", difficulty: "Easy", slug: "linked-list-cycle", note: "Phase 1 only: do slow and fast ever meet?" },
    { id: 142, title: "Linked List Cycle II", difficulty: "Medium", slug: "linked-list-cycle-ii", note: "Both phases: after the meeting, restart one pointer at the head to find the entry node." },
    { id: 287, title: "Find the Duplicate Number", difficulty: "Medium", slug: "find-the-duplicate-number", note: "Treat i → nums[i] as a list; the duplicate is the cycle entry." },
    { id: 202, title: "Happy Number", difficulty: "Easy", slug: "happy-number", note: "The digit-square sequence either reaches 1 or loops — detect the loop with fast/slow." },
  ],
};

export default meta;
