import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "set-matrix-zeroes",
  title: "Set Matrix Zeroes (O(1) markers)",
  category: "arrays-hashing",
  subcategory: "Matrix",
  difficulty: "intermediate",
  order: 3,
  summary: "Use the first row and column as marker arrays for which rows/columns must become zero, then fill.",
  keywords: ["set matrix zeroes", "in place", "markers", "first row first column"],
  problems: [
    { id: 73, title: "Set Matrix Zeroes", difficulty: "Medium", slug: "set-matrix-zeroes", note: "First row/column double as the marker sets; remember their own state in two booleans." },
    { id: 289, title: "Game of Life", difficulty: "Medium", slug: "game-of-life", note: "Another in-place grid update: encode old and new state in the same cell." },
    { id: 2482, title: "Difference Between Ones and Zeros in Row and Column", difficulty: "Medium", slug: "difference-between-ones-and-zeros-in-row-and-column", note: "Precompute row/column counts first, then fill — the O(R + C) marker idea." },
  ],
};

export default meta;
