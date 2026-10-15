import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "subsets",
  title: "Subsets (with and without duplicates)",
  category: "backtracking",
  subcategory: "Subsets & permutations",
  difficulty: "core",
  order: 1,
  summary: "Every node of the recursion is a subset: record it, then extend it with each later element. Sorting + skipping equal siblings removes duplicate subsets.",
  keywords: ["subsets", "power set", "backtracking", "subsets ii", "duplicates", "start index", "decision tree"],
  problems: [
    { id: 78, title: "Subsets", difficulty: "Medium", slug: "subsets", note: "This page with distinct numbers: the skip line never fires." },
    { id: 90, title: "Subsets II", difficulty: "Medium", slug: "subsets-ii", note: "Sort, then skip a value equal to its left sibling at the same depth." },
    { id: 1863, title: "Sum of All Subset XOR Totals", difficulty: "Easy", slug: "sum-of-all-subset-xor-totals", note: "Visit every subset (this recursion or a bitmask) and add up the XORs." },
    { id: 2597, title: "The Number of Beautiful Subsets", difficulty: "Medium", slug: "the-number-of-beautiful-subsets", note: "Same recursion, but prune a choice that differs by k from something already in the path." },
  ],
};

export default meta;
