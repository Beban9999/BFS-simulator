import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "shell-sort",
  title: "Shell Sort",
  category: "sorting",
  subcategory: "Simple sorts",
  difficulty: "intermediate",
  order: 4,
  summary: "Insertion sort on elements a gap apart, with the gap shrinking to 1 — far elements move far in one hop.",
  keywords: ["shell sort", "gap sequence", "diminishing increment", "h-sort", "insertion sort", "in place"],
  problems: [
    { id: 912, title: "Sort an Array", difficulty: "Medium", slug: "sort-an-array", note: "A good gap sequence makes Shell sort fast enough in practice, with O(1) extra space." },
    { id: 1329, title: "Sort the Matrix Diagonally", difficulty: "Medium", slug: "sort-the-matrix-diagonally", note: "Sorting interleaved sub-sequences independently — the same idea as one gap pass." },
    { id: 1051, title: "Height Checker", difficulty: "Easy", slug: "height-checker", note: "Compare with a sorted copy; any in-place sort works." },
  ],
};

export default meta;
