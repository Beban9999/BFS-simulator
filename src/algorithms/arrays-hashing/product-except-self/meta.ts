import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "product-except-self",
  title: "Product of Array Except Self",
  category: "arrays-hashing",
  subcategory: "Prefix sums",
  difficulty: "intermediate",
  order: 5,
  summary: "Prefix products from the left times suffix products from the right — no division, O(1) extra space.",
  keywords: ["prefix product", "suffix product", "left right pass", "no division"],
  problems: [
    { id: 238, title: "Product of Array Except Self", difficulty: "Medium", slug: "product-of-array-except-self", note: "Left pass stores prefix products, right pass multiplies in suffix products." },
    { id: 42, title: "Trapping Rain Water", difficulty: "Hard", slug: "trapping-rain-water", note: "Same left-max / right-max two-pass shape (or two pointers)." },
    { id: 135, title: "Candy", difficulty: "Hard", slug: "candy", note: "A left-to-right pass and a right-to-left pass, combined." },
    { id: 2483, title: "Minimum Penalty for a Shop", difficulty: "Medium", slug: "minimum-penalty-for-a-shop", note: "Prefix count of N's plus suffix count of Y's at each split." },
  ],
};

export default meta;
