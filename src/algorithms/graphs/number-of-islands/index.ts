import type { AlgorithmModule, Frame } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { Marks, capFrames, cellId, charGridField, fmt, randomCharGrid, type Cell, type GridState } from "../../_shared/grid";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  grid: string[];
}

interface Output {
  count: number;
  maxArea: number;
}

// Same order as the code: down, up, right, left.
const ORDER: Cell[] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

function* generate({ grid }: Input) {
  const t = new Tracer<GridState>();
  const rows = grid.length;
  const cols = grid[0].length;
  const marks = new Marks(rows, cols);
  const seen = new Set<number>();
  const labels: Record<string, string> = {};
  const frames: Frame[] = [];
  const areas: number[] = [];
  let count = 0;
  let best = 0;

  const state = (): GridState => ({ grid, marks: marks.snapshot(), labels });
  const vars = (extra: Record<string, unknown> = {}) => ({ count, best, ...extra });

  function* dfs(r: number, c: number): Generator<ReturnType<typeof t.step>, number> {
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] !== "1" || seen.has(r * cols + c)) return 0;
    seen.add(r * cols + c);
    marks.set([r, c], "a");
    labels[`${r},${c}`] = String(count);
    frames.push({ call: `dfs(${r}, ${c})` });
    t.count("calls");
    yield t.step("visit", `dfs${fmt([r, c])}: land not seen yet — claim it for island ${count}. Next try down, up, right, left.`, {
      state: state(),
      vars: vars({ r, c, depth: frames.length }),
      callStack: capFrames(frames),
      highlights: hl("current", cellId(r, c)),
    });
    let area = 1;
    for (const [dr, dc] of ORDER) area += yield* dfs(r + dr, c + dc);
    frames.pop();
    return area;
  }

  yield t.step("scan", `Scan the ${rows}×${cols} grid row by row looking for land ('1') that no island has claimed.`, {
    state: state(),
    vars: vars(),
  });

  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      t.count("comparisons");
      if (grid[r][c] !== "1" || seen.has(r * cols + c)) continue;
      count++;
      yield t.step("scan", `The scan reaches ${fmt([r, c])}: unclaimed land, so it starts island #${count}.`, {
        state: state(),
        vars: vars({ r, c }),
        highlights: hl("current", cellId(r, c)),
      });
      const area = yield* dfs(r, c);
      areas.push(area);
      const cells: Cell[] = [];
      for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) if (labels[`${i},${j}`] === String(count)) cells.push([i, j]);
      for (const cell of cells) marks.set(cell, "v");
      const improved = area > best;
      best = Math.max(best, area);
      yield t.step("island-done", `Island #${count} is complete with area ${area}.` + (improved ? ` New largest island.` : ` Largest so far is still ${best}.`), {
        state: state(),
        vars: vars({ area }),
        callStack: [],
        highlights: hl("found", ...cells.map(([i, j]) => cellId(i, j))),
      });
    }

  yield t.step(
    "done",
    count === 0 ? "No land at all: 0 islands, max area 0." : `Scan finished: ${count} island${count === 1 ? "" : "s"} (areas ${areas.join(", ")}), the largest has area ${best}.`,
    { state: state(), vars: vars() },
  );
}

function reference({ grid }: Input): Output {
  const rows = grid.length;
  const cols = grid[0].length;
  const seen = new Set<number>();
  let count = 0;
  let maxArea = 0;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== "1" || seen.has(r * cols + c)) continue;
      count++;
      let area = 0;
      const stack: Cell[] = [[r, c]];
      seen.add(r * cols + c);
      while (stack.length) {
        const [i, j] = stack.pop()!;
        area++;
        for (const [di, dj] of ORDER) {
          const a = i + di;
          const b = j + dj;
          if (a >= 0 && a < rows && b >= 0 && b < cols && grid[a][b] === "1" && !seen.has(a * cols + b)) {
            seen.add(a * cols + b);
            stack.push([a, b]);
          }
        }
      }
      maxArea = Math.max(maxArea, area);
    }
  return { count, maxArea };
}

const algorithm: AlgorithmModule<Input, GridState> = {
  ...meta,
  renderer: "grid",
  inputSchema: {
    fields: [
      charGridField({
        alphabet: "01",
        empty: "0",
        tools: [{ char: "1", label: "Land" }],
        help: "Click or drag on the grid to toggle land. Text form: '1' land, '0' water, one row per line.",
      }),
    ],
  },
  presets: [
    { name: "LeetCode-style: 3 islands", input: { grid: ["11000", "11000", "00100", "00011"] } },
    { name: "Islands of different sizes", input: { grid: ["1101100", "1001101", "0001001", "1100011", "1110000", "0000111"] } },
    { name: "Edge case: all water", input: { grid: ["000", "000"] } },
    { name: "Checkerboard: many 1-cell islands", input: { grid: ["10101", "01010", "10101", "01010"] } },
    { name: "Snake: one long island (deep recursion)", input: { grid: ["11111", "00001", "11111", "10000", "11111"] } },
  ],
  randomInput: (size, rng = Math.random) => {
    const n = Math.max(2, Math.min(10, size));
    return { grid: randomCharGrid(rng, n, randInt(rng, Math.max(2, n - 2), n + 1), [["1", 45], ["0", 55]]) };
  },
  code: { python, javascript },
  generate,
  reference,
  outputOf: (_state, step) => ({ count: step.vars.count as number, maxArea: step.vars.best as number }),
  info,
  rendererOptions: { charKinds: { "1": "frontier" } },
  legendLabels: { frontier: "Unclaimed land", active: "Island being claimed", visited: "Claimed (label = island #)", current: "dfs cell", found: "Finished island" },
  legendExtra: ["frontier"],
};

export default algorithm;
