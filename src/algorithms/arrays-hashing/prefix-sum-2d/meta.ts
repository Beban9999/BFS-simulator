import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "prefix-sum-2d",
  title: "2D Prefix Sum (rectangle queries)",
  category: "arrays-hashing",
  subcategory: "Prefix sums",
  difficulty: "intermediate",
  order: 2,
  summary: "P[r][c] holds the sum of the rectangle above-left of (r, c); any sub-rectangle sum is four lookups via inclusion–exclusion.",
  keywords: ["2d prefix sum", "summed area table", "integral image", "range sum query 2d", "inclusion exclusion"],
  problems: [
    { id: 304, title: "Range Sum Query 2D - Immutable", difficulty: "Medium", slug: "range-sum-query-2d-immutable", note: "Build the (R+1)×(C+1) table, answer with four lookups." },
    { id: 1314, title: "Matrix Block Sum", difficulty: "Medium", slug: "matrix-block-sum", note: "Clamp each block to the grid, then one rectangle query per cell." },
    { id: 221, title: "Maximal Square", difficulty: "Medium", slug: "maximal-square", note: "Different recurrence, same 'combine up, left and up-left' table shape." },
    { id: 1074, title: "Number of Submatrices That Sum to Target", difficulty: "Hard", slug: "number-of-submatrices-that-sum-to-target", note: "Fix a row pair, then run 1D subarray-sum-equals-k over column sums." },
  ],
};

export default meta;
