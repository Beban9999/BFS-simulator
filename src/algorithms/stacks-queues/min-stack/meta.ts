import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "min-stack",
  title: "Min Stack",
  category: "stacks-queues",
  subcategory: "Design",
  difficulty: "core",
  order: 1,
  summary: "A second stack remembers the minimum at every depth, so push, pop, top and getMin are all O(1).",
  keywords: ["min stack", "getMin", "auxiliary stack", "stack with minimum", "max stack"],
  problems: [
    { id: 155, title: "Min Stack", difficulty: "Medium", slug: "min-stack", note: "Exactly this: a main stack plus a stack of minimums." },
    { id: 716, title: "Max Stack", difficulty: "Hard", slug: "max-stack", note: "Peeking the max is the same trick; popMax needs more (a heap or sorted list with lazy deletion)." },
    { id: 1381, title: "Design a Stack With Increment Operation", difficulty: "Medium", slug: "design-a-stack-with-increment-operation", note: "Another \"remember extra info per depth\" stack: store pending increments and apply them on pop." },
    { id: 901, title: "Online Stock Span", difficulty: "Medium", slug: "online-stock-span", note: "A stack that keeps aggregated info (span counts) alongside each value." },
  ],
};

export default meta;
