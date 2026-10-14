import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "min-window-substring",
  title: "Minimum Window Substring",
  category: "two-pointers",
  subcategory: "Variable window",
  difficulty: "advanced",
  order: 3,
  summary: "Expand right until the window covers every needed character, then shrink left as far as it stays covering — record each minimum.",
  keywords: ["minimum window", "cover all characters", "shortest window", "need have", "sliding window"],
  problems: [
    { id: 76, title: "Minimum Window Substring", difficulty: "Hard", slug: "minimum-window-substring", note: "This page: count how many required letters are fully satisfied." },
    { id: 209, title: "Minimum Size Subarray Sum", difficulty: "Medium", slug: "minimum-size-subarray-sum", note: "Same expand-then-shrink with a sum condition." },
    { id: 632, title: "Smallest Range Covering Elements from K Lists", difficulty: "Hard", slug: "smallest-range-covering-elements-from-k-lists", note: "Merge the lists by value, then the same covering window over list ids." },
    { id: 1234, title: "Replace the Substring for Balanced String", difficulty: "Medium", slug: "replace-the-substring-for-balanced-string", note: "Shortest window whose removal leaves every count ≤ n/4." },
  ],
};

export default meta;
