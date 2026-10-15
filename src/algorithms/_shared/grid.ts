import type { GridField, Rng } from "../../engine/types";
import { seeded } from "../../engine/random";

export type Cell = [number, number];

/** State shared by every grid renderer user. */
export interface GridState {
  grid: string[];
  /**
   * One character per cell (row-major) describing its search status, see GRID_MARK_KINDS:
   * ' ' none, 'v' visited, 'f' frontier, 'p' path, 'x' pruned, 'a' active, 'm' match.
   * A string keeps per-step snapshots tiny compared with one highlight per cell.
   */
  marks?: string;
  /** Optional text drawn inside cells, keyed "r,c". */
  labels?: Record<string, string>;
  /** Optional final answer carried in the state (e.g. the path found). */
  path?: Cell[] | null;
}

export const DIRS: Cell[] = [
  [-1, 0],
  [0, 1],
  [1, 0],
  [0, -1],
];
export const DIR_NAMES = ["up", "right", "down", "left"];

export const cellId = (r: number, c: number) => `cell:${r},${c}`;
export const fmt = ([r, c]: Cell) => `(${r},${c})`;

export function find(grid: string[], ch: string): Cell {
  for (let r = 0; r < grid.length; r++) {
    const c = grid[r].indexOf(ch);
    if (c >= 0) return [r, c];
  }
  throw new Error(`"${ch}" not found in grid`);
}

export function emptyGrid(rows: number, cols: number, start: Cell, end: Cell): string[] {
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) =>
      r === start[0] && c === start[1] ? "S" : r === end[0] && c === end[1] ? "E" : ".",
    ).join(""),
  );
}

/** Perfect maze via randomized depth-first carving on an odd-sized grid. */
export function maze(size: number, seed: number): string[] {
  const n = size % 2 === 0 ? size - 1 : size;
  const rng = seeded(seed);
  const g = Array.from({ length: n }, () => Array(n).fill("#"));
  const stack: Cell[] = [[0, 0]];
  g[0][0] = ".";
  while (stack.length) {
    const [r, c] = stack[stack.length - 1];
    const options = DIRS.map(([dr, dc]) => [r + 2 * dr, c + 2 * dc, r + dr, c + dc]).filter(
      ([nr, nc]) => nr >= 0 && nc >= 0 && nr < n && nc < n && g[nr][nc] === "#",
    );
    if (!options.length) {
      stack.pop();
      continue;
    }
    const [nr, nc, wr, wc] = options[Math.floor(rng() * options.length)];
    g[wr][wc] = ".";
    g[nr][nc] = ".";
    stack.push([nr, nc]);
  }
  g[0][0] = "S";
  g[n - 1][n - 1] = "E";
  return g.map((row) => row.join(""));
}

export function randomWallGrid(rows: number, cols: number, density: number, rng: Rng): string[] {
  const g = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, (): string => (rng() < density ? "#" : ".")),
  );
  const sr = Math.floor(rng() * rows);
  const sc = Math.floor(rng() * cols);
  let er = sr;
  let ec = sc;
  while (er === sr && ec === sc) {
    er = Math.floor(rng() * rows);
    ec = Math.floor(rng() * cols);
  }
  g[sr][sc] = "S";
  g[er][ec] = "E";
  return g.map((row) => row.join(""));
}

export const PATH_GRID_FIELD: GridField = {
  key: "grid",
  label: "Grid",
  kind: "grid",
  maxRows: 30,
  maxCols: 30,
  alphabet: ".#SE",
  unique: "SE",
  help: "Draw on the grid: click or drag to toggle walls, drag the start or end to move them. Text form: '.' open, '#' wall, 'S' start, 'E' end.",
  tools: [
    { char: "#", label: "Wall" },
    { char: "S", label: "Start" },
    { char: "E", label: "End" },
  ],
};

/** Replace one cell's character (returns a new grid). */
export function setCell(grid: string[], r: number, c: number, ch: string): string[] {
  return grid.map((row, i) => (i === r ? row.slice(0, c) + ch + row.slice(c + 1) : row));
}

/** Mutable mark buffer used while generating; snapshot() gives the immutable string for a step. */
export class Marks {
  private chars: string[];
  constructor(private rows: number, private cols: number) {
    this.chars = Array(rows * cols).fill(" ");
  }
  set([r, c]: Cell, ch: string): void {
    this.chars[r * this.cols + c] = ch;
  }
  get([r, c]: Cell): string {
    return this.chars[r * this.cols + c];
  }
  snapshot(): string {
    return this.chars.join("");
  }
  get size(): number {
    return this.rows * this.cols;
  }
}

/** Grid field for character puzzles (islands, oranges…): `empty` is what a toggled-off cell becomes. */
export function charGridField(o: {
  alphabet: string;
  empty: string;
  tools: { char: string; label: string }[];
  help: string;
  key?: string;
  label?: string;
  max?: number;
}): GridField {
  return { key: o.key ?? "grid", label: o.label ?? "Grid", kind: "grid", maxRows: o.max ?? 14, maxCols: o.max ?? 14, alphabet: o.alphabet, empty: o.empty, tools: o.tools, help: o.help };
}

/** Random grid where each cell is drawn from `weights` ([char, relative weight]). */
export function randomCharGrid(rng: Rng, rows: number, cols: number, weights: [string, number][]): string[] {
  const total = weights.reduce((s, [, w]) => s + w, 0);
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => {
      let x = rng() * total;
      for (const [ch, w] of weights) if ((x -= w) < 0) return ch;
      return weights[weights.length - 1][0];
    }).join(""),
  );
}

/** Keep the call-stack panel readable on deep recursions: the bottom frame, an ellipsis, then the top ones. */
export function capFrames<T extends { call: string }>(frames: T[], max = 9): { call: string }[] {
  if (frames.length <= max) return frames;
  return [frames[0], { call: `… ${frames.length - max + 1} more frames …` }, ...frames.slice(frames.length - max + 2)];
}

export const key = ([r, c]: Cell) => `${r},${c}`;
