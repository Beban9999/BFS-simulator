import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "stack-queue-ops",
  title: "Stack, Queue & Deque Operations",
  category: "stacks-queues",
  subcategory: "Basics",
  difficulty: "core",
  order: 1,
  summary: "Run push / pop / peek on a stack (LIFO), a queue (FIFO) or a deque (both ends) and see which item each operation touches.",
  keywords: ["stack", "queue", "deque", "LIFO", "FIFO", "push", "pop", "peek", "enqueue", "dequeue", "double-ended queue"],
  problems: [
    { id: 1047, title: "Remove All Adjacent Duplicates In String", difficulty: "Easy", slug: "remove-all-adjacent-duplicates-in-string", note: "Stack of kept characters: pop when the new one equals the top." },
    { id: 933, title: "Number of Recent Calls", difficulty: "Easy", slug: "number-of-recent-calls", note: "Queue of timestamps; drop from the front whatever is too old." },
    { id: 641, title: "Design Circular Deque", difficulty: "Medium", slug: "design-circular-deque", note: "Implement both-ends push/pop yourself on a fixed array." },
    { id: 71, title: "Simplify Path", difficulty: "Medium", slug: "simplify-path", note: "Stack of directory names: push names, pop on \"..\"." },
  ],
};

export default meta;
