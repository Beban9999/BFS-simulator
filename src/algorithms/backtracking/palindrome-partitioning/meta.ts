import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "palindrome-partitioning",
  title: "Palindrome Partitioning",
  category: "backtracking",
  subcategory: "Strings",
  difficulty: "intermediate",
  order: 2,
  summary: "Cut the string piece by piece: from the current start, every palindromic prefix is a choice; reaching the end records one partition.",
  keywords: ["palindrome partitioning", "string partition", "cuts", "backtracking", "prefix", "word break"],
  problems: [
    { id: 131, title: "Palindrome Partitioning", difficulty: "Medium", slug: "palindrome-partitioning", note: "This page: every way to cut s into palindromes." },
    { id: 132, title: "Palindrome Partitioning II", difficulty: "Hard", slug: "palindrome-partitioning-ii", note: "Only the minimum number of cuts: DP over prefixes instead of listing partitions." },
    { id: 93, title: "Restore IP Addresses", difficulty: "Medium", slug: "restore-ip-addresses", note: "Same 'choose the next piece' recursion with 1–3 digit pieces and exactly four parts." },
    { id: 140, title: "Word Break II", difficulty: "Hard", slug: "word-break-ii", note: "Pieces must be dictionary words instead of palindromes (add memoisation)." },
  ],
};

export default meta;
