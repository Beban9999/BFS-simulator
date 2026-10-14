import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "longest-consecutive",
  title: "Longest Consecutive Sequence (hash set)",
  category: "arrays-hashing",
  subcategory: "Hashing",
  difficulty: "intermediate",
  order: 4,
  summary: "Put every value in a set; only start counting from values whose predecessor is missing, so each run is walked once.",
  keywords: ["consecutive", "streak", "hash set", "sequence start", "O(n)"],
  problems: [
    { id: 128, title: "Longest Consecutive Sequence", difficulty: "Medium", slug: "longest-consecutive-sequence", note: "Only extend from run starts (x − 1 not in the set)." },
    { id: 2274, title: "Maximum Consecutive Floors Without Special Floors", difficulty: "Medium", slug: "maximum-consecutive-floors-without-special-floors", note: "Sort the blocked floors and measure the gaps between them." },
    { id: 2501, title: "Longest Square Streak in an Array", difficulty: "Medium", slug: "longest-square-streak-in-an-array", note: "Same set trick with x → x² instead of x → x + 1." },
  ],
};

export default meta;
