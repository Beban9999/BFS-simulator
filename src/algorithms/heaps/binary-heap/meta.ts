import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "binary-heap",
  title: "Binary Heap (min-heap)",
  category: "heaps",
  subcategory: "Binary heap",
  difficulty: "core",
  order: 1,
  summary: "A complete binary tree stored in an array: build-heap in O(n), push with sift-up and pop with sift-down in O(log n) — tree and array side by side.",
  keywords: ["binary heap", "min heap", "priority queue", "sift up", "sift down", "heapify", "build heap", "heapq"],
  problems: [
    { id: 1046, title: "Last Stone Weight", difficulty: "Easy", slug: "last-stone-weight", note: "Pop the two heaviest, push back the difference — a max-heap (negate values for heapq)." },
    { id: 703, title: "Kth Largest Element in a Stream", difficulty: "Easy", slug: "kth-largest-element-in-a-stream", note: "Keep a min-heap of size k; its root is the answer after every add." },
    { id: 1962, title: "Remove Stones to Minimize the Total", difficulty: "Medium", slug: "remove-stones-to-minimize-the-total", note: "Repeatedly pop the largest pile, halve it and push it back." },
    { id: 912, title: "Sort an Array", difficulty: "Medium", slug: "sort-an-array", note: "Heap sort: build a heap, then pop n times." },
  ],
};

export default meta;
