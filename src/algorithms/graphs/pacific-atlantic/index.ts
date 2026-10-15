import type { AlgorithmModule, GridField } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { Marks, cellId, fmt, randomCharGrid, type Cell, type GridState } from "../../_shared/grid";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  grid: string[];
}

const HEIGHTS_FIELD: GridField = {
  key: "grid",
  label: "Heights",
  kind: "grid",
  maxRows: 8,
  maxCols: 8,
  alphabet: "0123456789",
  help: "One row of digits (heights 0–9) per line.",
};

function* generate({ grid }: Input) {
  const t = new Tracer<GridState>();
  const rows = grid.length;
  const cols = grid[0].length;
  const h = (r: number, c: number) => Number(grid[r][c]);
  const marks = new Marks(rows, cols);
  const pac = new Set<number>();
  const atl = new Set<number>();
  const state = (): GridState => ({ grid, marks: marks.snapshot() });

  function* climb(starts: Cell[], seen: Set<number>, name: string, line: "pacific" | "atlantic") {
    // Pacific cells are 'a'; Atlantic cells become 'f', or 'p' when the Pacific also reached them.
    const paint = ([r, c]: Cell) => marks.set([r, c], line === "pacific" ? "a" : pac.has(r * cols + c) ? "p" : "f");
    const queue: Cell[] = [];
    for (const [r, c] of starts)
      if (!seen.has(r * cols + c)) {
        seen.add(r * cols + c);
        queue.push([r, c]);
        paint([r, c]);
      }
    let head = 0;
    const aux = () => [{ label: `${name} queue`, kind: "queue" as const, items: queue.slice(head).map(fmt) }];
    yield t.step(line, `${name}: every cell on its coast drains straight into it. Queue all ${queue.length} coast cells and climb uphill from them.`, {
      state: state(),
      vars: { ocean: name, reached: seen.size },
      aux: aux(),
    });
    while (head < queue.length) {
      const [r, c] = queue[head++];
      t.count("pops");
      const up: Cell[] = [];
      for (const [nr, nc] of [
        [r + 1, c],
        [r - 1, c],
        [r, c + 1],
        [r, c - 1],
      ] as Cell[]) {
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || seen.has(nr * cols + nc)) continue;
        t.count("comparisons");
        if (h(nr, nc) >= h(r, c)) {
          seen.add(nr * cols + nc);
          queue.push([nr, nc]);
          paint([nr, nc]);
          up.push([nr, nc]);
        }
      }
      yield t.step(
        up.length ? "climb" : "pop",
        up.length
          ? `${fmt([r, c])} (height ${h(r, c)}): water from ${up.map((x) => `${fmt(x)} [${h(...x)}]`).join(", ")} can flow down into it, so ${up.length === 1 ? "that cell reaches" : "they reach"} the ${name} too.`
          : `${fmt([r, c])} (height ${h(r, c)}): no new neighbour is as high or higher.`,
        {
          state: state(),
          vars: { ocean: name, r, c, height: h(r, c), reached: seen.size },
          aux: aux(),
          highlights: [...hl("current", cellId(r, c)), ...hl("compare", ...up.map(([a, b]) => cellId(a, b)))],
        },
      );
    }
  }

  const topLeft: Cell[] = [];
  const bottomRight: Cell[] = [];
  for (let c = 0; c < cols; c++) {
    topLeft.push([0, c]);
    bottomRight.push([rows - 1, c]);
  }
  for (let r = 1; r < rows; r++) topLeft.push([r, 0]);
  for (let r = 0; r < rows - 1; r++) bottomRight.push([r, cols - 1]);

  yield* climb(topLeft, pac, "Pacific", "pacific");
  yield* climb(bottomRight, atl, "Atlantic", "atlantic");

  const both: Cell[] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (pac.has(r * cols + c) && atl.has(r * cols + c)) both.push([r, c]);
  yield t.step("done", `${both.length} cell${both.length === 1 ? "" : "s"} reach both oceans: ${both.map(fmt).join(", ")}.`, {
    state: { ...state(), path: both },
    vars: { pacific: pac.size, atlantic: atl.size, both: both.length },
    highlights: hl("found", ...both.map(([r, c]) => cellId(r, c))),
  });
}

function reference({ grid }: Input): Cell[] {
  const rows = grid.length;
  const cols = grid[0].length;
  const flowsTo = (sr: number, sc: number, ocean: (r: number, c: number) => boolean) => {
    const seen = new Set([sr * cols + sc]);
    const stack: Cell[] = [[sr, sc]];
    while (stack.length) {
      const [r, c] = stack.pop()!;
      if (ocean(r, c)) return true;
      for (const [nr, nc] of [
        [r + 1, c],
        [r - 1, c],
        [r, c + 1],
        [r, c - 1],
      ])
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !seen.has(nr * cols + nc) && Number(grid[nr][nc]) <= Number(grid[r][c])) {
          seen.add(nr * cols + nc);
          stack.push([nr, nc]);
        }
    }
    return false;
  };
  const out: Cell[] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (flowsTo(r, c, (a, b) => a === 0 || b === 0) && flowsTo(r, c, (a, b) => a === rows - 1 || b === cols - 1)) out.push([r, c]);
  return out;
}

const algorithm: AlgorithmModule<Input, GridState> = {
  ...meta,
  renderer: "grid",
  inputSchema: { fields: [HEIGHTS_FIELD] },
  presets: [
    { name: "LeetCode example", input: { grid: ["12235", "32344", "24531", "67145", "51124"] } },
    { name: "A ridge across the middle", input: { grid: ["1111", "5555", "1111"] } },
    { name: "Edge case: single cell", input: { grid: ["7"] } },
    { name: "Flat plain: every cell drains both ways", input: { grid: ["333", "333", "333"] } },
    { name: "Bowl: centre is lowest", input: { grid: ["9999", "9119", "9119", "9999"] } },
  ],
  randomInput: (size, rng = Math.random) => {
    const n = Math.max(1, Math.min(7, size));
    return { grid: randomCharGrid(rng, n, randInt(rng, 1, n + 1), "0123456789".split("").map((d) => [d, 1] as [string, number])) };
  },
  code: { python, javascript },
  generate,
  reference,
  outputOf: (state) => state.path,
  info,
  rendererOptions: { charKinds: {}, showChars: "0123456789" },
  legendLabels: { active: "Drains to the Pacific", frontier: "Drains to the Atlantic", path: "Drains to both", current: "Dequeued cell", compare: "Climbed to", found: "Answer" },
};

export default algorithm;
