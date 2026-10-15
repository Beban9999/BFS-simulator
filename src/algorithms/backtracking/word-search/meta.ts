import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "word-search",
  title: "Word Search (grid DFS)",
  category: "backtracking",
  subcategory: "Strings",
  difficulty: "intermediate",
  order: 1,
  summary: "From every cell, follow neighbours that match the next letter; mark cells on the current path so they aren't reused, and unmark them when backing out.",
  keywords: ["word search", "grid", "dfs", "backtracking", "visited marking", "boggle", "path"],
  problems: [
    { id: 79, title: "Word Search", difficulty: "Medium", slug: "word-search", note: "This page: DFS from each cell, temporarily overwriting cells on the path." },
    { id: 212, title: "Word Search II", difficulty: "Hard", slug: "word-search-ii", note: "Many words at once: walk a trie alongside the grid DFS instead of one word." },
    { id: 1219, title: "Path with Maximum Gold", difficulty: "Medium", slug: "path-with-maximum-gold", note: "Same mark / explore / unmark DFS, maximising a sum instead of matching letters." },
  ],
};

export default meta;
