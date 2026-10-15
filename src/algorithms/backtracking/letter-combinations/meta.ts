import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "letter-combinations",
  title: "Letter Combinations of a Phone Number",
  category: "backtracking",
  subcategory: "Strings",
  difficulty: "core",
  order: 3,
  summary: "One tree level per digit, one branch per letter on that key: the leaves are the cartesian product of the keys.",
  keywords: ["letter combinations", "phone keypad", "cartesian product", "backtracking", "t9"],
  problems: [
    { id: 17, title: "Letter Combinations of a Phone Number", difficulty: "Medium", slug: "letter-combinations-of-a-phone-number", note: "This page: depth = number of digits, branching = letters per key." },
    { id: 784, title: "Letter Case Permutation", difficulty: "Medium", slug: "letter-case-permutation", note: "Same product shape with two options (lower/upper) per letter." },
    { id: 22, title: "Generate Parentheses", difficulty: "Medium", slug: "generate-parentheses", note: "Two options per position again, but with validity pruning (see Stacks & Queues)." },
  ],
};

export default meta;
