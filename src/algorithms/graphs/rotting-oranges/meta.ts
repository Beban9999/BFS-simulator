import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "rotting-oranges",
  title: "Rotting Oranges (multi-source BFS)",
  category: "graphs",
  subcategory: "Grid patterns",
  difficulty: "core",
  order: 3,
  summary: "Start BFS from every rotten orange at once; each BFS layer is one minute of rot spreading.",
  keywords: ["multi-source bfs", "rotting oranges", "layers", "minutes", "spread", "walls and gates", "01 matrix"],
  problems: [
    { id: 994, title: "Rotting Oranges", difficulty: "Medium", slug: "rotting-oranges", note: "This page: count BFS layers until no fresh orange is left (or report -1)." },
    { id: 542, title: "01 Matrix", difficulty: "Medium", slug: "01-matrix", note: "Every zero is a source; the layer at which a cell is reached is its distance." },
    { id: 286, title: "Walls and Gates", difficulty: "Medium", slug: "walls-and-gates", note: "All gates start in the queue; rooms take the layer number as their distance." },
    { id: 1162, title: "As Far from Land as Possible", difficulty: "Medium", slug: "as-far-from-land-as-possible", note: "Multi-source BFS from all land; the last water cell reached gives the answer." },
  ],
};

export default meta;
