import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "representations",
  title: "Graph Representations",
  category: "graphs",
  subcategory: "Representations",
  difficulty: "core",
  order: 1,
  summary: "One graph, three encodings: the edge list you are given, adjacency lists for traversal, and an adjacency matrix for O(1) edge checks.",
  keywords: ["adjacency list", "adjacency matrix", "edge list", "graph representation", "build graph", "degree"],
  problems: [
    { id: 1971, title: "Find if Path Exists in Graph", difficulty: "Easy", slug: "find-if-path-exists-in-graph", note: "Input is an edge list; build adjacency lists first, then traverse." },
    { id: 997, title: "Find the Town Judge", difficulty: "Easy", slug: "find-the-town-judge", note: "Only in- and out-degrees matter, so count them straight from the edge list." },
    { id: 1615, title: "Maximal Network Rank", difficulty: "Medium", slug: "maximal-network-rank", note: "Degrees plus an O(1) adjacency check (matrix or set) for each pair of cities." },
    { id: 1791, title: "Find Center of Star Graph", difficulty: "Easy", slug: "find-center-of-star-graph", note: "The centre is the node shared by the first two edges." },
  ],
};

export default meta;
