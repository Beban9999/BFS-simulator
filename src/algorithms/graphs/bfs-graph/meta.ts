import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "bfs-graph",
  title: "Breadth-First Search (graph)",
  category: "graphs",
  subcategory: "Traversal",
  difficulty: "core",
  order: 3,
  summary: "Visits nodes in rings of equal distance from the start, so each node's first discovery is along a fewest-edges path.",
  keywords: ["bfs", "breadth first", "adjacency list", "queue", "unweighted shortest path", "levels", "bfs tree"],
  problems: [
    { id: 1971, title: "Find if Path Exists in Graph", difficulty: "Easy", slug: "find-if-path-exists-in-graph", note: "BFS from the source over an edge list turned into adjacency lists; stop when the target is seen." },
    { id: 841, title: "Keys and Rooms", difficulty: "Medium", slug: "keys-and-rooms", note: "Rooms are nodes, keys are directed edges: check that BFS from room 0 reaches every room." },
    { id: 1129, title: "Shortest Path with Alternating Colors", difficulty: "Medium", slug: "shortest-path-with-alternating-colors", note: "BFS over (node, last colour) states; the first time a node is popped gives its distance." },
    { id: 1306, title: "Jump Game III", difficulty: "Medium", slug: "jump-game-iii", note: "Indexes are nodes with two outgoing jumps; BFS until a zero is reached." },
  ],
};

export default meta;
