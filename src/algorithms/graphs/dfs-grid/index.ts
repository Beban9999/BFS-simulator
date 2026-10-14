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

/** Neighbour order pushed onto the stack: reverse of up, right, down, left. */
const PUSH_ORDER = [3, 2, 1, 0];

function* generate({ grid }: Input) {
  const t = new Tracer<GridState>();
  const rows = grid.length;
  const cols = grid[0].length;
  const start = find(grid, "S");
  const end = find(grid, "E");
  const key = ([r, c]: Cell) => `${r},${c}`;
  const prev = new Map<string, Cell | null>([[key(start), null]]);
  const done = new Set<string>();
  const stack: Cell[] = [start];
  const marks = new Marks(rows, cols);
  marks.set(start, "f");

  const state = (path: Cell[] | null = null): GridState => ({ grid, marks: marks.snapshot(), path });
  const aux = (highlight?: number) => [
    {
      label: "Stack",
      kind: "stack" as const,
      items: stack.map(fmt),
      highlight: highlight === undefined ? undefined : [highlight],
    },
  ];

  yield t.step("init", `Push the start ${fmt(start)} onto the stack.`, {
    state: state(),
    vars: { start: fmt(start), end: fmt(end) },
    aux: aux(),
  });

  while (stack.length) {
    const cur = stack.pop()!;
    const [r, c] = cur;
    t.count("pops");
    yield t.step("pop", `Pop ${fmt(cur)} from the top of the stack — the most recently discovered cell.`, {
      state: state(),
      vars: { r, c, "stack size": stack.length, explored: done.size },
      aux: aux(),
      highlights: hl("current", cellId(r, c)),
    });
    if (done.has(key(cur))) {
      yield t.step("skip", `${fmt(cur)} was already explored through another route; skip this stale copy.`, {
        state: state(),
        vars: { r, c, "stack size": stack.length },
        aux: aux(),
      });
      continue;
    }
    done.add(key(cur));
    marks.set(cur, "v");
    t.count("expanded");

    if (r === end[0] && c === end[1]) {
      const path: Cell[] = [];
      for (let cell: Cell | null = end; cell; cell = prev.get(key(cell)) ?? null) path.unshift(cell);
      yield t.step("found", `Reached the end ${fmt(end)}. Follow the prev links back to the start.`, {
        state: state(),
        vars: { r, c, explored: done.size },
        aux: aux(),
        highlights: hl("current", cellId(r, c)),
      });
      for (let i = 0; i < path.length; i++) {
        marks.set(path[i], "p");
        const last = i === path.length - 1;
        yield t.step(
          "trace",
          last
            ? `DFS found a path of ${path.length - 1} steps after exploring ${done.size} cells (not necessarily the shortest).`
            : `Path cell ${fmt(path[i])}.`,
          { state: state(last ? path : null), vars: { "path length": i, explored: done.size }, aux: aux() },
        );
      }
      return;
    }

    yield t.step("visit", `Mark ${fmt(cur)} explored and look at its neighbours.`, {
      state: state(),
      vars: { r, c, explored: done.size },
      aux: aux(),
      highlights: hl("current", cellId(r, c)),
    });

    for (const d of PUSH_ORDER) {
      const [dr, dc] = DIRS[d];
      const nr = r + dr;
      const nc = c + dc;
      t.count("comparisons");
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || grid[nr][nc] === "#" || done.has(key([nr, nc]))) continue;
      prev.set(key([nr, nc]), cur);
      stack.push([nr, nc]);
      marks.set([nr, nc], "f");
      t.count("pushes");
      yield t.step(
        "push",
        `Push ${fmt([nr, nc])} (${DIR_NAMES[d]}).${d === 0 ? " It goes on last, so it is explored next." : ""}`,
        {
          state: state(),
          vars: { r, c, nr, nc, "stack size": stack.length },
          aux: aux(stack.length - 1),
          highlights: hl("current", cellId(r, c)),
        },
      );
    }
  }

  yield t.step("no-path", `The stack is empty: the end is unreachable. Explored all ${done.size} reachable cells.`, {
    state: state(),
    vars: { explored: done.size },
    aux: aux(),
  });
}

function reference({ grid }: Input): Cell[] | null {
  const rows = grid.length;
  const cols = grid[0].length;
  const start = find(grid, "S");
  const end = find(grid, "E");
  const id = ([r, c]: Cell) => r * cols + c;
  const prev = new Map<number, Cell | null>([[id(start), null]]);
  const done = new Set<number>();
  const stack: Cell[] = [start];
  while (stack.length) {
    const cur = stack.pop()!;
    if (done.has(id(cur))) continue;
    done.add(id(cur));
    if (cur[0] === end[0] && cur[1] === end[1]) {
      const path: Cell[] = [];
      for (let cell: Cell | null = end; cell; cell = prev.get(id(cell)) ?? null) path.unshift(cell);
      return path;
    }
    for (const d of PUSH_ORDER) {
      const nr = cur[0] + DIRS[d][0];
      const nc = cur[1] + DIRS[d][1];
      if (nr >= 0 && nc >= 0 && nr < rows && nc < cols && grid[nr][nc] !== "#" && !done.has(nr * cols + nc)) {
        prev.set(nr * cols + nc, cur);
        stack.push([nr, nc]);
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
    { name: "Worst case: end right next to start", input: { grid: emptyGrid(10, 10, [5, 5], [5, 6]) } },
    { name: "Edge case: unreachable end", input: { grid: ["S....", ".....", "...##", "...#E"] } },
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
  legendLabels: { frontier: "On the stack" },
  legendExtra: ["start", "end", "wall"],
};

export default algorithm;
