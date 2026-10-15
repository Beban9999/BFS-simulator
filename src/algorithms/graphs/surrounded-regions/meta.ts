import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "surrounded-regions",
  title: "Surrounded Regions",
  category: "graphs",
  subcategory: "Grid patterns",
  difficulty: "intermediate",
  order: 5,
  summary: "An 'O' region is captured unless it touches the border, so mark everything reachable from border 'O's as safe and flip the rest.",
  keywords: ["surrounded regions", "border dfs", "capture", "enclaves", "closed islands", "flood from border"],
  problems: [
    { id: 130, title: "Surrounded Regions", difficulty: "Medium", slug: "surrounded-regions", note: "This page: flood from the border, then flip whatever was not reached." },
    { id: 1020, title: "Number of Enclaves", difficulty: "Medium", slug: "number-of-enclaves", note: "Same border flood; count the land cells left unmarked." },
    { id: 1254, title: "Number of Closed Islands", difficulty: "Medium", slug: "number-of-closed-islands", note: "Sink border-connected land first, then count the remaining islands." },
  ],
};

export default meta;
