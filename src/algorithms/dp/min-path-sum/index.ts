import type { AlgorithmModule } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { matrixField, randomMatrix } from "../../_shared/matrix";
import { tc, type DPState } from "../../_shared/dp";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  grid: number[][];
}

const FORMULA = "dp[r][c] = grid[r][c] + min( dp[r−1][c], dp[r][c−1] )";

function* generate({ grid }: Input) {
  const t = new Tracer<DPState>();
  const m = grid.length;
  const n = grid[0].length;
  const dp: (number | null)[][] = grid.map((row) => row.map(() => null));
  const path: [number, number][] = [];
  // One table: the grid block on top, a blank spacer row, then the dp block (dp row r is table row r + m + 1).
  const state = (arrows: DPState["arrows"] = [], result?: number): DPState => ({
    formula: FORMULA,
    table: {
      rows: [...grid, grid[0].map(() => ""), ...dp],
      rowLabels: [...grid.map((_, r) => `grid r${r}`), "", ...dp.map((_, r) => `dp r${r}`)],
      colLabels: grid[0].map((_, c) => `c${c}`),
    },
    // Arrows are given in dp coordinates; shift them below the grid block.
    arrows: arrows?.map(({ from, to }) => ({ from: [from[0] + m + 1, from[1]], to: [to[0] + m + 1, to[1]] })),
    result,
  });
  const D = (r: number, c: number) => tc(r + m + 1, c);
  const G = (r: number, c: number) => tc(r, c);

  for (let r = 0; r < m; r++)
    for (let c = 0; c < n; c++) {
      t.count("writes");
      if (r === 0 && c === 0) {
        dp[0][0] = grid[0][0];
        yield t.step("start", `Start cell: dp[0][0] = grid[0][0] = ${grid[0][0]}.`, { state: state(), vars: { r, c }, highlights: [...hl("compare", G(0, 0)), ...hl("current", D(0, 0))] });
      } else if (r === 0) {
        dp[r][c] = dp[r][c - 1]! + grid[r][c];
        yield t.step("top", `First row, only reachable from the left: ${dp[r][c - 1]} + ${grid[r][c]} = ${dp[r][c]}.`, {
          state: state([{ from: [r, c - 1], to: [r, c] }]),
          vars: { r, c, "dp[r][c]": dp[r][c] },
          highlights: [...hl("compare", G(r, c)), ...hl("found", D(r, c - 1)), ...hl("current", D(r, c))],
        });
      } else if (c === 0) {
        dp[r][c] = dp[r - 1][c]! + grid[r][c];
        yield t.step("left", `First column, only reachable from above: ${dp[r - 1][c]} + ${grid[r][c]} = ${dp[r][c]}.`, {
          state: state([{ from: [r - 1, c], to: [r, c] }]),
          vars: { r, c, "dp[r][c]": dp[r][c] },
          highlights: [...hl("compare", G(r, c)), ...hl("found", D(r - 1, c)), ...hl("current", D(r, c))],
        });
      } else {
        const up = dp[r - 1][c]!;
        const left = dp[r][c - 1]!;
        dp[r][c] = Math.min(up, left) + grid[r][c];
        t.count("comparisons");
        yield t.step("fill", `(${r}, ${c}): min(above ${up}, left ${left}) = ${Math.min(up, left)}, plus grid ${grid[r][c]} → ${dp[r][c]}.`, {
          state: state([
            { from: [r - 1, c], to: [r, c] },
            { from: [r, c - 1], to: [r, c] },
          ]),
          vars: { r, c, up, left, "dp[r][c]": dp[r][c] },
          highlights: [...hl("compare", G(r, c), up <= left ? D(r, c - 1) : D(r - 1, c)), ...hl("found", up <= left ? D(r - 1, c) : D(r, c - 1)), ...hl("current", D(r, c))],
        });
      }
    }

  let r = m - 1;
  let c = n - 1;
  path.push([r, c]);
  const pathHl = () => hl("path", ...path.flatMap(([a, b]) => [G(a, b), D(a, b)]));
  while (r > 0 || c > 0) {
    if (c === 0 || (r > 0 && dp[r - 1][c]! <= dp[r][c - 1]!)) r--;
    else c--;
    path.push([r, c]);
    yield t.step("trace", `Walk back: the cheaper parent is (${r}, ${c}) with dp ${dp[r][c]}.`, { state: state(), vars: { r, c }, highlights: [...pathHl(), ...hl("current", D(r, c))] });
  }
  const sum = dp[m - 1][n - 1]!;
  yield t.step("done", `Minimum path sum ${sum}: ${path.slice().reverse().map(([a, b]) => grid[a][b]).join(" + ")}.`, { state: state([], sum), vars: { result: sum }, highlights: pathHl() });
}

function reference({ grid }: Input): number {
  // Plain recursion over moves (grids here are tiny).
  const m = grid.length;
  const n = grid[0].length;
  const go = (r: number, c: number): number => {
    if (r === m - 1 && c === n - 1) return grid[r][c];
    const opts: number[] = [];
    if (r + 1 < m) opts.push(go(r + 1, c));
    if (c + 1 < n) opts.push(go(r, c + 1));
    return grid[r][c] + Math.min(...opts);
  };
  return go(0, 0);
}

const algorithm: AlgorithmModule<Input, DPState> = {
  ...meta,
  renderer: "dptable",
  inputSchema: {
    fields: [matrixField("grid", "grid", { maxRows: 5, maxCols: 6, min: 0, max: 99 })],
    validate: ({ grid }) => (!grid.length || !grid[0].length ? "The grid needs at least one cell." : null),
  },
  presets: [
    { name: "LeetCode example", input: { grid: [[1, 3, 1], [1, 5, 1], [4, 2, 1]] } },
    { name: "Detour beats the straight edge", input: { grid: [[1, 9, 9, 9], [1, 1, 1, 9], [9, 9, 1, 1], [9, 9, 9, 1]] } },
    { name: "Edge case: single row", input: { grid: [[3, 1, 4, 1, 5]] } },
    { name: "Edge case: 1 × 1", input: { grid: [[7]] } },
  ],
  randomInput: (size, rng = Math.random) => ({ grid: randomMatrix(rng, randInt(rng, 1, Math.max(1, Math.min(4, size))), randInt(rng, 1, 5), 0, 9) }),
  code: { python, javascript },
  generate,
  reference,
  outputOf: (state) => state.result,
  info,
  legendLabels: { current: "Cell being filled", found: "Cheaper parent", compare: "grid value / other parent", path: "Cheapest path" },
};

export default algorithm;
