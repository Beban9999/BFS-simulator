import type { AlgorithmModule, Frame, GridField, Highlight, Step } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt, shuffle } from "../../../engine/random";
import { mi } from "../../_shared/matrix";
import { DecisionTree, type DecisionState } from "../../_shared/decision";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  grid: string[];
}

const boxOf = (n: number) => (n === 4 ? 2 : 3);

/** First cell that already holds digit d in the row, column or box of (r, c), or null. */
function clash(b: string[][], r: number, c: number, d: string): [number, number] | null {
  const n = b.length;
  const box = boxOf(n);
  const br = r - (r % box);
  const bc = c - (c % box);
  for (let k = 0; k < n; k++) {
    if (b[r][k] === d) return [r, k];
    if (b[k][c] === d) return [k, c];
    const rr = br + Math.floor(k / box);
    const cc = bc + (k % box);
    if (b[rr][cc] === d) return [rr, cc];
  }
  return null;
}

function* generate({ grid }: Input) {
  const t = new Tracer<DecisionState>();
  const n = grid.length;
  const b = grid.map((row) => row.split(""));
  const given = grid.map((row) => Array.from(row, (ch) => ch !== "."));
  const digits = Array.from({ length: n }, (_, i) => String(i + 1));
  const dt = new DecisionTree("∅", "start", 80);
  const frames: Frame[] = [];
  let solved = false;

  const state = (done = false): DecisionState => ({
    tree: dt.view(),
    matrix: { matrix: b.map((row) => row.map((ch) => (ch === "." ? null : ch))), caption: `${n}×${n} sudoku (${boxOf(n)}×${boxOf(n)} boxes) · tree level = next empty cell` },
    result: done ? (solved ? b.map((row) => row.join("")) : null) : undefined,
  });
  const marks = (): Highlight[] => [...dt.marks(), ...hl("active", ...b.flatMap((row, r) => row.flatMap((ch, c) => (ch !== "." && !given[r][c] ? [mi(r, c)] : []))))];
  const blanks = () => b.flat().filter((ch) => ch === ".").length;

  function* solve(): Generator<Step<DecisionState>, boolean> {
    for (let r = 0; r < n; r++)
      for (let c = 0; c < n; c++) {
        if (b[r][c] !== ".") continue;
        frames.push({ call: `solve() @ (${r}, ${c})` });
        t.count("calls");
        yield t.step("find", `First empty cell is (${r}, ${c}). Try the digits 1…${n} there (${blanks()} empty cells left).`, {
          state: state(),
          vars: { r, c, empty: blanks() },
          callStack: frames,
          highlights: [...marks(), ...hl("current", mi(r, c))],
        });
        for (const d of digits) {
          t.count("comparisons");
          const hit = clash(b, r, c, d);
          if (hit) {
            const where = hit[0] === r ? "row" : hit[1] === c ? "column" : "box";
            dt.prune(d, `${d} at (${r}, ${c}) clashes`);
            yield t.step("check", `${d} at (${r}, ${c})? No: ${where} already has ${d} at (${hit[0]}, ${hit[1]}).`, {
              state: state(),
              vars: { r, c, d },
              callStack: frames,
              highlights: [...marks(), ...hl("mismatch", mi(r, c)), ...hl("compare", mi(hit[0], hit[1]))],
            });
            continue;
          }
          b[r][c] = d;
          dt.enter(dt.child(d, `(${r}, ${c}) = ${d}`));
          t.count("writes");
          yield t.step("place", `${d} fits at (${r}, ${c}): place it and solve the rest.`, {
            state: state(),
            vars: { r, c, d },
            callStack: frames,
            highlights: [...marks(), ...hl("current", mi(r, c))],
          });
          if (yield* solve()) {
            frames.pop();
            return true;
          }
          b[r][c] = ".";
          dt.finish("done");
          yield t.step("undo", `The rest could not be completed with ${d} at (${r}, ${c}). Erase it and try the next digit.`, {
            state: state(),
            vars: { r, c, d },
            callStack: frames,
            highlights: [...marks(), ...hl("removed", mi(r, c))],
          });
        }
        frames.pop();
        dt.finish("pruned");
        yield t.step("dead", `No digit fits (${r}, ${c}): an earlier choice was wrong. Return False and backtrack.`, {
          state: state(),
          vars: { r, c },
          callStack: frames,
          highlights: [...marks(), ...hl("mismatch", mi(r, c))],
        });
        return false;
      }
    dt.found();
    solved = true;
    yield t.step("solved", "No empty cell is left: the board is solved. True propagates up and every call returns at once.", {
      state: state(),
      vars: { empty: 0 },
      callStack: frames,
      highlights: [...marks(), ...hl("found", ...b.flatMap((row, r) => row.flatMap((_, c) => (given[r][c] ? [] : [mi(r, c)]))))],
    });
    return true;
  }

  const ok = yield* solve();
  yield t.step(ok ? "solved" : "dead", ok ? `Solved: ${n * n - given.flat().filter(Boolean).length} cells filled.` : "Every option failed: this puzzle has no solution.", {
    state: state(true),
    vars: { solved: ok },
    callStack: [],
    highlights: ok ? [...dt.marks(), ...hl("found", ...b.flatMap((row, r) => row.flatMap((_, c) => (given[r][c] ? [] : [mi(r, c)]))))] : dt.marks(),
  });
}

function reference({ grid }: Input): string[] | null {
  // Plain recursive solver over the same cell/digit order, without any tracing.
  const b = grid.map((row) => row.split(""));
  const n = b.length;
  const go = (): boolean => {
    const at = b.flat().indexOf(".");
    if (at < 0) return true;
    const r = Math.floor(at / n);
    const c = at % n;
    for (let d = 1; d <= n; d++) {
      if (clash(b, r, c, String(d))) continue;
      b[r][c] = String(d);
      if (go()) return true;
      b[r][c] = ".";
    }
    return false;
  };
  return go() ? b.map((row) => row.join("")) : null;
}

const FIELD: GridField = {
  key: "grid",
  label: "Board",
  kind: "grid",
  maxRows: 9,
  maxCols: 9,
  alphabet: "123456789.",
  help: "4 or 9 rows of digits, '.' for an empty cell. 9×9 boards may have at most 30 empty cells here.",
};

function validate({ grid }: Input): string | null {
  const n = grid.length;
  if ((n !== 4 && n !== 9) || grid[0].length !== n) return "The board must be 4×4 or 9×9.";
  const b = grid.map((row) => row.split(""));
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++) {
      const d = b[r][c];
      if (d === ".") continue;
      if (Number(d) > n) return `Digits on a ${n}×${n} board must be 1–${n}.`;
      b[r][c] = ".";
      const hit = clash(b, r, c, d);
      b[r][c] = d;
      if (hit) return `The givens clash: ${d} appears twice (cells (${r}, ${c}) and (${hit[0]}, ${hit[1]})).`;
    }
  if (n === 9 && grid.join("").split(".").length - 1 > 30) return "Use at most 30 empty cells on a 9×9 board (the replay would get too long).";
  return null;
}

/** A solved board made by shifting a base row (a valid Latin-square-with-boxes pattern), then shuffled digits. */
function solvedBoard(n: number, rng: () => number): string[][] {
  const box = boxOf(n);
  const perm = shuffle(rng, Array.from({ length: n }, (_, i) => i + 1));
  return Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => String(perm[((r % box) * box + Math.floor(r / box) + c) % n])));
}

const algorithm: AlgorithmModule<Input, DecisionState> = {
  ...meta,
  renderer: "decisiontree",
  inputSchema: { fields: [FIELD], validate },
  presets: [
    { name: "4×4 with a dead end", input: { grid: ["1...", "..2.", ".3..", "...4"] } },
    { name: "4×4, half empty", input: { grid: ["12..", "..12", "2...", "...3"] } },
    { name: "9×9 (LeetCode board, 6 cells blanked)", input: { grid: ["534678912", "672195348", "198342567", "8.97.1423", "42.853791", "713924856", "961537284", "287419635", "3452.6.79"] } },
    { name: "Edge case: unsolvable 4×4", input: { grid: ["12..", "34..", "....", "..21"] } },
    { name: "Edge case: already solved", input: { grid: ["1234", "3412", "2143", "4321"] } },
  ],
  randomInput: (size, rng = Math.random) => {
    const n = rng() < 0.75 ? 4 : 9;
    const b = solvedBoard(n, rng);
    const holes = n === 4 ? randInt(rng, 2, 4 + Math.min(size, 8)) : randInt(rng, 3, 10);
    for (let k = 0; k < holes; k++) b[randInt(rng, 0, n - 1)][randInt(rng, 0, n - 1)] = ".";
    return { grid: b.map((row) => row.join("")) };
  },
  code: { python, javascript },
  generate,
  reference,
  outputOf: (state) => state.result,
  info,
  legendLabels: { current: "Cell being filled", active: "Placed digit / path", mismatch: "Clash / dead cell", compare: "Clashing digit", removed: "Erased", found: "Solved", pruned: "Clashing digit / dead end", visited: "Failed branch" },
};

export default algorithm;
