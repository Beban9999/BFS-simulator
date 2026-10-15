import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "dynamic-array",
  title: "Dynamic Array: Amortized O(1) Append",
  category: "fundamentals",
  subcategory: "Big-O",
  difficulty: "core",
  order: 2,
  summary: "Append until the block is full, copy everything into a bigger one, repeat. Doubling makes the copies a geometric series — O(1) per append on average; growing by a constant does not.",
  keywords: ["amortized analysis", "dynamic array", "arraylist", "vector", "list append", "resize", "doubling", "capacity", "geometric growth"],
  problems: [
    { id: 707, title: "Design Linked List", difficulty: "Medium", slug: "design-linked-list", note: "Build the other list layout and compare: O(1) insert at a node, but O(n) to reach index i." },
    { id: 1381, title: "Design a Stack With Increment Operation", difficulty: "Medium", slug: "design-a-stack-with-increment-operation", note: "An array-backed stack; a lazy increment array keeps every operation O(1)." },
    { id: 155, title: "Min Stack", difficulty: "Medium", slug: "min-stack", note: "Stacks on dynamic arrays: push and pop are amortized O(1)." },
    { id: 641, title: "Design Circular Deque", difficulty: "Medium", slug: "design-circular-deque", note: "A fixed-capacity block used as a ring — no resizing, so every operation is O(1)." },
  ],
};

export default meta;
