import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "valid-parentheses",
  title: "Valid Parentheses",
  category: "stacks-queues",
  subcategory: "Stack problems",
  difficulty: "core",
  order: 1,
  summary: "Push every opener; each closer must match the opener on top of the stack. Valid when the stack ends empty.",
  keywords: ["valid parentheses", "balanced brackets", "matching brackets", "stack"],
  problems: [
    { id: 20, title: "Valid Parentheses", difficulty: "Easy", slug: "valid-parentheses", note: "Exactly this push-opener / match-closer loop." },
    { id: 1249, title: "Minimum Remove to Make Valid Parentheses", difficulty: "Medium", slug: "minimum-remove-to-make-valid-parentheses", note: "Stack the indexes of unmatched openers; drop them and any closer with nothing to match." },
    { id: 921, title: "Minimum Add to Make Parentheses Valid", difficulty: "Medium", slug: "minimum-add-to-make-parentheses-valid", note: "One bracket type, so a counter is enough: count unmatched closers plus leftover openers." },
    { id: 32, title: "Longest Valid Parentheses", difficulty: "Hard", slug: "longest-valid-parentheses", note: "Stack of indexes; after each match the gap to the new top is a valid length." },
  ],
};

export default meta;
