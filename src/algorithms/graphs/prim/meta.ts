import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "prim",
  title: "Prim's MST",
  category: "graphs",
  subcategory: "Spanning trees",
  difficulty: "core",
  order: 2,
  summary: "Grow one tree from a start node: repeatedly add the cheapest edge that leaves the tree (min-heap of crossing edges).",
  keywords: ["prim", "minimum spanning tree", "mst", "priority queue", "greedy", "cut property", "dense graph"],
  problems: [
    { id: 1584, title: "Min Cost to Connect All Points", difficulty: "Medium", slug: "min-cost-to-connect-all-points", note: "Dense complete graph: Prim with an O(V²) distance array beats sorting all pairs." },
    { id: 1135, title: "Connecting Cities With Minimum Cost", difficulty: "Medium", slug: "connecting-cities-with-minimum-cost", note: "Heap-based Prim from city 1; -1 if some city is never added." },
    { id: 1489, title: "Find Critical and Pseudo-Critical Edges in Minimum Spanning Tree", difficulty: "Hard", slug: "find-critical-and-pseudo-critical-edges-in-minimum-spanning-tree", note: "Any MST routine works as the inner step; compare totals with an edge banned or forced." },
  ],
};

export default meta;
