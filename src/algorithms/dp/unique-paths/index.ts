import type { AlgorithmModule } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { matrixField } from "../../_shared/matrix";
import { tc, type DPState } from "../../_shared/dp";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  grid: number[][];
}

const FORMULA = "dp[r][c] = dp[r−1][c] (from above) + dp[r][c−1] (from the left);   obstacle → 0";

function* generate({ grid }: Input) {
  const t = new Tracer<DPState>();
  const m = grid.length;
  const n = grid[0].length;
  const dp: (number | string | null)[][] = grid.map((row) => row.map((v) => (v === 1 ? "■" : null)));
  const val = (r: number, c: number) => (r < 0 || c < 0 || grid[r][c] === 1 ? 0 : (dp[r][c] as number));
  const obstacles = grid.flatMap((row, r) => row.flatMap((v, c) => (v === 1 ? [tc(r, c)] : [])));
  const state = (arrows: DPState["arrows"] = [], result?: number): DPState => ({
    formula: FORMULA,
    table: { rows: dp, rowLabels: dp.map((_, r) => `r${r}`), colLabels: grid[0].map((_, c) => `c${c}`) },
    arrows,
    result,
  });

  for (let r = 0; r < m; r++)
    for (let c = 0; c < n; c++) {
      if (grid[r][c] === 1) {
        yield t.step("blocked", `(${r}, ${c}) is an obstacle: 0 paths go through it.`, { state: state(), vars: { r, c }, highlights: [...hl("pruned", ...obstacles), ...hl("mismatch", tc(r, c))] });
        continue;
      }
      if (r === 0 && c === 0) {
        dp[0][0] = 1;
        yield t.step("start", "The start cell: exactly 1 path (stand still).", { state: state(), vars: { r, c }, highlights: [...hl("pruned", ...obstacles), ...hl("current", tc(0, 0))] });
        continue;
      }
      const up = r > 0 ? val(r - 1, c) : 0;
      const left = c > 0 ? val(r, c - 1) : 0;
      dp[r][c] = up + left;
      t.count("writes");
      const arrows: DPState["arrows"] = [];
      if (r > 0) arrows.push({ from: [r - 1, c], to: [r, c] });
      if (c > 0) arrows.push({ from: [r, c - 1], to: [r, c] });
      yield t.step(
        "fill",
        `(${r}, ${c}): from above ${r > 0 ? up : "— (edge)"} + from the left ${c > 0 ? left : "— (edge)"} = ${dp[r][c]}.`,
        {
          state: state(arrows),
          vars: { r, c, up, left, "dp[r][c]": dp[r][c] },
          highlights: [...hl("pruned", ...obstacles), ...hl("compare", ...(r > 0 ? [tc(r - 1, c)] : []), ...(c > 0 ? [tc(r, c - 1)] : [])), ...hl("current", tc(r, c))],
        },
      );
    }
  const ans = val(m - 1, n - 1);
  yield t.step("done", `dp[${m - 1}][${n - 1}] = ${ans} path${ans === 1 ? "" : "s"} from the top-left to the bottom-right.`, { state: state([], ans), vars: { result: ans }, highlights: [...hl("pruned", ...obstacles), ...hl("found", tc(m - 1, n - 1))] });
}

function reference({ grid }: Input): number {
  // Count by recursion over moves (small grids only).
  const m = grid.length;
  const n = grid[0].length;
  const go = (r: number, c: number): number => (r >= m || c >= n || grid[r][c] === 1 ? 0 : r === m - 1 && c === n - 1 ? 1 : go(r + 1, c) + go(r, c + 1));
  return go(0, 0);
}

const open = (m: number, n: number) => Array.from({ length: m }, () => Array(n).fill(0));

const algorithm: AlgorithmModule<Input, DPState> = {
  ...meta,
  renderer: "dptable",
  inputSchema: {
    fields: [matrixField("grid", "grid (1 = obstacle)", { maxRows: 7, maxCols: 7, min: 0, max: 1, help: "Rows of 0 (free) and 1 (obstacle), one row per line." })],
    validate: ({ grid }) => (!grid.length || !grid[0].length ? "The grid needs at least one cell." : null),
  },
  presets: [
    { name: "LeetCode 62: 3 × 7", input: { grid: open(3, 7) } },
    { name: "LeetCode 63: obstacle in the middle", input: { grid: [[0, 0, 0], [0, 1, 0], [0, 0, 0]] } },
    { name: "Wall with one gap", input: { grid: [[0, 0, 0, 0, 0], [1, 1, 1, 0, 1], [0, 0, 0, 0, 0], [0, 1, 0, 0, 0]] } },
    { name: "Edge case: start blocked", input: { grid: [[1, 0], [0, 0]] } },
    { name: "Edge case: 1 × 1", input: { grid: [[0]] } },
  ],
  randomInput: (size, rng = Math.random) => {
    const m = randInt(rng, 1, Math.max(1, Math.min(6, size)));
    const n = randInt(rng, 1, 6);
    return { grid: Array.from({ length: m }, () => Array.from({ length: n }, () => (rng() < 0.18 ? 1 : 0))) };
  },
  code: { python, javascript },
  generate,
  reference,
  outputOf: (state) => state.result,
  info,
  legendLabels: { current: "Cell being filled", compare: "Above / left", found: "Answer", pruned: "Obstacle", mismatch: "Obstacle (0 paths)" },
};

export default algorithm;
