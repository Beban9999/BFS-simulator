import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "generate-parentheses",
  title: "Generate Parentheses",
  category: "stacks-queues",
  subcategory: "Stack problems",
  difficulty: "intermediate",
  order: 3,
  summary: "Backtracking with two counters: add \"(\" while fewer than n are open, add \")\" while it closes something — every leaf is a valid string.",
  keywords: ["generate parentheses", "backtracking", "catalan", "balanced parentheses", "recursion", "choose explore unchoose"],
  problems: [
    { id: 22, title: "Generate Parentheses", difficulty: "Medium", slug: "generate-parentheses", note: "Exactly this: open while opened < n, close while closed < opened." },
    { id: 301, title: "Remove Invalid Parentheses", difficulty: "Hard", slug: "remove-invalid-parentheses", note: "Backtrack over keep / delete choices, pruned by the same open/close counting." },
    { id: 17, title: "Letter Combinations of a Phone Number", difficulty: "Medium", slug: "letter-combinations-of-a-phone-number", note: "Same choose → recurse → undo template with a different choice set." },
    { id: 20, title: "Valid Parentheses", difficulty: "Easy", slug: "valid-parentheses", note: "The validity rule this generator never breaks." },
  ],
};

export default meta;
