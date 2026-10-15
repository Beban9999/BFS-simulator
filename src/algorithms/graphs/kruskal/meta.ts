import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "kruskal",
  title: "Kruskal's MST",
  category: "graphs",
  subcategory: "Spanning trees",
  difficulty: "core",
  order: 1,
  summary: "Sort the edges by weight and keep each one that joins two different components (checked with Union-Find).",
  keywords: ["kruskal", "minimum spanning tree", "mst", "union find", "greedy", "sort edges", "spanning forest"],
  problems: [
    { id: 1584, title: "Min Cost to Connect All Points", difficulty: "Medium", slug: "min-cost-to-connect-all-points", note: "All pairs are candidate edges (Manhattan cost); Kruskal or Prim gives the minimum total." },
    { id: 1135, title: "Connecting Cities With Minimum Cost", difficulty: "Medium", slug: "connecting-cities-with-minimum-cost", note: "Plain Kruskal; return -1 if fewer than n - 1 edges were taken." },
    { id: 1489, title: "Find Critical and Pseudo-Critical Edges in Minimum Spanning Tree", difficulty: "Hard", slug: "find-critical-and-pseudo-critical-edges-in-minimum-spanning-tree", note: "Rerun Kruskal with each edge banned or forced and compare the totals." },
    { id: 1168, title: "Optimize Water Distribution in a Village", difficulty: "Hard", slug: "optimize-water-distribution-in-a-village", note: "Add a virtual node 0 with a well edge to every house, then run Kruskal." },
  ],
};

export default meta;
