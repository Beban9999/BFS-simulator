import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "two-sum-hash",
  title: "Two Sum (hash map lookup)",
  category: "arrays-hashing",
  subcategory: "Hashing",
  difficulty: "core",
  order: 2,
  summary: "One pass with a hash map from value to index: for each number, look up its complement before storing it.",
  keywords: ["two sum", "complement", "hash map", "dictionary", "lookup", "seen", "hash set"],
  problems: [
    { id: 1, title: "Two Sum", difficulty: "Easy", slug: "two-sum", note: "Map value → index; check target − x before inserting x." },
    { id: 217, title: "Contains Duplicate", difficulty: "Easy", slug: "contains-duplicate", note: "Same idea with a set: have I seen this exact value before?" },
    { id: 219, title: "Contains Duplicate II", difficulty: "Easy", slug: "contains-duplicate-ii", note: "Map value → last index and compare the distance to k." },
    { id: 1679, title: "Max Number of K-Sum Pairs", difficulty: "Medium", slug: "max-number-of-k-sum-pairs", note: "Count map of unmatched values; consume a complement when one is waiting." },
  ],
};

export default meta;
