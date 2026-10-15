import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "a-star",
  title: "A* Search (grid)",
  category: "graphs",
  subcategory: "Shortest paths",
  difficulty: "intermediate",
  order: 6,
  summary: "Dijkstra steered by a guess: expand the cell with the smallest g + h, where h (Manhattan distance) never overestimates the remaining cost.",
  keywords: ["a star", "a*", "heuristic", "manhattan distance", "pathfinding", "best first", "admissible"],
  problems: [
    { id: 1091, title: "Shortest Path in Binary Matrix", difficulty: "Medium", slug: "shortest-path-in-binary-matrix", note: "BFS is enough, but A* with Chebyshev distance (8 directions) expands fewer cells." },
    { id: 773, title: "Sliding Puzzle", difficulty: "Hard", slug: "sliding-puzzle", note: "Search over board states; summed Manhattan distances of the tiles make a good heuristic." },
    { id: 752, title: "Open the Lock", difficulty: "Medium", slug: "open-the-lock", note: "BFS over lock states; per-wheel circular distance is an admissible A* heuristic." },
  ],
};

export default meta;
