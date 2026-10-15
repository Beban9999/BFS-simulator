import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "pacific-atlantic",
  title: "Pacific Atlantic Water Flow",
  category: "graphs",
  subcategory: "Grid patterns",
  difficulty: "intermediate",
  order: 4,
  summary: "Instead of testing every cell, climb uphill from each ocean's coast; the cells both climbs reach can drain into both oceans.",
  keywords: ["pacific atlantic", "reverse bfs", "multi-source", "reachability", "heights", "water flow"],
  problems: [
    { id: 417, title: "Pacific Atlantic Water Flow", difficulty: "Medium", slug: "pacific-atlantic-water-flow", note: "This page: two reverse searches from the coasts, then intersect." },
    { id: 1020, title: "Number of Enclaves", difficulty: "Medium", slug: "number-of-enclaves", note: "Same reverse idea: flood from the border, count land that was never reached." },
    { id: 778, title: "Swim in Rising Water", difficulty: "Hard", slug: "swim-in-rising-water", note: "Height constraints again, but minimise the highest cell on the path (Dijkstra or binary search + BFS)." },
  ],
};

export default meta;
