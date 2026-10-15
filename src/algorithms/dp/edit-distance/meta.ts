import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "edit-distance",
  title: "Edit Distance (Levenshtein) + alignment",
  category: "dp",
  subcategory: "Strings",
  difficulty: "intermediate",
  order: 2,
  summary: "dp[i][j] = fewest inserts, deletes and replaces turning a[:i] into b[:j]; walking the table back spells out the alignment.",
  keywords: ["edit distance", "levenshtein", "insert delete replace", "alignment", "string dp", "spell check"],
  problems: [
    { id: 72, title: "Edit Distance", difficulty: "Medium", slug: "edit-distance", note: "This page." },
    { id: 583, title: "Delete Operation for Two Strings", difficulty: "Medium", slug: "delete-operation-for-two-strings", note: "Only deletions allowed: same table without the replace option." },
    { id: 161, title: "One Edit Distance", difficulty: "Medium", slug: "one-edit-distance", note: "Only asks whether the distance is exactly 1: a linear scan suffices." },
    { id: 712, title: "Minimum ASCII Delete Sum for Two Strings", difficulty: "Medium", slug: "minimum-ascii-delete-sum-for-two-strings", note: "Deletions cost the character code instead of 1." },
  ],
};

export default meta;
