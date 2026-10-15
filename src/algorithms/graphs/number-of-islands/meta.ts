import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "number-of-islands",
  title: "Number of Islands & Max Area",
  category: "graphs",
  subcategory: "Grid patterns",
  difficulty: "core",
  order: 1,
  summary: "Scan the grid; every unvisited land cell starts a new island, and a DFS from it claims (and measures) the whole island.",
  keywords: ["islands", "connected components", "flood fill", "grid dfs", "max area of island", "count components"],
  problems: [
    { id: 200, title: "Number of Islands", difficulty: "Medium", slug: "number-of-islands", note: "Count how many times the scan has to start a fresh DFS." },
    { id: 695, title: "Max Area of Island", difficulty: "Medium", slug: "max-area-of-island", note: "Same scan; let the DFS return the number of cells it claimed." },
    { id: 463, title: "Island Perimeter", difficulty: "Easy", slug: "island-perimeter", note: "No search needed: each land cell adds 4 minus its land neighbours." },
    { id: 1905, title: "Count Sub Islands", difficulty: "Medium", slug: "count-sub-islands", note: "DFS each island of grid 2 and check every cell is land in grid 1 too." },
    { id: 1254, title: "Number of Closed Islands", difficulty: "Medium", slug: "number-of-closed-islands", note: "Sink islands touching the border first, then count the rest." },
  ],
};

export default meta;
