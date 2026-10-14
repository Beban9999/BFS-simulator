import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "find-anagrams",
  title: "Anagram Windows (Find All Anagrams)",
  category: "two-pointers",
  subcategory: "Fixed window",
  difficulty: "intermediate",
  order: 2,
  summary: "Slide a window of len(p) over s, keeping character counts; whenever the counts equal p's counts, the window is an anagram.",
  keywords: ["anagram", "permutation in string", "frequency window", "counter", "sliding window"],
  problems: [
    { id: 438, title: "Find All Anagrams in a String", difficulty: "Medium", slug: "find-all-anagrams-in-a-string", note: "This page: compare window counts with p's counts after every slide." },
    { id: 567, title: "Permutation in String", difficulty: "Medium", slug: "permutation-in-string", note: "Same window, return as soon as one matches." },
    { id: 30, title: "Substring with Concatenation of All Words", difficulty: "Hard", slug: "substring-with-concatenation-of-all-words", note: "Window over words instead of characters." },
    { id: 242, title: "Valid Anagram", difficulty: "Easy", slug: "valid-anagram", note: "The single-window version (see Frequency Counting)." },
  ],
};

export default meta;
