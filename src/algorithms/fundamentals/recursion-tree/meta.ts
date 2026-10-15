import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "recursion-tree",
  title: "Recursion Trees: fib vs power vs fast power",
  category: "fundamentals",
  subcategory: "Recursion",
  difficulty: "core",
  order: 2,
  summary: "Draw every call as a node: two calls per level explode into O(2ⁿ) (fib), one call on n − 1 is a chain of n (power), one call on n / 2 is a chain of log n (fast power).",
  keywords: ["recursion tree", "fibonacci", "exponentiation by squaring", "fast power", "binary exponentiation", "pow", "time complexity of recursion", "overlapping subproblems", "master theorem"],
  problems: [
    { id: 509, title: "Fibonacci Number", difficulty: "Easy", slug: "fibonacci-number", note: "The two-call tree on this page; memoise it or loop to get O(n)." },
    { id: 50, title: "Pow(x, n)", difficulty: "Medium", slug: "powx-n", note: "fast_power on this page, plus negative n (use 1 / x) — O(log n) calls." },
    { id: 372, title: "Super Pow", difficulty: "Medium", slug: "super-pow", note: "Fast power under a modulus, with the exponent given digit by digit." },
    { id: 1922, title: "Count Good Numbers", difficulty: "Medium", slug: "count-good-numbers", note: "Answer is 5^a · 4^b mod 1e9+7 with exponents up to 10¹⁵: only fast power is quick enough." },
  ],
};

export default meta;
