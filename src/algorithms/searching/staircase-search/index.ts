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
  let r = 0;
  let c = C - 1;
  const path: [number, number][] = [];
  const state = (result?: boolean): MatrixState => ({ matrix, caption: `target = ${target}`, result });
  const frame = (): Highlight[] => {
    const hs: Highlight[] = [];
    for (let i = 0; i < R; i++) for (let j = 0; j < C; j++) if (i < r || j > c) hs.push({ id: mi(i, j), kind: "pruned" });
    hs.push(...hl("visited", ...path.map(([i, j]) => mi(i, j))));
    return hs;
  };

  yield t.step("init", "Start at the top-right corner: the largest value of its row and the smallest of its column.", {
    state: state(),
    vars: { r, c },
    highlights: [...frame(), ...hl("current", mi(r, c))],
  });

  while (r < R && c >= 0) {
    const value = matrix[r][c];
    t.count("comparisons");
    if (value === target) {
      yield t.step("found", `matrix[${r}][${c}] = ${target}. Found.`, { state: state(true), vars: { r, c, value }, highlights: [...frame(), ...hl("found", mi(r, c))] });
      return;
    }
    path.push([r, c]);
    if (value > target) {
      yield t.step("left", `${value} > ${target}: everything below it in column ${c} is even bigger. Drop column ${c} and move left.`, {
        state: state(),
        vars: { r, c, value },
        highlights: [...frame(), ...hl("mismatch", ...Array.from({ length: R - r }, (_, k) => mi(r + k, c)))],
      });
      c--;
    } else {
      yield t.step("down", `${value} < ${target}: everything to its left in row ${r} is even smaller. Drop row ${r} and move down.`, {
        state: state(),
        vars: { r, c, value },
        highlights: [...frame(), ...hl("mismatch", ...Array.from({ length: c + 1 }, (_, k) => mi(r, k)))],
      });
      r++;
    }
    if (r < R && c >= 0) {
      yield t.step("look", `Now at (${r}, ${c}) = ${matrix[r][c]}.`, { state: state(), vars: { r, c }, highlights: [...frame(), ...hl("current", mi(r, c))] });
    }
  }
  yield t.step("none", `Walked off the matrix: ${target} is not present. Visited ${path.length} cell${path.length === 1 ? "" : "s"} out of ${R * C}.`, {
    state: state(false),
    vars: { r, c },
    highlights: frame(),
  });
}

const sortedBothWays = (m: number[][]) =>
  m.every((row, i) => row.every((v, j) => (j === 0 || v >= row[j - 1]) && (i === 0 || v >= m[i - 1][j])));

const algorithm: AlgorithmModule<Input, MatrixState> = {
  ...meta,
  renderer: "matrix",
  inputSchema: {
    fields: [matrixField("matrix", "matrix (rows & columns sorted)", { maxRows: 6, maxCols: 6 }), { key: "target", label: "target", kind: "number", integer: true, min: -99, max: 99 }],
    validate: ({ matrix }) =>
      matrix.length === 0 || matrix[0].length === 0 ? "The matrix needs at least one cell." : sortedBothWays(matrix) ? null : "Each row must increase left to right and each column top to bottom.",
  },
  presets: [
    { name: "LeetCode example", input: { matrix: [[1, 4, 7, 11, 15], [2, 5, 8, 12, 19], [3, 6, 9, 16, 22], [10, 13, 14, 17, 24], [18, 21, 23, 26, 30]], target: 5 } },
    { name: "Absent", input: { matrix: [[1, 4, 7, 11, 15], [2, 5, 8, 12, 19], [3, 6, 9, 16, 22], [10, 13, 14, 17, 24], [18, 21, 23, 26, 30]], target: 20 } },
    { name: "Worst case: bottom-left target", input: { matrix: [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]], target: 13 } },
    { name: "Edge case: 1×1", input: { matrix: [[7]], target: 7 } },
  ],
  randomInput: (size, rng = Math.random) => {
    const R = randInt(rng, 1, Math.min(5, Math.max(1, size)));
    const C = randInt(rng, 1, 5);
    const m: number[][] = [];
    for (let i = 0; i < R; i++) {
      m.push([]);
      for (let j = 0; j < C; j++) m[i].push(Math.max(i ? m[i - 1][j] : 0, j ? m[i][j - 1] : 0) + randInt(rng, 0, 4));
    }
    return { matrix: m, target: rng() < 0.7 ? pick(rng, m.flat()) : randInt(rng, 0, 30) };
  },
  code: { python, javascript },
  generate,
  reference: ({ matrix, target }) => matrix.flat().includes(target),
  outputOf: (s) => s.result,
  info,
  legendLabels: { pruned: "Eliminated", visited: "Visited", mismatch: "Line being dropped", current: "Current cell" },
};

export default algorithm;
