import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "flood-fill",
  title: "Flood Fill",
  category: "graphs",
  subcategory: "Grid patterns",
  difficulty: "core",
  order: 2,
  summary: "The paint-bucket tool: recolour the start cell, then spread to every 4-connected cell that still has the old colour.",
  keywords: ["flood fill", "paint bucket", "connected region", "recolour", "grid bfs"],
  problems: [
    { id: 733, title: "Flood Fill", difficulty: "Easy", slug: "flood-fill", note: "This page; remember the early return when the new colour equals the old one." },
    { id: 1034, title: "Coloring A Border", difficulty: "Medium", slug: "coloring-a-border", note: "Flood the component, but only recolour cells that touch the edge or another colour." },
    { id: 529, title: "Minesweeper", difficulty: "Medium", slug: "minesweeper", note: "Flood outward from a click, stopping at cells that border a mine." },
  ],
};

export default meta;
