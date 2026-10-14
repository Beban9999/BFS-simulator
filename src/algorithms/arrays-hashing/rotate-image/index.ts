import type { AlgorithmModule } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { countingMatrix, matrixField, mi, randomMatrix, type MatrixState } from "../../_shared/matrix";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  matrix: number[][];
}

function* generate({ matrix: input }: Input) {
  const t = new Tracer<MatrixState>();
  const m = input.map((row) => row.slice());
  const n = m.length;
  const diag = () => hl("active", ...Array.from({ length: n }, (_, k) => mi(k, k)));
  const state = (caption: string, result?: number[][]): MatrixState => ({ matrix: m.map((r) => r.slice()), caption, result });

  yield t.step("transpose-loop", `Step 1: transpose. Swap each cell above the main diagonal with its mirror below it.`, {
    state: state("Step 1 of 2: transpose"),
    vars: { n },
    highlights: diag(),
  });

  for (let r = 0; r < n; r++) {
    for (let c = r + 1; c < n; c++) {
      [m[r][c], m[c][r]] = [m[c][r], m[r][c]];
      t.count("swaps");
      yield t.step("transpose", `Swap (${r},${c}) ↔ (${c},${r}): values ${m[c][r]} and ${m[r][c]} trade places.`, {
        state: state("Step 1 of 2: transpose"),
        vars: { r, c },
        highlights: [...diag(), ...hl("swap", mi(r, c), mi(c, r))],
      });
    }
  }

  yield t.step("reverse-loop", "Step 2: the matrix is now transposed. Reverse every row to finish the clockwise turn.", {
    state: state("Step 2 of 2: reverse each row"),
    vars: { n },
  });

  for (let r = 0; r < n; r++) {
    for (let left = 0, right = n - 1; left < right; left++, right--) {
      [m[r][left], m[r][right]] = [m[r][right], m[r][left]];
      t.count("swaps");
      yield t.step("reverse", `Row ${r}: swap columns ${left} and ${right}.`, {
        state: state("Step 2 of 2: reverse each row"),
        vars: { row: r, left, right },
        highlights: [...hl("visited", ...Array.from({ length: r }, (_, k) => k).flatMap((rr) => Array.from({ length: n }, (_, cc) => mi(rr, cc)))), ...hl("swap", mi(r, left), mi(r, right))],
      });
    }
  }

  yield t.step("done", "Rotated 90° clockwise in place.", {
    state: state("Rotated 90° clockwise", m.map((row) => row.slice())),
    highlights: hl("sorted", ...m.flatMap((row, r) => row.map((_, c) => mi(r, c)))),
  });
}

function reference({ matrix }: Input): number[][] {
  const n = matrix.length;
  return Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => matrix[n - 1 - c][r]));
}

const algorithm: AlgorithmModule<Input, MatrixState> = {
  ...meta,
  renderer: "matrix",
  inputSchema: {
    fields: [matrixField("matrix", "matrix (square)", { maxRows: 7, maxCols: 7 })],
    validate: ({ matrix }) => (matrix.length === 0 || matrix.some((row) => row.length !== matrix.length) ? "The matrix must be square (n×n) and non-empty." : null),
  },
  presets: [
    { name: "LeetCode example 3×3", input: { matrix: countingMatrix(3) } },
    { name: "4×4", input: { matrix: countingMatrix(4) } },
    { name: "Edge case: 1×1", input: { matrix: [[7]] } },
    { name: "5×5 (odd size, centre stays put)", input: { matrix: countingMatrix(5) } },
  ],
  randomInput: (size, rng = Math.random) => {
    const n = Math.max(1, Math.min(6, size));
    return { matrix: randomMatrix(rng, n, n, 1, 9) };
  },
  code: { python, javascript },
  generate,
  reference,
  outputOf: (s) => s.result,
  info,
  legendLabels: { active: "Main diagonal (stays put)", visited: "Row finished", sorted: "Rotated" },
};

export default algorithm;
