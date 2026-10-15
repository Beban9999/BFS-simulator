import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "big-o",
  title: "Big-O Growth",
  category: "fundamentals",
  subcategory: "Big-O",
  difficulty: "core",
  order: 1,
  kind: "note",
  summary: "Seven complexity classes on one chart with an n slider and a log axis, plus how many operations — and how many seconds — each costs at real input sizes.",
  keywords: ["big o", "time complexity", "asymptotic", "growth rate", "log n", "n log n", "exponential", "factorial", "complexity chart"],
  problems: [
    { id: 1, title: "Two Sum", difficulty: "Easy", slug: "two-sum", note: "The classic O(n²) → O(n) upgrade: trade nested loops for a hash map." },
    { id: 704, title: "Binary Search", difficulty: "Easy", slug: "binary-search", note: "O(log n): about 30 steps even for a billion elements." },
    { id: 217, title: "Contains Duplicate", difficulty: "Easy", slug: "contains-duplicate", note: "Compare O(n²) pairs, O(n log n) sort, and O(n) set — same answer, three classes." },
    { id: 78, title: "Subsets", difficulty: "Medium", slug: "subsets", note: "The output alone has 2ⁿ entries, so no algorithm can beat O(2ⁿ)." },
  ],
};

export default meta;
