import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "monotonic-stack",
  title: "Monotonic Stack (Daily Temperatures)",
  category: "stacks-queues",
  subcategory: "Monotonic",
  difficulty: "intermediate",
  order: 1,
  summary: "Keep indexes whose values decrease from bottom to top; a bigger value pops — and answers — everyone smaller than it. O(n) next-greater queries.",
  keywords: ["monotonic stack", "next greater element", "daily temperatures", "decreasing stack", "next warmer day", "monotonic queue"],
  problems: [
    { id: 739, title: "Daily Temperatures", difficulty: "Medium", slug: "daily-temperatures", note: "This page: distance to the next strictly greater value." },
    { id: 496, title: "Next Greater Element I", difficulty: "Easy", slug: "next-greater-element-i", note: "Same pass over nums2, storing each popped value's answer in a map." },
    { id: 503, title: "Next Greater Element II", difficulty: "Medium", slug: "next-greater-element-ii", note: "Circular array: run the loop over 2n indexes (i % n)." },
    { id: 901, title: "Online Stock Span", difficulty: "Medium", slug: "online-stock-span", note: "Previous greater element, streamed: pop smaller-or-equal prices and add up their spans." },
    { id: 84, title: "Largest Rectangle in Histogram", difficulty: "Hard", slug: "largest-rectangle-in-histogram", note: "An increasing stack; popping gives each bar's left and right limits." },
  ],
};

export default meta;
