import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "combinations",
  title: "Combinations (n choose k)",
  category: "backtracking",
  subcategory: "Subsets & permutations",
  difficulty: "core",
  order: 3,
  summary: "Pick numbers in increasing order and stop at size k; prune a branch as soon as too few numbers remain to fill it.",
  keywords: ["combinations", "n choose k", "binomial", "backtracking", "pruning", "start index"],
  problems: [
    { id: 77, title: "Combinations", difficulty: "Medium", slug: "combinations", note: "This page: subsets of exactly size k, with the 'not enough left' cut." },
    { id: 216, title: "Combination Sum III", difficulty: "Medium", slug: "combination-sum-iii", note: "k numbers from 1–9 with a target sum: add a sum check to the same recursion." },
    { id: 1286, title: "Iterator for Combination", difficulty: "Medium", slug: "iterator-for-combination", note: "Produce the same lexicographic sequence lazily, one combination per call." },
  ],
};

export default meta;
