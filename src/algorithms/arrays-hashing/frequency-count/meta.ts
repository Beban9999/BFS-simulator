import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "frequency-count",
  title: "Frequency Counting (Valid Anagram)",
  category: "arrays-hashing",
  subcategory: "Hashing",
  difficulty: "core",
  order: 3,
  summary: "Count each character of one string, then cancel the counts with the other; any negative count means they differ.",
  keywords: ["anagram", "counter", "frequency", "histogram", "count map", "group anagrams", "top k frequent"],
  problems: [
    { id: 242, title: "Valid Anagram", difficulty: "Easy", slug: "valid-anagram", note: "Count up for s, down for t; all counts must end at zero." },
    { id: 49, title: "Group Anagrams", difficulty: "Medium", slug: "group-anagrams", note: "Use the 26-letter count tuple (or sorted word) as the map key." },
    { id: 347, title: "Top K Frequent Elements", difficulty: "Medium", slug: "top-k-frequent-elements", note: "Count, then bucket by frequency (or a size-k heap)." },
    { id: 383, title: "Ransom Note", difficulty: "Easy", slug: "ransom-note", note: "Count the magazine letters, spend them on the note." },
    { id: 387, title: "First Unique Character in a String", difficulty: "Easy", slug: "first-unique-character-in-a-string", note: "Count first, then scan again for the first count of 1." },
  ],
};

export default meta;
