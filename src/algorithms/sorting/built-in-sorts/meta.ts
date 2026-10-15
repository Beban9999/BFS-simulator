import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "built-in-sorts",
  title: "Built-in Sorts (Timsort, Introsort, pdqsort…)",
  category: "sorting",
  subcategory: "In practice",
  difficulty: "intermediate",
  order: 2,
  kind: "note",
  summary: "What sort() actually runs in Python, JavaScript, Java, C++, C#, Go and Rust: the hybrid algorithm, whether it is stable, and the comparator gotchas.",
  keywords: ["timsort", "powersort", "introsort", "pdqsort", "dual-pivot quicksort", "driftsort", "ipnsort", "std::sort", "comparator", "library sort"],
  problems: [
    { id: 179, title: "Largest Number", difficulty: "Medium", slug: "largest-number", note: "A custom comparator (a+b vs b+a) — cmp_to_key in Python, a numeric return in JS." },
    { id: 56, title: "Merge Intervals", difficulty: "Medium", slug: "merge-intervals", note: "Sort by start with a key, then one linear sweep." },
    { id: 973, title: "K Closest Points to Origin", difficulty: "Medium", slug: "k-closest-points-to-origin", note: "Sorting by a computed key is O(n log n); nth_element / quickselect gets O(n) average." },
    { id: 1029, title: "Two City Scheduling", difficulty: "Medium", slug: "two-city-scheduling", note: "Sort by the cost difference, then take the first half for one city." },
  ],
};

export default meta;
