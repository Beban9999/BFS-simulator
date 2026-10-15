import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "queue-via-stacks",
  title: "Queue Using Two Stacks",
  category: "stacks-queues",
  subcategory: "Design",
  difficulty: "core",
  order: 2,
  summary: "Push into an inbox stack; pop from an outbox stack, refilling it by reversing the inbox only when it runs empty — amortized O(1).",
  keywords: ["queue using stacks", "two stacks", "amortized", "inbox outbox", "implement queue"],
  problems: [
    { id: 232, title: "Implement Queue using Stacks", difficulty: "Easy", slug: "implement-queue-using-stacks", note: "Exactly this inbox / outbox pair with lazy refills." },
    { id: 225, title: "Implement Stack using Queues", difficulty: "Easy", slug: "implement-stack-using-queues", note: "The mirror-image exercise (see the next page)." },
    { id: 155, title: "Min Stack", difficulty: "Medium", slug: "min-stack", note: "Combine with this page: two min-stacks give a queue with O(1) min." },
  ],
};

export default meta;
