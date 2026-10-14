import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "rotate-image",
  title: "Rotate Matrix 90° (transpose + reverse)",
  category: "arrays-hashing",
  subcategory: "Matrix",
  difficulty: "core",
  order: 2,
  summary: "Rotate an n×n matrix clockwise in place: transpose across the main diagonal, then reverse every row.",
  keywords: ["rotate image", "transpose", "in place", "90 degrees", "clockwise"],
  problems: [
    { id: 48, title: "Rotate Image", difficulty: "Medium", slug: "rotate-image", note: "Transpose, then reverse each row (clockwise)." },
    { id: 867, title: "Transpose Matrix", difficulty: "Easy", slug: "transpose-matrix", note: "Just the first half; non-square needs a new matrix." },
    { id: 1886, title: "Determine Whether Matrix Can Be Obtained By Rotation", difficulty: "Easy", slug: "determine-whether-matrix-can-be-obtained-by-rotation", note: "Rotate up to four times and compare." },
  ],
};

export default meta;
