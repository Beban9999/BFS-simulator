import type { AlgorithmModule, Highlight } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { matrixField, mi, randomMatrix, type MatrixState } from "../../_shared/matrix";
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
  const R = m.length;
  const C = m[0].length;
  const row0 = m[0].some((v) => v === 0);
  const col0 = m.some((row) => row[0] === 0);
  const state = (caption: string, result?: number[][]): MatrixState => ({ matrix: m.map((r) => r.slice()), caption, result });
  const markers = (): Highlight[] => [
    ...hl("active", ...Array.from({ length: C }, (_, c) => mi(0, c))),
    ...hl("active", ...Array.from({ length: R }, (_, r) => mi(r, 0))),
  ];
  const vars = () => ({ R, C, row0, col0 });

  yield t.step("scan-first", `First, remember whether row 0 (${row0 ? "has" : "has no"} zero) and column 0 (${col0 ? "has" : "has no"} zero) need zeroing — they're about to become marker storage.`, {
    state: state("Row 0 and column 0 will hold the markers"),
    vars: vars(),
    highlights: markers(),
  });

  for (let r = 1; r < R; r++) {
    for (let c = 1; c < C; c++) {
      t.count("accesses");
      if (m[r][c] === 0) {
        m[r][0] = 0;
        m[0][c] = 0;
        t.count("writes", 2);
        yield t.step("mark", `matrix[${r}][${c}] is 0: mark its row (matrix[${r}][0] = 0) and column (matrix[0][${c}] = 0).`, {
          state: state("Step 1: record zeros in row 0 / column 0"),
          vars: { ...vars(), r, c },
          highlights: [...markers(), ...hl("current", mi(r, c)), ...hl("found", mi(r, 0), mi(0, c))],
        });
      }
    }
  }

  yield t.step("fill-loop", "Step 2: every inner cell whose row marker or column marker is 0 becomes 0.", {
    state: state("Step 2: fill from the markers"),
    vars: vars(),
    highlights: markers(),
  });

  for (let r = 1; r < R; r++) {
    for (let c = 1; c < C; c++) {
      if ((m[r][0] === 0 || m[0][c] === 0) && m[r][c] !== 0) {
        m[r][c] = 0;
        t.count("writes");
        const by = m[r][0] === 0 ? `row marker matrix[${r}][0]` : `column marker matrix[0][${c}]`;
        yield t.step("fill", `matrix[${r}][${c}] → 0 because of the ${by}.`, {
          state: state("Step 2: fill from the markers"),
          vars: { ...vars(), r, c },
          highlights: [...markers(), ...hl("compare", m[r][0] === 0 ? mi(r, 0) : mi(0, c)), ...hl("removed", mi(r, c))],
        });
      }
    }
  }

  if (row0) {
    for (let c = 0; c < C; c++) m[0][c] = 0;
    yield t.step("first-row", "Row 0 originally had a zero, so zero all of row 0.", {
      state: state("Step 3: first row"),
      vars: vars(),
      highlights: hl("removed", ...Array.from({ length: C }, (_, c) => mi(0, c))),
    });
  }
  if (col0) {
    for (let r = 0; r < R; r++) m[r][0] = 0;
    yield t.step("first-col", "Column 0 originally had a zero, so zero all of column 0.", {
      state: state("Step 3: first column"),
      vars: vars(),
      highlights: hl("removed", ...Array.from({ length: R }, (_, r) => mi(r, 0))),
    });
  }

  yield t.step("done", "Done — every row and column that contained a zero is now all zeros.", {
    state: state("Result", m.map((row) => row.slice())),
    vars: vars(),
    highlights: hl("removed", ...m.flatMap((row, r) => row.map((v, c) => (v === 0 ? mi(r, c) : null)).filter((x): x is string => x !== null))),
  });
}

function reference({ matrix }: Input): number[][] {
  const rows = new Set<number>();
  const cols = new Set<number>();
  matrix.forEach((row, r) => row.forEach((v, c) => v === 0 && (rows.add(r), cols.add(c))));
  return matrix.map((row, r) => row.map((v, c) => (rows.has(r) || cols.has(c) ? 0 : v)));
}

const algorithm: AlgorithmModule<Input, MatrixState> = {
  ...meta,
  renderer: "matrix",
  inputSchema: {
    fields: [matrixField("matrix", "matrix")],
    validate: ({ matrix }) => (matrix.length === 0 || matrix[0].length === 0 ? "The matrix needs at least one cell." : null),
  },
  presets: [
    { name: "LeetCode example", input: { matrix: [[1, 1, 1], [1, 0, 1], [1, 1, 1]] } },
    { name: "Zero in the first row", input: { matrix: [[0, 1, 2, 0], [3, 4, 5, 2], [1, 3, 1, 5]] } },
    { name: "Several zeros", input: { matrix: [[5, 1, 9, 3, 7], [2, 0, 4, 8, 1], [6, 3, 2, 0, 9], [1, 7, 5, 4, 2]] } },
    { name: "Edge case: no zeros", input: { matrix: [[1, 2], [3, 4]] } },
  ],
  randomInput: (size, rng = Math.random) => {
    const n = Math.max(1, Math.min(6, size));
    return { matrix: randomMatrix(rng, randInt(rng, 1, n), randInt(rng, 1, n), 0, 6).map((row) => row.map((v) => (v > 0 || rng() < 0.4 ? v : 1))) };
  },
  code: { python, javascript },
  generate,
  reference,
  outputOf: (s) => s.result,
  info,
  legendLabels: { active: "Marker row / column", found: "Marker set to 0", removed: "Zeroed", compare: "Marker that caused it" },
};

export default algorithm;
