import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "lcs",
  title: "Longest Common Subsequence",
  category: "dp",
  subcategory: "Strings",
  difficulty: "core",
  order: 1,
  summary: "Compare the last characters of two prefixes: equal → extend the diagonal; different → drop one character from either string and keep the better.",
  keywords: ["lcs", "longest common subsequence", "two strings", "2d dp", "diff", "diagonal"],
  problems: [
    { id: 1143, title: "Longest Common Subsequence", difficulty: "Medium", slug: "longest-common-subsequence", note: "This page." },
    { id: 583, title: "Delete Operation for Two Strings", difficulty: "Medium", slug: "delete-operation-for-two-strings", note: "Answer = len(a) + len(b) − 2 · LCS." },
    { id: 1035, title: "Uncrossed Lines", difficulty: "Medium", slug: "uncrossed-lines", note: "LCS in disguise: non-crossing equal pairs between two arrays." },
    { id: 1092, title: "Shortest Common Supersequence", difficulty: "Hard", slug: "shortest-common-supersequence", note: "Walk back through the LCS table, emitting the skipped characters too." },
  ],
};

export default meta;
