import type { AlgorithmModule, Highlight } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import type { CellValue } from "../../_shared/array";
import { matrixField, mi, randomMatrix, type MatrixState } from "../../_shared/matrix";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  matrix: number[][];
  queries: number[][];
}

/**
 * The renderer shows the matrix on the left and P on the right in one table:
 * columns 0..C-1 are the matrix, column C is a gap, columns C+1..2C+1 are P.
 */
function* generate({ matrix, queries }: Input) {
  const t = new Tracer<MatrixState>();
  const R = matrix.length;
  const C = matrix[0].length;
  const P: CellValue[][] = Array.from({ length: R + 1 }, (_, r) => Array.from({ length: C + 1 }, (_, c) => (r === 0 || c === 0 ? 0 : null)));
  const off = C + 1; // first column of P in the combined table
  const pi = (r: number, c: number) => mi(r, off + c);
  const answers: number[] = [];

  const state = (caption: string, result?: number[]): MatrixState => {
    const rows: CellValue[][] = [];
    for (let r = 0; r <= R; r++) {
      const left: CellValue[] = r < R ? matrix[r].slice() : Array(C).fill("");
      rows.push([...left, "", ...P[r]]);
    }
    return {
      matrix: rows,
      colLabels: [...Array.from({ length: C }, (_, c) => String(c)), "", ...Array.from({ length: C + 1 }, (_, c) => `P${c}`)],
      rowLabels: Array.from({ length: R + 1 }, (_, r) => String(r)),
      caption,
      result,
    };
  };

  yield t.step("init", `P has an extra row and column of zeros (${R + 1}×${C + 1}), shown to the right of the matrix.`, {
    state: state("Left: matrix · Right: prefix table P"),
    vars: { R, C },
  });

  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      const up = P[r][c + 1] as number;
      const left = P[r + 1][c] as number;
      const diag = P[r][c] as number;
      P[r + 1][c + 1] = matrix[r][c] + up + left - diag;
      t.count("filled");
      yield t.step("build", `P[${r + 1}][${c + 1}] = ${matrix[r][c]} + ${up} (above) + ${left} (left) − ${diag} (overlap) = ${P[r + 1][c + 1]}.`, {
        state: state("Building P"),
        vars: { r, c, "matrix[r][c]": matrix[r][c], above: up, left, overlap: diag },
        highlights: [...hl("current", mi(r, c), pi(r + 1, c + 1)), ...hl("compare", pi(r, c + 1), pi(r + 1, c)), ...hl("removed", pi(r, c))],
      });
    }
  }

  for (const [r1, c1, r2, c2] of queries) {
    const a = P[r2 + 1][c2 + 1] as number;
    const b = P[r1][c2 + 1] as number;
    const d = P[r2 + 1][c1] as number;
    const e = P[r1][c1] as number;
    const sum = a - b - d + e;
    answers.push(sum);
    t.count("accesses", 4);
    const area: Highlight[] = [];
    for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) area.push({ id: mi(r, c), kind: "window" });
    yield t.step(
      "query",
      `Rectangle (${r1},${c1})–(${r2},${c2}): ${a} − ${b} − ${d} + ${e} = ${sum}.`,
      {
        state: state(`Query (${r1},${c1}) to (${r2},${c2})`),
        vars: { r1, c1, r2, c2, sum, answers: answers.slice() },
        highlights: [...area, ...hl("found", pi(r2 + 1, c2 + 1)), ...hl("removed", pi(r1, c2 + 1), pi(r2 + 1, c1)), ...hl("compare", pi(r1, c1))],
      },
    );
  }

  yield t.step("query", queries.length ? `Answers: [${answers.join(", ")}].` : "P is built; no queries were given.", {
    state: state("Done", answers),
    vars: { answers },
  });
}

function reference({ matrix, queries }: Input): number[] {
  return queries.map(([r1, c1, r2, c2]) => {
    let s = 0;
    for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) s += matrix[r][c];
    return s;
  });
}

const algorithm: AlgorithmModule<Input, MatrixState> = {
  ...meta,
  renderer: "matrix",
  inputSchema: {
    fields: [
      matrixField("matrix", "matrix", { maxRows: 5, maxCols: 5, min: -9, max: 9 }),
      { key: "queries", label: "queries (r1 c1 r2 c2 per line)", kind: "matrix", maxRows: 4, maxCols: 4, min: 0, max: 4 },
    ],
    validate: ({ matrix, queries }) => {
      if (matrix.length === 0 || matrix[0].length === 0) return "The matrix needs at least one cell.";
      for (const q of queries) {
        if (q.length !== 4) return "Each query needs four numbers: r1 c1 r2 c2.";
        const [r1, c1, r2, c2] = q;
        if (r1 > r2 || c1 > c2 || r2 >= matrix.length || c2 >= matrix[0].length) return `Query "${q.join(" ")}" is outside the matrix or reversed.`;
      }
      return null;
    },
  },
  presets: [
    {
      name: "LeetCode example",
      input: { matrix: [[3, 0, 1, 4, 2], [5, 6, 3, 2, 1], [1, 2, 0, 1, 5], [4, 1, 0, 1, 7], [1, 0, 3, 0, 5]], queries: [[2, 1, 4, 3], [1, 1, 2, 2], [1, 2, 2, 4]] },
    },
    { name: "Small 3×3", input: { matrix: [[1, 2, 3], [4, 5, 6], [7, 8, 9]], queries: [[0, 0, 2, 2], [1, 1, 2, 2]] } },
    { name: "Edge case: single cell", input: { matrix: [[5]], queries: [[0, 0, 0, 0]] } },
    { name: "Negative values", input: { matrix: [[2, -1, 3], [-4, 5, -2]], queries: [[0, 1, 1, 2], [0, 0, 0, 2]] } },
  ],
  randomInput: (size, rng = Math.random) => {
    const n = Math.max(1, Math.min(5, size));
    const R = randInt(rng, 1, n);
    const C = randInt(rng, 1, n);
    const queries = Array.from({ length: randInt(rng, 1, 3) }, () => {
      const a = randInt(rng, 0, R - 1);
      const b = randInt(rng, 0, R - 1);
      const c = randInt(rng, 0, C - 1);
      const d = randInt(rng, 0, C - 1);
      return [Math.min(a, b), Math.min(c, d), Math.max(a, b), Math.max(c, d)];
    });
    return { matrix: randomMatrix(rng, R, C, -5, 9), queries };
  },
  code: { python, javascript },
  generate,
  reference,
  outputOf: (s) => s.result,
  info,
  legendLabels: { compare: "Added", removed: "Subtracted", found: "Big rectangle", window: "Queried rectangle" },
};

export default algorithm;
