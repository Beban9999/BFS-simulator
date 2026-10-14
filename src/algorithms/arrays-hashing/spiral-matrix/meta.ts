import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "spiral-matrix",
  title: "Spiral Matrix Traversal",
  category: "arrays-hashing",
  subcategory: "Matrix",
  difficulty: "core",
  order: 1,
  summary: "Walk the outer ring (right, down, left, up), shrink four boundaries, repeat until they cross.",
  keywords: ["spiral order", "matrix traversal", "boundaries", "layer by layer"],
  problems: [
    { id: 54, title: "Spiral Matrix", difficulty: "Medium", slug: "spiral-matrix", note: "Four shrinking boundaries; re-check them before the left and up legs." },
    { id: 59, title: "Spiral Matrix II", difficulty: "Medium", slug: "spiral-matrix-ii", note: "Same walk, writing 1..n² instead of reading." },
    { id: 885, title: "Spiral Matrix III", difficulty: "Medium", slug: "spiral-matrix-iii", note: "Spiral outwards with leg lengths 1, 1, 2, 2, 3, 3, … and skip cells outside the grid." },
  ],
};

export default meta;
