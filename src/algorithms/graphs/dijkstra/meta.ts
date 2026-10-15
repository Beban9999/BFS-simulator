import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "dijkstra",
  title: "Dijkstra's Algorithm",
  category: "graphs",
  subcategory: "Shortest paths",
  difficulty: "core",
  order: 2,
  summary: "Always settle the closest unsettled node next (min-heap), relaxing its edges; with non-negative weights each popped distance is final.",
  keywords: ["dijkstra", "shortest path", "weighted graph", "priority queue", "min heap", "relaxation", "network delay"],
  problems: [
    { id: 743, title: "Network Delay Time", difficulty: "Medium", slug: "network-delay-time", note: "Dijkstra from k; the answer is the largest final distance (or -1 if some node stays at infinity)." },
    { id: 1514, title: "Path with Maximum Probability", difficulty: "Medium", slug: "path-with-maximum-probability", note: "Same loop with a max-heap and multiplication instead of addition." },
    { id: 1631, title: "Path With Minimum Effort", difficulty: "Medium", slug: "path-with-minimum-effort", note: "Grid Dijkstra where a path's cost is its largest single step, not the sum." },
    { id: 787, title: "Cheapest Flights Within K Stops", difficulty: "Medium", slug: "cheapest-flights-within-k-stops", note: "The stop limit breaks plain Dijkstra; use Bellman-Ford with k+1 rounds or a (cost, stops) state." },
    { id: 1976, title: "Number of Ways to Arrive at Destination", difficulty: "Medium", slug: "number-of-ways-to-arrive-at-destination", note: "Dijkstra that also counts how many shortest paths reach each node." },
  ],
};

export default meta;
