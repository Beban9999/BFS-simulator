import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "char-replacement",
  title: "Longest Repeating Character Replacement",
  category: "two-pointers",
  subcategory: "Variable window",
  difficulty: "intermediate",
  order: 2,
  summary: "A window is fixable when (length − count of its most common letter) ≤ k; grow it, and slide it when that fails.",
  keywords: ["character replacement", "max frequency", "sliding window", "k changes", "most frequent letter"],
  problems: [
    { id: 424, title: "Longest Repeating Character Replacement", difficulty: "Medium", slug: "longest-repeating-character-replacement", note: "This page: window − max_freq ≤ k." },
    { id: 1004, title: "Max Consecutive Ones III", difficulty: "Medium", slug: "max-consecutive-ones-iii", note: "Binary version: at most k zeros in the window." },
    { id: 2024, title: "Maximize the Confusion of an Exam", difficulty: "Medium", slug: "maximize-the-confusion-of-an-exam", note: "Run the same window for 'T' and for 'F'." },
  ],
};

export default meta;
