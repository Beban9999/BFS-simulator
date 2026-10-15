import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "top-k",
  title: "Top-K with a Heap (k-th largest)",
  category: "heaps",
  subcategory: "Patterns",
  difficulty: "core",
  order: 1,
  summary: "Keep a min-heap of size k: its root is the weakest of the k best so far, and anything bigger replaces it — O(n log k).",
  keywords: ["top k", "kth largest", "k largest", "min heap of size k", "heapreplace", "selection"],
  problems: [
    { id: 215, title: "Kth Largest Element in an Array", difficulty: "Medium", slug: "kth-largest-element-in-an-array", note: "This page; quickselect is the O(n)-average alternative." },
    { id: 347, title: "Top K Frequent Elements", difficulty: "Medium", slug: "top-k-frequent-elements", note: "Count first, then keep a size-k min-heap keyed by frequency." },
    { id: 973, title: "K Closest Points to Origin", difficulty: "Medium", slug: "k-closest-points-to-origin", note: "Top-k smallest distances: a size-k MAX-heap whose root is the farthest kept point." },
    { id: 703, title: "Kth Largest Element in a Stream", difficulty: "Easy", slug: "kth-largest-element-in-a-stream", note: "The same heap, kept alive across calls." },
  ],
};

export default meta;
