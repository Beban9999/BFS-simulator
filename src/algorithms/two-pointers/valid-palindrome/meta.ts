import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "valid-palindrome",
  title: "Valid Palindrome (converging pointers)",
  category: "two-pointers",
  subcategory: "Opposite ends",
  difficulty: "core",
  order: 2,
  summary: "Compare characters from both ends inward, skipping anything that isn't a letter or digit.",
  keywords: ["palindrome", "two pointers", "skip non alphanumeric", "reverse", "string"],
  problems: [
    { id: 125, title: "Valid Palindrome", difficulty: "Easy", slug: "valid-palindrome", note: "This page: skip non-alphanumerics, compare case-insensitively." },
    { id: 680, title: "Valid Palindrome II", difficulty: "Easy", slug: "valid-palindrome-ii", note: "On the first mismatch, try skipping either side once." },
    { id: 344, title: "Reverse String", difficulty: "Easy", slug: "reverse-string", note: "Same converging pointers, swapping instead of comparing." },
    { id: 234, title: "Palindrome Linked List", difficulty: "Easy", slug: "palindrome-linked-list", note: "No random access: reverse the second half first." },
  ],
};

export default meta;
