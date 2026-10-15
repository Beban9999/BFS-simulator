import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "call-stack",
  title: "Call Stack & Stack Overflow (Factorial)",
  category: "fundamentals",
  subcategory: "Recursion",
  difficulty: "core",
  order: 1,
  summary: "Watch fact(n) push one frame per call and do its work on the way back up; set a small depth limit to trigger a stack overflow, and compare the tail-recursive and loop versions.",
  keywords: ["recursion", "call stack", "stack frame", "stack overflow", "recursion limit", "recursionerror", "maximum call stack size exceeded", "tail recursion", "tail call optimization", "factorial", "base case"],
  problems: [
    { id: 509, title: "Fibonacci Number", difficulty: "Easy", slug: "fibonacci-number", note: "Base cases + a recursive case; then turn it into a loop to keep the stack flat." },
    { id: 206, title: "Reverse Linked List", difficulty: "Easy", slug: "reverse-linked-list", note: "The recursive version uses one frame per node — 5,000 nodes is fine in C++, risky with Python's default limit." },
    { id: 104, title: "Maximum Depth of Binary Tree", difficulty: "Easy", slug: "maximum-depth-of-binary-tree", note: "Stack depth = tree height: O(log n) when balanced, O(n) for a path-shaped tree." },
    { id: 50, title: "Pow(x, n)", difficulty: "Medium", slug: "powx-n", note: "Recursing on n − 1 overflows for n = 2³¹; halving n keeps the depth at about 31." },
  ],
};

export default meta;
