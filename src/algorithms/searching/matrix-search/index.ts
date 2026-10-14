import type { AlgorithmModule, Highlight } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { pick, randInt } from "../../../engine/random";
import { matrixField, mi, type MatrixState } from "../../_shared/matrix";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  matrix: number[][];
  target: number;
}

function* generate({ matrix, target }: Input) {
  const t = new Tracer<MatrixState>();
  const R = matrix.length;
  const C = matrix[0].length;
  let lo = 0;
  let hi = R * C - 1;
  const cell = (k: number) => mi(Math.floor(k / C), k % C);
  const state = (result?: boolean): MatrixState => ({
    matrix,
    caption: `target = ${target} · virtual range [${lo}, ${hi}] of 0..${R * C - 1}`,
    result,
  });
  const frame = (): Highlight[] => {
    const hs: Highlight[] = [];
    for (let k = 0; k < R * C; k++) hs.push({ id: cell(k), kind: k < lo || k > hi ? "pruned" : "active" });
    return hs;
  };

  yield t.step("init", `Treat the ${R}×${C} matrix as one sorted list of ${R * C} values (row by row).`, { state: state(), vars: { lo, hi, C }, highlights: frame() });

  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const r = Math.floor(mid / C);
    const c = mid % C;
    t.count("comparisons");
    yield t.step("map", `mid = ${mid} → row ${mid} // ${C} = ${r}, col ${mid} % ${C} = ${c}. matrix[${r}][${c}] = ${matrix[r][c]}.`, {
      state: state(),
      vars: { lo, hi, mid, r, c, value: matrix[r][c] },
      highlights: [...frame(), ...hl("compare", mi(r, c))],
    });
    if (matrix[r][c] === target) {
      yield t.step("found", `Found ${target} at (${r}, ${c}).`, { state: state(true), vars: { r, c }, highlights: [...frame(), ...hl("found", mi(r, c))] });
      return;
    }
    if (matrix[r][c] < target) {
      lo = mid + 1;
      yield t.step("go-right", `${matrix[r][c]} < ${target}: lo = ${lo}.`, { state: state(), vars: { lo, hi }, highlights: frame() });
    } else {
      hi = mid - 1;
      yield t.step("go-left", `${matrix[r][c]} > ${target}: hi = ${hi}.`, { state: state(), vars: { lo, hi }, highlights: frame() });
    }
  }
  yield t.step("none", `Empty range: ${target} is not in the matrix.`, { state: state(false), vars: { lo, hi }, highlights: frame() });
}

function isRowMajorSorted(m: number[][]): boolean {
  const flat = m.flat();
  return flat.every((v, i) => i === 0 || v >= flat[i - 1]);
}

const algorithm: AlgorithmModule<Input, MatrixState> = {
  ...meta,
  renderer: "matrix",
  inputSchema: {
    fields: [matrixField("matrix", "matrix (sorted row by row)", { maxRows: 6, maxCols: 6 }), { key: "target", label: "target", kind: "number", integer: true, min: -99, max: 99 }],
    validate: ({ matrix }) =>
      matrix.length === 0 || matrix[0].length === 0 ? "The matrix needs at least one cell." : isRowMajorSorted(matrix) ? null : "Values must increase row by row (each row starts after the previous one ends).",
  },
  presets: [
    { name: "LeetCode example", input: { matrix: [[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], target: 3 } },
    { name: "Absent", input: { matrix: [[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], target: 13 } },
    { name: "Edge case: single row", input: { matrix: [[2, 4, 6, 8, 10, 12]], target: 10 } },
    { name: "Edge case: single column", input: { matrix: [[1], [4], [9], [16]], target: 16 } },
  ],
  randomInput: (size, rng = Math.random) => {
    const R = randInt(rng, 1, Math.min(5, Math.max(1, size)));
    const C = randInt(rng, 1, 5);
    let v = randInt(rng, -5, 5);
    const matrix = Array.from({ length: R }, () => Array.from({ length: C }, () => (v += randInt(rng, 1, 4))));
    return { matrix, target: rng() < 0.7 ? pick(rng, matrix.flat()) : v + 1 };
  },
  code: { python, javascript },
  generate,
  reference: ({ matrix, target }) => matrix.flat().includes(target),
  outputOf: (s) => s.result,
  info,
  legendLabels: { active: "Still possible", pruned: "Ruled out", compare: "Middle cell" },
};

export default algorithm;
