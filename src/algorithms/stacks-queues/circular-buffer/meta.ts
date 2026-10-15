import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "circular-buffer",
  title: "Circular Buffer (Ring Queue)",
  category: "stacks-queues",
  subcategory: "Basics",
  difficulty: "core",
  order: 2,
  summary: "A fixed array used as a ring: head and count locate the queue, and indexes wrap around with modulo — every operation O(1), no shifting.",
  keywords: ["circular queue", "ring buffer", "circular buffer", "modulo", "bounded queue", "design circular queue"],
  problems: [
    { id: 622, title: "Design Circular Queue", difficulty: "Medium", slug: "design-circular-queue", note: "Exactly this class: head + count over a fixed array with modulo." },
    { id: 641, title: "Design Circular Deque", difficulty: "Medium", slug: "design-circular-deque", note: "Same ring, but the front can also move backwards: (head - 1 + k) % k." },
    { id: 346, title: "Moving Average from Data Stream", difficulty: "Easy", slug: "moving-average-from-data-stream", note: "A ring of the last k values plus a running sum; overwrite the oldest slot." },
    { id: 1381, title: "Design a Stack With Increment Operation", difficulty: "Medium", slug: "design-a-stack-with-increment-operation", note: "Another bounded structure on a fixed array — here used as a stack with a size limit." },
  ],
};

export default meta;
