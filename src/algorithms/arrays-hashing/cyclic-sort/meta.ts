import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "cyclic-sort",
  title: "Cyclic Sort (find missing numbers)",
  category: "arrays-hashing",
  subcategory: "In-place",
  difficulty: "intermediate",
  order: 2,
  summary: "When values are 1..n, swap each value to index value − 1; afterwards every index holding the wrong value reveals a missing number.",
  keywords: ["cyclic sort", "missing number", "duplicates", "index as hash", "first missing positive", "1 to n"],
  problems: [
    { id: 448, title: "Find All Numbers Disappeared in an Array", difficulty: "Easy", slug: "find-all-numbers-disappeared-in-an-array", note: "This page: place values, then report indexes whose value is wrong." },
    { id: 268, title: "Missing Number", difficulty: "Easy", slug: "missing-number", note: "Values 0..n: cyclic sort (or XOR / Gauss sum)." },
    { id: 442, title: "Find All Duplicates in an Array", difficulty: "Medium", slug: "find-all-duplicates-in-an-array", note: "After placing, the values sitting at wrong indexes are the duplicates." },
    { id: 41, title: "First Missing Positive", difficulty: "Hard", slug: "first-missing-positive", note: "Ignore values outside 1..n, place the rest, return the first index with the wrong value." },
    { id: 645, title: "Set Mismatch", difficulty: "Easy", slug: "set-mismatch", note: "One misplaced index gives both the duplicate and the missing value." },
  ],
};

export default meta;
