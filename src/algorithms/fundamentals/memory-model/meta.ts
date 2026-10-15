import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "memory-model",
  title: "Memory Model: Values, References, Layout",
  category: "fundamentals",
  subcategory: "Memory model",
  difficulty: "core",
  order: 1,
  kind: "note",
  summary: "Step through aliasing, copying, passing to functions and the [row] * n trap as names pointing at objects, then compare how an array and a linked list sit in memory.",
  keywords: ["memory model", "value vs reference", "aliasing", "mutable", "immutable", "shallow copy", "deep copy", "pass by reference", "pass by value", "contiguous memory", "cache", "heap", "pointer"],
  problems: [
    { id: 138, title: "Copy List with Random Pointer", difficulty: "Medium", slug: "copy-list-with-random-pointer", note: "A deep copy: new nodes for everything, with a map from old references to new ones." },
    { id: 133, title: "Clone Graph", difficulty: "Medium", slug: "clone-graph", note: "Deep copy with cycles — the old → new map also stops infinite recursion." },
    { id: 46, title: "Permutations", difficulty: "Medium", slug: "permutations", note: "Append a copy of the path, not the path itself, or every answer becomes the same list." },
    { id: 73, title: "Set Matrix Zeroes", difficulty: "Medium", slug: "set-matrix-zeroes", note: "In-place means mutating the caller's matrix — the function returns nothing." },
  ],
};

export default meta;
