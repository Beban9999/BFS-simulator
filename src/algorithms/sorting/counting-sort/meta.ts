import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "counting-sort",
  title: "Counting Sort",
  category: "sorting",
  subcategory: "Non-comparison",
  difficulty: "core",
  order: 1,
  summary: "Count how often each small integer appears, turn counts into positions with a prefix sum, then place every value directly — O(n + k).",
  keywords: ["counting sort", "histogram", "prefix sum", "stable", "non-comparison", "O(n + k)", "frequency"],
  problems: [
    { id: 1051, title: "Height Checker", difficulty: "Easy", slug: "height-checker", note: "Heights are 1..100, so a counting sort builds the expected order in O(n)." },
    { id: 1122, title: "Relative Sort Array", difficulty: "Easy", slug: "relative-sort-array", note: "Count every value, then emit them in the order the second array dictates." },
    { id: 274, title: "H-Index", difficulty: "Medium", slug: "h-index", note: "Bucket citation counts (capped at n) and scan from the top." },
    { id: 1365, title: "How Many Numbers Are Smaller Than the Current Number", difficulty: "Easy", slug: "how-many-numbers-are-smaller-than-the-current-number", note: "The prefix sum of counts answers 'how many values are smaller' directly." },
  ],
};

export default meta;
