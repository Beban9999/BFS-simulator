import type { AlgorithmModule } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { cellId, charGridField, fmt, randomCharGrid, setCell, type Cell, type GridState } from "../../_shared/grid";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  grid: string[];
  sr: number;
  sc: number;
  color: number;
}

function* generate({ grid: input, sr, sc, color }: Input) {
  const t = new Tracer<GridState>();
  let image = input.slice();
  const rows = image.length;
  const cols = image[0].length;
  const old = image[sr][sc];
  const neu = String(color);
  const state = (): GridState => ({ grid: image });

  if (old === neu) {
    yield t.step("same", `The start cell ${fmt([sr, sc])} already has colour ${color}. Painting would change nothing (and the search would never stop), so return the image as is.`, {
      state: state(),
      vars: { old: Number(old), color },
      highlights: hl("current", cellId(sr, sc)),
    });
    return;
  }

  image = setCell(image, sr, sc, neu);
  const queue: Cell[] = [[sr, sc]];
  let head = 0;
  let painted = 1;
  const aux = () => [{ label: "queue", kind: "queue" as const, items: queue.slice(head).map(fmt) }];
  yield t.step("start", `Old colour is ${old}. Paint the start ${fmt([sr, sc])} with ${color} and queue it.`, {
    state: state(),
    vars: { old: Number(old), color, painted },
    aux: aux(),
    highlights: hl("current", cellId(sr, sc)),
  });

  while (head < queue.length) {
    const [r, c] = queue[head++];
    t.count("pops");
    const fresh: Cell[] = [];
    for (const [nr, nc] of [
      [r + 1, c],
      [r - 1, c],
      [r, c + 1],
      [r, c - 1],
    ] as Cell[]) {
      t.count("comparisons");
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && image[nr][nc] === old) {
        image = setCell(image, nr, nc, neu);
        queue.push([nr, nc]);
        fresh.push([nr, nc]);
        painted++;
        t.count("writes");
      }
    }
    yield t.step(
      fresh.length ? "paint" : "pop",
      fresh.length
        ? `Dequeue ${fmt([r, c])}: neighbour${fresh.length === 1 ? "" : "s"} ${fresh.map(fmt).join(", ")} still ${fresh.length === 1 ? "has" : "have"} colour ${old} → paint and queue.`
        : `Dequeue ${fmt([r, c])}: no neighbour has the old colour ${old}.`,
      {
        state: state(),
        vars: { r, c, painted, "queue size": queue.length - head },
        aux: aux(),
        highlights: [...hl("current", cellId(r, c)), ...hl("path", ...fresh.map(([a, b]) => cellId(a, b)))],
      },
    );
  }

  yield t.step("done", `Queue empty: ${painted} cell${painted === 1 ? "" : "s"} repainted from ${old} to ${color}.`, {
    state: state(),
    vars: { painted },
    aux: aux(),
  });
}

function reference({ grid, sr, sc, color }: Input): string[] {
  const g = grid.map((row) => row.split(""));
  const old = g[sr][sc];
  const neu = String(color);
  if (old === neu) return grid;
  const fill = (r: number, c: number) => {
    if (g[r]?.[c] !== old) return;
    g[r][c] = neu;
    fill(r + 1, c);
    fill(r - 1, c);
    fill(r, c + 1);
    fill(r, c - 1);
  };
  fill(sr, sc);
  return g.map((row) => row.join(""));
}

const algorithm: AlgorithmModule<Input, GridState> = {
  ...meta,
  renderer: "grid",
  inputSchema: {
    fields: [
      charGridField({
        label: "Image",
        alphabet: "0123",
        empty: "0",
        tools: [
          { char: "1", label: "Colour 1" },
          { char: "2", label: "Colour 2" },
          { char: "3", label: "Colour 3" },
        ],
        help: "Digits 0–3 are colours, one row per line. Paint on the grid with the tools below it.",
      }),
      { key: "sr", label: "Start row", kind: "number", integer: true, min: 0, max: 13 },
      { key: "sc", label: "Start column", kind: "number", integer: true, min: 0, max: 13 },
      { key: "color", label: "New colour", kind: "number", integer: true, min: 0, max: 3 },
    ],
    validate: ({ grid, sr, sc }) => (sr >= grid.length || sc >= grid[0].length ? "The start cell must be inside the image." : null),
  },
  presets: [
    { name: "LeetCode example", input: { grid: ["111", "110", "101"], sr: 1, sc: 1, color: 2 } },
    { name: "Region with a hole", input: { grid: ["0000000", "0111110", "0122210", "0122210", "0111110", "0000000"], sr: 0, sc: 3, color: 3 } },
    { name: "Edge case: same colour (no-op)", input: { grid: ["000", "000"], sr: 0, sc: 0, color: 0 } },
    { name: "Fill the whole image", input: { grid: ["11111", "11111", "11111", "11111"], sr: 3, sc: 4, color: 3 } },
  ],
  randomInput: (size, rng = Math.random) => {
    const n = Math.max(2, Math.min(9, size));
    const grid = randomCharGrid(rng, n, randInt(rng, 2, n + 1), [["0", 30], ["1", 50], ["2", 20]]);
    return { grid, sr: randInt(rng, 0, grid.length - 1), sc: randInt(rng, 0, grid[0].length - 1), color: randInt(rng, 0, 3) };
  },
  code: { python, javascript },
  generate,
  reference,
  outputOf: (state) => state.grid,
  info,
  rendererOptions: { charKinds: { "1": "window", "2": "found", "3": "compare" }, showChars: "0123" },
  legendLabels: { window: "Colour 1", found: "Colour 2", compare: "Colour 3", current: "Dequeued cell", path: "Just painted" },
  legendExtra: ["window", "found", "compare"],
};

export default algorithm;
