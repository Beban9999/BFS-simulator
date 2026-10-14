import type { AlgorithmModule } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import {
  DIRS,
  DIR_NAMES,
  Marks,
  PATH_GRID_FIELD,
  cellId,
  emptyGrid,
  find,
  fmt,
  maze,
  randomWallGrid,
  type Cell,
  type GridState,
} from "../../_shared/grid";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  grid: string[];
}

function* generate({ grid }: Input) {
  const t = new Tracer<GridState>();
  const rows = grid.length;
  const cols = grid[0].length;
  const start = find(grid, "S");
  const end = find(grid, "E");
  const key = ([r, c]: Cell) => `${r},${c}`;
  const prev = new Map<string, Cell | null>([[key(start), null]]);
  const queue: Cell[] = [start];
  const marks = new Marks(rows, cols);
  let head = 0;
  let explored = 0;
  marks.set(start, "f");

  const state = (path: Cell[] | null = null): GridState => ({ grid, marks: marks.snapshot(), path });
  const aux = (highlight?: number) => [
    {
      label: "Queue (front → back)",
      kind: "queue" as const,
      items: queue.slice(head).map(fmt),
      highlight: highlight === undefined ? undefined : [highlight],
    },
  ];

  yield t.step("init", `Put the start ${fmt(start)} in the queue and mark it seen.`, {
    state: state(),
    vars: { start: fmt(start), end: fmt(end) },
    aux: aux(),
  });

  while (head < queue.length) {
    const cur = queue[head++];
    const [r, c] = cur;
    explored++;
    t.count("expanded");
    yield t.step("pop", `Dequeue ${fmt(cur)} — the oldest cell waiting in the queue.`, {
      state: state(),
      vars: { r, c, "queue size": queue.length - head, explored },
      aux: aux(),
      highlights: hl("current", cellId(r, c)),
    });

    if (r === end[0] && c === end[1]) {
      marks.set(cur, "v");
      const path: Cell[] = [];
      for (let cell: Cell | null = end; cell; cell = prev.get(key(cell)) ?? null) path.unshift(cell);
      yield t.step("found", `Reached the end ${fmt(end)}. Walk the prev links back to the start.`, {
        state: state(),
        vars: { r, c, explored },
        aux: aux(),
        highlights: hl("current", cellId(r, c)),
      });
      for (let i = 0; i < path.length; i++) {
        marks.set(path[i], "p");
        const last = i === path.length - 1;
        yield t.step(
          "trace",
          last
            ? `Shortest path: ${path.length - 1} steps, found after exploring ${explored} cells.`
            : `Path cell ${fmt(path[i])} (${i} step${i === 1 ? "" : "s"} from the start).`,
          { state: state(last ? path : null), vars: { "path length": i, explored }, aux: aux() },
        );
      }
      return;
    }

    let added = 0;
    for (let d = 0; d < 4; d++) {
      const [dr, dc] = DIRS[d];
      const nr = r + dr;
      const nc = c + dc;
      t.count("comparisons");
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || grid[nr][nc] === "#" || prev.has(key([nr, nc]))) continue;
      prev.set(key([nr, nc]), cur);
      queue.push([nr, nc]);
      marks.set([nr, nc], "f");
      added++;
      yield t.step(
        "push",
        `Neighbour ${fmt([nr, nc])} (${DIR_NAMES[d]}) is open and unseen: record prev = ${fmt(cur)} and enqueue it.`,
        {
          state: state(),
          vars: { r, c, nr, nc, "queue size": queue.length - head },
          aux: aux(queue.length - head - 1),
          highlights: hl("current", cellId(r, c)),
        },
      );
    }
    marks.set(cur, "v");
    if (!added) {
      yield t.step("loop", `${fmt(cur)} has no new neighbours; it is fully explored.`, {
        state: state(),
        vars: { r, c, "queue size": queue.length - head },
        aux: aux(),
      });
    }
  }

  yield t.step("no-path", `The queue is empty: the end is unreachable. Explored all ${explored} reachable cells.`, {
    state: state(),
    vars: { explored },
    aux: aux(),
  });
}

function reference({ grid }: Input): Cell[] | null {
  const rows = grid.length;
  const cols = grid[0].length;
  const start = find(grid, "S");
  const end = find(grid, "E");
  const prev = new Map<number, Cell | null>([[start[0] * cols + start[1], null]]);
  const queue: Cell[] = [start];
  for (let head = 0; head < queue.length; head++) {
    const [r, c] = queue[head];
    if (r === end[0] && c === end[1]) {
      const path: Cell[] = [];
      for (let cell: Cell | null = end; cell; cell = prev.get(cell[0] * cols + cell[1]) ?? null) path.unshift(cell);
      return path;
    }
    for (const [dr, dc] of DIRS) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nc >= 0 && nr < rows && nc < cols && grid[nr][nc] !== "#" && !prev.has(nr * cols + nc)) {
        prev.set(nr * cols + nc, [r, c]);
        queue.push([nr, nc]);
      }
    }
  }
  return null;
}

const algorithm: AlgorithmModule<Input, GridState> = {
  ...meta,
  renderer: "grid",
  inputSchema: { fields: [PATH_GRID_FIELD] },
  presets: [
    { name: "Open 20×20 grid", input: { grid: emptyGrid(20, 20, [0, 0], [15, 15]) } },
    { name: "Maze", input: { grid: maze(19, 7) } },
    {
      name: "Wall in the way",
      input: {
        grid: emptyGrid(12, 16, [6, 1], [6, 14]).map((row, r) =>
          r >= 2 && r <= 10 ? row.slice(0, 8) + "#" + row.slice(9) : row,
        ),
      },
    },
    { name: "Edge case: unreachable end", input: { grid: ["S....", ".....", "...##", "...#E"] } },
    { name: "Edge case: start next to end", input: { grid: ["SE"] } },
  ],
  randomInput: (size, rng = Math.random) => {
    const n = Math.max(2, Math.min(30, size));
    return { grid: randomWallGrid(n, randInt(rng, Math.max(2, n - 4), n), 0.28, rng) };
  },
  code: { python, javascript },
  generate,
  reference,
  outputOf: (state) => state.path ?? null,
  info,
  legendLabels: { frontier: "In the queue" },
  legendExtra: ["start", "end", "wall"],
};

export default algorithm;
