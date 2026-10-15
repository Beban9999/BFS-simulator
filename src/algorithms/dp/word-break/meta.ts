import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "word-break",
  title: "Word Break",
  category: "dp",
  subcategory: "1D",
  difficulty: "core",
  order: 3,
  summary: "dp[i] is true when some split point j has dp[j] true and s[j:i] in the dictionary: each prefix reuses the answers of shorter prefixes.",
  keywords: ["word break", "segmentation", "prefix dp", "dictionary", "boolean dp", "string dp"],
  problems: [
    { id: 139, title: "Word Break", difficulty: "Medium", slug: "word-break", note: "This page: boolean dp over prefix lengths." },
    { id: 140, title: "Word Break II", difficulty: "Hard", slug: "word-break-ii", note: "List every sentence: backtracking over the same split points, memoised by start index." },
    { id: 472, title: "Concatenated Words", difficulty: "Hard", slug: "concatenated-words", note: "Run word break for each word against the shorter words." },
    { id: 2707, title: "Extra Characters in a String", difficulty: "Medium", slug: "extra-characters-in-a-string", note: "Same prefix dp, minimising leftover characters instead of a yes/no." },
  ],
};

export default meta;
