import type { AlgorithmModule, Highlight } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { countingMatrix, matrixField, mi, randomMatrix, type MatrixState } from "../../_shared/matrix";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  matrix: number[][];
}

function* generate({ matrix }: Input) {
  const t = new Tracer<MatrixState>();
  const out: number[] = [];
  const read: [number, number][] = [];
  let top = 0;
  let bottom = matrix.length - 1;
  let left = 0;
  let right = matrix[0].length - 1;

  const state = (result?: number[]): MatrixState => ({
    matrix,
    caption: `top = ${top}, bottom = ${bottom}, left = ${left}, right = ${right}`,
    arrays: { rows: [{ label: "out", values: out.length ? out.slice() : [null] }] },
    result,
  });
  const frame = (cur?: [number, number]): Highlight[] => {
    const hs: Highlight[] = [];
    for (let r = top; r <= bottom; r++) for (let c = left; c <= right; c++) hs.push({ id: mi(r, c), kind: "active" });
    hs.push(...hl("visited", ...read.map(([r, c]) => mi(r, c))));
    if (cur) hs.push({ id: mi(cur[0], cur[1]), kind: "current" });
    return hs;
  };
  const vars = () => ({ top, bottom, left, right, "len(out)": out.length });
  function* take(r: number, c: number, line: string, dir: string) {
    out.push(matrix[r][c]);
    read.push([r, c]);
    t.count("accesses");
    yield t.step(line, `Going ${dir}: read matrix[${r}][${c}] = ${matrix[r][c]}.`, { state: state(), vars: vars(), highlights: frame([r, c]) });
  }

  yield t.step("init", "The unread area starts as the whole matrix.", { state: state(), vars: vars(), highlights: frame() });

  while (top <= bottom && left <= right) {
    yield t.step("loop", `Unread rectangle: rows ${top}..${bottom}, columns ${left}..${right}. Read its outer ring.`, {
      state: state(),
      vars: vars(),
      highlights: frame(),
    });
    for (let c = left; c <= right; c++) yield* take(top, c, "right", "right along the top row");
    top++;
    for (let r = top; r <= bottom; r++) yield* take(r, right, "down", "down the right column");
    right--;
    if (top <= bottom) {
      for (let c = right; c >= left; c--) yield* take(bottom, c, "left", "left along the bottom row");
      bottom--;
    } else {
      yield t.step("check-row", "top > bottom: no rows left, so skip the bottom row (it was already read).", { state: state(), vars: vars(), highlights: frame() });
    }
    if (left <= right) {
      for (let r = bottom; r >= top; r--) yield* take(r, left, "up", "up the left column");
      left++;
    } else {
      yield t.step("check-col", "left > right: no columns left, so skip the left column (it was already read).", { state: state(), vars: vars(), highlights: frame() });
    }
  }

  yield t.step("done", `Boundaries crossed — all ${out.length} cells read: [${out.join(", ")}].`, { state: state(out.slice()), vars: vars(), highlights: frame() });
}

function reference({ matrix }: Input): number[] {
  const R = matrix.length;
  const C = matrix[0].length;
  const seen = matrix.map((row) => row.map(() => false));
  const dr = [0, 1, 0, -1];
  const dc = [1, 0, -1, 0];
  const out: number[] = [];
  let r = 0;
  let c = 0;
  let d = 0;
  for (let k = 0; k < R * C; k++) {
    out.push(matrix[r][c]);
    seen[r][c] = true;
    const nr = r + dr[d];
    const nc = c + dc[d];
    if (nr < 0 || nc < 0 || nr >= R || nc >= C || seen[nr][nc]) d = (d + 1) % 4;
    r += dr[d];
    c += dc[d];
  }
  return out;
}

const algorithm: AlgorithmModule<Input, MatrixState> = {
  ...meta,
  renderer: "matrix",
  inputSchema: {
    fields: [matrixField("matrix", "matrix")],
    validate: ({ matrix }) => (matrix.length === 0 || matrix[0].length === 0 ? "The matrix needs at least one cell." : null),
  },
  presets: [
    { name: "LeetCode example 3×3", input: { matrix: countingMatrix(3) } },
    { name: "Rectangle 3×4", input: { matrix: countingMatrix(3, 4) } },
    { name: "Edge case: single column", input: { matrix: [[1], [2], [3], [4]] } },
    { name: "Edge case: single row", input: { matrix: [[1, 2, 3, 4, 5]] } },
    { name: "Larger 5×5", input: { matrix: countingMatrix(5) } },
  ],
  randomInput: (size, rng = Math.random) =>
    ({ matrix: randomMatrix(rng, randInt(rng, 1, Math.min(6, Math.max(1, size))), randInt(rng, 1, Math.min(6, Math.max(1, size))), 1, 9) }),
  code: { python, javascript },
  generate,
  reference,
  outputOf: (s) => s.result,
  info,
  legendLabels: { active: "Unread rectangle", visited: "Already read" },
};

export default algorithm;
