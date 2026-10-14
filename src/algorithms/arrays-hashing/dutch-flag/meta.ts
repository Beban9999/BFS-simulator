import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "dutch-flag",
  title: "Dutch National Flag (3-way partition)",
  category: "arrays-hashing",
  subcategory: "In-place",
  difficulty: "core",
  order: 1,
  summary: "Sort 0s, 1s and 2s in one pass with three pointers: low grows the 0 zone, high grows the 2 zone, mid scans.",
  keywords: ["sort colors", "three way partition", "dijkstra", "low mid high", "in place"],
  problems: [
    { id: 75, title: "Sort Colors", difficulty: "Medium", slug: "sort-colors", note: "This exact one-pass, three-pointer partition." },
    { id: 905, title: "Sort Array By Parity", difficulty: "Easy", slug: "sort-array-by-parity", note: "The two-way version: evens to the front, odds to the back." },
    { id: 2161, title: "Partition Array According to Given Pivot", difficulty: "Medium", slug: "partition-array-according-to-given-pivot", note: "Three groups (< pivot, = pivot, > pivot), but order must be kept." },
    { id: 215, title: "Kth Largest Element in an Array", difficulty: "Medium", slug: "kth-largest-element-in-an-array", note: "3-way partitioning makes quickselect robust to many duplicates." },
  ],
};

export default meta;
