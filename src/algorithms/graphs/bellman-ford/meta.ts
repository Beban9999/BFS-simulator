import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "bellman-ford",
  title: "Bellman-Ford",
  category: "graphs",
  subcategory: "Shortest paths",
  difficulty: "intermediate",
  order: 4,
  summary: "Relax every edge, V-1 times; works with negative weights, and one extra pass that still improves something reveals a negative cycle.",
  keywords: ["bellman ford", "negative weights", "negative cycle", "edge relaxation", "shortest path", "k stops", "arbitrage"],
  problems: [
    { id: 787, title: "Cheapest Flights Within K Stops", difficulty: "Medium", slug: "cheapest-flights-within-k-stops", note: "Run exactly k+1 rounds, relaxing from a copy of the previous round's distances." },
    { id: 743, title: "Network Delay Time", difficulty: "Medium", slug: "network-delay-time", note: "Bellman-Ford also solves it (O(V·E)); Dijkstra is faster." },
    { id: 1334, title: "Find the City With the Smallest Number of Neighbors at a Threshold Distance", difficulty: "Medium", slug: "find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance", note: "Needs all-pairs distances: one Bellman-Ford / Dijkstra per city, or Floyd-Warshall." },
  ],
};

export default meta;
