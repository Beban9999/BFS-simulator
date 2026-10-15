import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "dfs-graph",
  title: "Depth-First Search (graph)",
  category: "graphs",
  subcategory: "Traversal",
  difficulty: "core",
  order: 4,
  summary: "Goes as deep as possible along one edge before backing up; recursive and explicit-stack versions visit nodes in the same order.",
  keywords: ["dfs", "depth first", "recursion", "explicit stack", "iterative dfs", "reachability", "connected components", "dfs tree"],
  problems: [
    { id: 547, title: "Number of Provinces", difficulty: "Medium", slug: "number-of-provinces", note: "Start a DFS from every unvisited city; each new start is one more province." },
    { id: 797, title: "All Paths From Source to Target", difficulty: "Medium", slug: "all-paths-from-source-to-target", note: "DFS on a DAG that records the current path and copies it at the target." },
    { id: 1466, title: "Reorder Routes to Make All Paths Lead to the City Zero", difficulty: "Medium", slug: "reorder-routes-to-make-all-paths-lead-to-the-city-zero", note: "DFS from 0 over undirected edges, counting edges that point away from 0." },
    { id: 133, title: "Clone Graph", difficulty: "Medium", slug: "clone-graph", note: "DFS with a map from original to copy so each node is cloned once." },
  ],
};

export default meta;
