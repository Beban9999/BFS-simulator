import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "permutations",
  title: "Permutations (with and without duplicates)",
  category: "backtracking",
  subcategory: "Subsets & permutations",
  difficulty: "core",
  order: 2,
  summary: "Fill positions left to right with any unused element; a used[] array tracks what's taken, and equal values are only used in order.",
  keywords: ["permutations", "arrangements", "used array", "backtracking", "permutations ii", "duplicates", "n factorial"],
  problems: [
    { id: 46, title: "Permutations", difficulty: "Medium", slug: "permutations", note: "This page with distinct numbers: n! leaves." },
    { id: 47, title: "Permutations II", difficulty: "Medium", slug: "permutations-ii", note: "Sort, then use equal values strictly left to right (skip if the left twin is unused)." },
    { id: 784, title: "Letter Case Permutation", difficulty: "Medium", slug: "letter-case-permutation", note: "A binary choice per letter instead of choosing among unused elements." },
    { id: 526, title: "Beautiful Arrangement", difficulty: "Medium", slug: "beautiful-arrangement", note: "Permutation search that prunes as soon as position and value don't divide." },
  ],
};

export default meta;
