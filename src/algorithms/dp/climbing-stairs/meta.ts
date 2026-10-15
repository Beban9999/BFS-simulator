import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "climbing-stairs",
  title: "From Recursion to DP (Climbing Stairs)",
  category: "dp",
  subcategory: "Intro",
  difficulty: "core",
  order: 1,
  summary: "One problem four ways: a recursion tree that repeats work, memoisation that caches it, a bottom-up table, and finally two rolling variables.",
  keywords: ["climbing stairs", "fibonacci", "recursion tree", "memoization", "memoisation", "tabulation", "bottom up", "top down", "overlapping subproblems", "space optimisation"],
  problems: [
    { id: 70, title: "Climbing Stairs", difficulty: "Easy", slug: "climbing-stairs", note: "This page: ways(n) = ways(n-1) + ways(n-2)." },
    { id: 509, title: "Fibonacci Number", difficulty: "Easy", slug: "fibonacci-number", note: "The same recurrence with base cases 0 and 1." },
    { id: 1137, title: "N-th Tribonacci Number", difficulty: "Easy", slug: "n-th-tribonacci-number", note: "Three terms back instead of two: keep three rolling variables." },
    { id: 746, title: "Min Cost Climbing Stairs", difficulty: "Easy", slug: "min-cost-climbing-stairs", note: "Same dependency shape, but min over the two options plus a cost." },
  ],
};

export default meta;
