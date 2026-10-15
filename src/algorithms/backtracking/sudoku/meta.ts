import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "sudoku",
  title: "Sudoku Solver",
  category: "backtracking",
  subcategory: "Boards",
  difficulty: "intermediate",
  order: 2,
  summary: "Fill the first empty cell with each digit that doesn't clash with its row, column or box, and recurse; a cell with no legal digit sends the search back.",
  keywords: ["sudoku", "constraint satisfaction", "board", "backtracking", "valid sudoku", "exact cover"],
  problems: [
    { id: 37, title: "Sudoku Solver", difficulty: "Hard", slug: "sudoku-solver", note: "This page on a 9×9 board (the 4×4 presets keep the tree small)." },
    { id: 36, title: "Valid Sudoku", difficulty: "Medium", slug: "valid-sudoku", note: "Just the ok() check for every filled cell, using sets per row, column and box." },
    { id: 51, title: "N-Queens", difficulty: "Hard", slug: "n-queens", note: "Same place / recurse / remove pattern with a different conflict test." },
  ],
};

export default meta;
