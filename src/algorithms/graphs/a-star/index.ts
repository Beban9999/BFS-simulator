import type { AlgorithmModule } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { Marks, PATH_GRID_FIELD, cellId, emptyGrid, find, fmt, maze, randomWallGrid, type Cell, type GridState } from "../../_shared/grid";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  grid: string[];
}

// Same order as the code: up, right, down, left.
const DIRS: Cell[] = [
  [-1, 0],
  [0, 1],
  [1, 0],
  [0, -1],
];

/** Cells BFS pops before it reaches the end (for the comparison in the last step). */
function bfsExpansions(grid: string[], start: Cell, end: Cell): number {
  const rows = grid.length;
  const cols = grid[0].length;
  const seen = new Set([start[0] * cols + start[1]]);
  const q: Cell[] = [start];
  for (let h = 0; h < q.length; h++) {
    const [r, c] = q[h];
    if (r === end[0] && c === end[1]) return h + 1;
    for (const [dr, dc] of DIRS) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nc >= 0 && nr < rows && nc < cols && grid[nr][nc] !== "#" && !seen.has(nr * cols + nc)) {
        seen.add(nr * cols + nc);
        q.push([nr, nc]);
      }
    }
  }
  return q.length;
}

function* generate({ grid }: Input) {
  const t = new Tracer<GridState>();
  const rows = grid.length;
  const cols = grid[0].length;
  const start = find(grid, "S");
  const end = find(grid, "E");
  const id = ([r, c]: Cell) => r * cols + c;
  const h = ([r, c]: Cell) => Math.abs(r - end[0]) + Math.abs(c - end[1]);
  const g = new Map<number, number>([[id(start), 0]]);
  const prev = new Map<number, Cell | null>([[id(start), null]]);
  const closed = new Set<number>();
  const marks = new Marks(rows, cols);
  const labels: Record<string, string> = {};
  type Entry = { f: number; h: number; cell: Cell };
  let heap: Entry[] = [{ f: h(start), h: h(start), cell: start }];
  const order = (a: Entry, b: Entry) => a.f - b.f || a.h - b.h || a.cell[0] - b.cell[0] || a.cell[1] - b.cell[1];
  let expanded = 0;

  marks.set(start, "f");
  labels[`${start[0]},${start[1]}`] = String(h(start));
  const state = (path: Cell[] | null = null): GridState => ({ grid, marks: marks.snapshot(), labels, path });
  const aux = () => [{ label: "open set (f, h, cell) — smallest first", kind: "heap" as const, items: heap.slice(0, 12).map((e) => `${e.f}, ${e.h}, ${fmt(e.cell)}`).concat(heap.length > 12 ? [`… ${heap.length - 12} more`] : []) }];

  yield t.step("init", `Start ${fmt(start)}: g = 0, h = Manhattan distance to ${fmt(end)} = ${h(start)}, so f = ${h(start)}. Labels show each cell's f.`, {
    state: state(),
    vars: { start: fmt(start), end: fmt(end), "h(start)": h(start) },
    aux: aux(),
  });

  while (heap.length) {
    const { f, cell } = heap[0];
    heap = heap.slice(1);
    t.count("pops");
    if (closed.has(id(cell))) {
      yield t.step("stale", `Pop ${fmt(cell)} (f = ${f}): already expanded through a better entry. Skip.`, { state: state(), vars: { f }, aux: aux(), highlights: hl("pruned", cellId(...cell)) });
      continue;
    }
    closed.add(id(cell));
    marks.set(cell, "v");
    expanded++;
    t.count("expanded");
    const gc = g.get(id(cell))!;
    if (cell[0] === end[0] && cell[1] === end[1]) {
      const path: Cell[] = [];
      for (let c: Cell | null = end; c; c = prev.get(id(c)) ?? null) path.unshift(c);
      yield t.step("found", `Popped the end ${fmt(end)} with g = ${gc}: that is the shortest distance. Follow prev links back.`, {
        state: state(),
        vars: { g: gc, expanded },
        aux: aux(),
        highlights: hl("current", cellId(...cell)),
      });
      for (let i = 0; i < path.length; i++) marks.set(path[i], "p");
      const bfs = bfsExpansions(grid, start, end);
      yield t.step("trace", `Shortest path: ${gc} steps. A* expanded ${expanded} cell${expanded === 1 ? "" : "s"}; BFS on this grid expands ${bfs} before reaching the end.`, {
        state: state(path),
        vars: { "path length": gc, "A* expanded": expanded, "BFS expanded": bfs },
        aux: aux(),
      });
      return;
    }
    yield t.step("pop", `Pop ${fmt(cell)}: smallest f = ${gc} + ${h(cell)} = ${f}. Expand it.`, {
      state: state(),
      vars: { cell: fmt(cell), g: gc, h: h(cell), f, expanded },
      aux: aux(),
      highlights: hl("current", cellId(...cell)),
    });
    const pushed: string[] = [];
    for (const [dr, dc] of DIRS) {
      const nxt: Cell = [cell[0] + dr, cell[1] + dc];
      if (nxt[0] < 0 || nxt[1] < 0 || nxt[0] >= rows || nxt[1] >= cols || grid[nxt[0]][nxt[1]] === "#") continue;
      t.count("comparisons");
      const ng = gc + 1;
      if (ng >= (g.get(id(nxt)) ?? Infinity)) continue;
      g.set(id(nxt), ng);
      prev.set(id(nxt), cell);
      const e = { f: ng + h(nxt), h: h(nxt), cell: nxt };
      heap = [...heap, e].sort(order);
      marks.set(nxt, "f");
      labels[`${nxt[0]},${nxt[1]}`] = String(e.f);
      pushed.push(`${fmt(nxt)} f=${ng}+${h(nxt)}=${e.f}`);
    }
    if (pushed.length)
      yield t.step("relax", `Neighbours with a better g: ${pushed.join("; ")}.`, { state: state(), vars: { g: gc, pushed: pushed.length }, aux: aux(), highlights: hl("current", cellId(...cell)) });
  }
  yield t.step("no-path", `The open set is empty: the end is unreachable (expanded ${expanded} cells).`, { state: state(), vars: { expanded }, aux: aux() });
}

function reference({ grid }: Input): number | null {
  const rows = grid.length;
  const cols = grid[0].length;
  const start = find(grid, "S");
  const end = find(grid, "E");
  const dist = new Map([[start[0] * cols + start[1], 0]]);
  const q: Cell[] = [start];
  for (let i = 0; i < q.length; i++) {
    const [r, c] = q[i];
    if (r === end[0] && c === end[1]) return dist.get(r * cols + c)!;
    for (const [dr, dc] of DIRS) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nc >= 0 && nr < rows && nc < cols && grid[nr][nc] !== "#" && !dist.has(nr * cols + nc)) {
        dist.set(nr * cols + nc, dist.get(r * cols + c)! + 1);
        q.push([nr, nc]);
      }
    }
  }
  return null;
}

const algorithm: AlgorithmModule<Input, GridState> = {
  ...meta,
  renderer: "grid",
  inputSchema: { fields: [{ ...PATH_GRID_FIELD, maxRows: 20, maxCols: 20 }] },
  presets: [
    {
      name: "Wall in the way",
      input: { grid: emptyGrid(12, 16, [6, 1], [6, 14]).map((row, r) => (r >= 2 && r <= 10 ? row.slice(0, 8) + "#" + row.slice(9) : row)) },
    },
    { name: "Open 14×14 grid (goes straight there)", input: { grid: emptyGrid(14, 14, [0, 0], [10, 12]) } },
    { name: "Maze (heuristic helps less)", input: { grid: maze(15, 3) } },
    { name: "Edge case: unreachable end", input: { grid: ["S....", ".....", "...##", "...#E"] } },
    {
      name: "Trap: dead end facing the goal",
      input: { grid: ["..........", "..######..", "S.#....#.E", "..#....#..", "..###.##..", ".........."].map((r) => r) },
    },
  ],
  randomInput: (size, rng = Math.random) => {
    const n = Math.max(2, Math.min(16, size + 2));
    return { grid: randomWallGrid(n, randInt(rng, Math.max(2, n - 3), n), 0.25, rng) };
  },
  code: { python, javascript },
  generate,
  reference,
  outputOf: (_state, step) => (step.line === "trace" ? (step.vars["path length"] as number) : null),
  info,
  legendLabels: { frontier: "Open set", visited: "Expanded (closed)", path: "Shortest path", current: "Expanding", pruned: "Stale entry" },
  legendExtra: ["start", "end", "wall"],
};

export default algorithm;
