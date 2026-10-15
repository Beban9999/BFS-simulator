import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "two-heaps-median",
  title: "Two Heaps: Median of a Stream",
  category: "heaps",
  subcategory: "Patterns",
  difficulty: "advanced",
  order: 2,
  summary: "A max-heap holds the smaller half and a min-heap the larger half; their roots straddle the middle, so the median is always O(1) away.",
  keywords: ["two heaps", "median of data stream", "running median", "max heap min heap", "balance"],
  problems: [
    { id: 295, title: "Find Median from Data Stream", difficulty: "Hard", slug: "find-median-from-data-stream", note: "This exact class: push through low, move its max to high, rebalance." },
    { id: 480, title: "Sliding Window Median", difficulty: "Hard", slug: "sliding-window-median", note: "Two heaps plus lazy deletion of values that leave the window." },
    { id: 502, title: "IPO", difficulty: "Hard", slug: "ipo", note: "Two heaps again: affordable projects move from a min-heap by cost to a max-heap by profit." },
    { id: 2102, title: "Sequentially Ordinal Rank Tracker", difficulty: "Hard", slug: "sequentially-ordinal-rank-tracker", note: "Keep the best i items in one heap and the rest in the other; the boundary moves by one per query." },
  ],
};

export default meta;
