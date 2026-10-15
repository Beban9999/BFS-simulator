import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "trie",
  title: "Trie (Prefix Tree)",
  category: "trees",
  subcategory: "Trie",
  difficulty: "intermediate",
  order: 1,
  summary: "One edge per character: words that share a prefix share a path. Insert, search and prefix queries all cost O(word length).",
  keywords: ["trie", "prefix tree", "autocomplete", "starts with", "word dictionary", "insert search delete"],
  problems: [
    { id: 208, title: "Implement Trie (Prefix Tree)", difficulty: "Medium", slug: "implement-trie-prefix-tree", note: "insert / search / startsWith exactly as on this page." },
    { id: 211, title: "Design Add and Search Words Data Structure", difficulty: "Medium", slug: "design-add-and-search-words-data-structure", note: "A \".\" wildcard tries every child — DFS over the trie." },
    { id: 212, title: "Word Search II", difficulty: "Hard", slug: "word-search-ii", note: "Put all words in a trie and walk it while doing DFS on the board; prune dead branches." },
    { id: 1268, title: "Search Suggestions System", difficulty: "Medium", slug: "search-suggestions-system", note: "After each typed letter, list (up to) three words below the current trie node." },
  ],
};

export default meta;
