import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "n-queens",
  title: "N-Queens",
  category: "backtracking",
  subcategory: "Boards",
  difficulty: "intermediate",
  order: 1,
  summary: "Place one queen per row; three sets (columns, both diagonals) answer 'is this square attacked?' in O(1), so dead squares are skipped at once.",
  keywords: ["n queens", "eight queens", "chess", "board", "diagonals", "constraint", "backtracking"],
  problems: [
    { id: 51, title: "N-Queens", difficulty: "Hard", slug: "n-queens", note: "This page: collect every board." },
    { id: 52, title: "N-Queens II", difficulty: "Hard", slug: "n-queens-ii", note: "Same search, only count the solutions." },
    { id: 1001, title: "Grid Illumination", difficulty: "Hard", slug: "grid-illumination", note: "Reuses the idea of keying rows, columns and both diagonals (r - c, r + c) in hash maps." },
  ],
};

export default meta;
