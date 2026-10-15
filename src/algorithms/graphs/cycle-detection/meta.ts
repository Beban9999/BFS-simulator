import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "cycle-detection",
  title: "Cycle Detection (DFS)",
  category: "graphs",
  subcategory: "Cycles & ordering",
  difficulty: "core",
  order: 1,
  summary: "DFS finds a cycle when an edge leads back into the current path: any visited non-parent in an undirected graph, a GRAY node in a directed one.",
  keywords: ["cycle detection", "back edge", "three colour", "white gray black", "dfs", "deadlock", "course schedule"],
  problems: [
    { id: 207, title: "Course Schedule", difficulty: "Medium", slug: "course-schedule", note: "Courses can all be finished exactly when the prerequisite graph has no directed cycle." },
    { id: 261, title: "Graph Valid Tree", difficulty: "Medium", slug: "graph-valid-tree", note: "A tree is connected with no undirected cycle (equivalently n - 1 edges and connected)." },
    { id: 802, title: "Find Eventual Safe States", difficulty: "Medium", slug: "find-eventual-safe-states", note: "With three colours, the nodes that end BLACK without ever reaching a GRAY node are safe." },
    { id: 684, title: "Redundant Connection", difficulty: "Medium", slug: "redundant-connection", note: "The first edge whose endpoints are already connected closes the cycle (Union-Find is the usual tool)." },
  ],
};

export default meta;
