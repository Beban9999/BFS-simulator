import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "stack-via-queues",
  title: "Stack Using a Queue",
  category: "stacks-queues",
  subcategory: "Design",
  difficulty: "core",
  order: 3,
  summary: "After each push, rotate the queue so the new item is at the front: pop and top become plain queue operations, push costs O(n).",
  keywords: ["stack using queues", "rotate queue", "implement stack", "one queue"],
  problems: [
    { id: 225, title: "Implement Stack using Queues", difficulty: "Easy", slug: "implement-stack-using-queues", note: "This page: one queue, rotated after every push (the follow-up asks for one queue)." },
    { id: 232, title: "Implement Queue using Stacks", difficulty: "Easy", slug: "implement-queue-using-stacks", note: "The mirror exercise — and there the cost can be amortized to O(1)." },
    { id: 1823, title: "Find the Winner of the Circular Game", difficulty: "Medium", slug: "find-the-winner-of-the-circular-game", note: "Same rotate-the-queue move: send k−1 friends to the back, remove the k-th." },
  ],
};

export default meta;
