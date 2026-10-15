import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "quickselect",
  title: "Quickselect (Kth Largest)",
  category: "sorting",
  subcategory: "Selection",
  difficulty: "core",
  order: 1,
  summary: "Partition like quick sort, but keep only the side that contains the target index — the k-th largest in O(n) on average.",
  keywords: ["quickselect", "kth largest", "kth smallest", "order statistic", "partition", "hoare selection", "top k"],
  problems: [
    { id: 215, title: "Kth Largest Element in an Array", difficulty: "Medium", slug: "kth-largest-element-in-an-array", note: "The textbook quickselect: target index n − k in ascending order." },
    { id: 973, title: "K Closest Points to Origin", difficulty: "Medium", slug: "k-closest-points-to-origin", note: "Quickselect on squared distance puts the k closest in the first k slots (any order)." },
    { id: 347, title: "Top K Frequent Elements", difficulty: "Medium", slug: "top-k-frequent-elements", note: "Quickselect over (value, count) pairs by count, or use buckets." },
    { id: 324, title: "Wiggle Sort II", difficulty: "Medium", slug: "wiggle-sort-ii", note: "Find the median with quickselect, then three-way partition around it." },
  ],
};

export default meta;
