import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "add-two-numbers",
  title: "Add Two Numbers",
  category: "linked-lists",
  subcategory: "Other",
  difficulty: "core",
  order: 3,
  summary: "Grade-school addition on two digit lists (least significant digit first): add column by column and carry the overflow.",
  keywords: ["add two numbers", "carry", "digit list", "big integer", "grade school addition"],
  problems: [
    { id: 2, title: "Add Two Numbers", difficulty: "Medium", slug: "add-two-numbers", note: "Exactly this column-by-column loop with a carry." },
    { id: 445, title: "Add Two Numbers II", difficulty: "Medium", slug: "add-two-numbers-ii", note: "Digits come most significant first: reverse both lists (or use stacks), add, reverse back." },
    { id: 67, title: "Add Binary", difficulty: "Easy", slug: "add-binary", note: "The same carry loop on strings in base 2, walking from the right." },
    { id: 989, title: "Add to Array-Form of Integer", difficulty: "Easy", slug: "add-to-array-form-of-integer", note: "Same carry loop on an array of digits." },
  ],
};

export default meta;
