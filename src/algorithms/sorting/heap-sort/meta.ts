import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "heap-sort",
  title: "Heap Sort",
  category: "sorting",
  subcategory: "Heap-based",
  difficulty: "intermediate",
  order: 1,
  summary: "Turn the array into a max-heap, then repeatedly swap the max to the end and sift the new root down — O(n log n) in place.",
  keywords: ["heap sort", "heapify", "sift down", "max heap", "binary heap", "in place", "O(n log n)"],
  problems: [
    { id: 912, title: "Sort an Array", difficulty: "Medium", slug: "sort-an-array", note: "Guaranteed O(n log n) with O(1) extra space — no bad-pivot case." },
    { id: 215, title: "Kth Largest Element in an Array", difficulty: "Medium", slug: "kth-largest-element-in-an-array", note: "Build a heap and pop k times, or keep a size-k min-heap." },
    { id: 1046, title: "Last Stone Weight", difficulty: "Easy", slug: "last-stone-weight", note: "Repeatedly take the two largest values — the extract-max loop of heap sort." },
    { id: 973, title: "K Closest Points to Origin", difficulty: "Medium", slug: "k-closest-points-to-origin", note: "A bounded heap keeps only the k best candidates." },
  ],
};

export default meta;
