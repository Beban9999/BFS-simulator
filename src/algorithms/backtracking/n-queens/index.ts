import type { AlgorithmModule, Frame, Highlight, Step } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { mi } from "../../_shared/matrix";
import { DecisionTree, type DecisionState } from "../../_shared/decision";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  n: number;
}

function* generate({ n }: Input) {
  const t = new Tracer<DecisionState>();
  const dt = new DecisionTree("∅", "empty board", 90);
  const queens: number[] = []; // queens[r] = column
  const res: string[][] = [];
  const frames: Frame[] = [];
  const boardRows = () => Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => (queens[r] === c ? "Q" : ".")).join(""));

  const state = (done = false): DecisionState => ({
    tree: dt.view(),
    matrix: {
      matrix: Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => (queens[r] === c ? "Q" : null))),
      caption: `${n}×${n} board · tree node = column of the row's queen`,
    },
    result: done ? res : undefined,
  });
  const aux = (hi?: number) => [
    { label: "cols", kind: "set" as const, items: queens.slice() },
    { label: "diag r−c", kind: "set" as const, items: queens.map((c, r) => r - c) },
    { label: "anti r+c", kind: "set" as const, items: queens.map((c, r) => r + c) },
    { label: `solutions (${res.length})`, kind: "list" as const, items: res.map((b) => b.map((row) => row.indexOf("Q")).join(" ")), highlight: hi === undefined ? [] : [hi] },
  ];
  const marks = (): Highlight[] => [...dt.marks(), ...hl("active", ...queens.map((c, r) => mi(r, c)))];

  function* place(r: number): Generator<Step<DecisionState>, void> {
    frames.push({ call: `place(${r})` });
    t.count("calls");
    if (r === n) {
      res.push(boardRows());
      dt.found();
      yield t.step("record", `All ${n} rows have a queen and none attack each other: solution #${res.length} (columns ${queens.join(", ")}).`, {
        state: state(),
        vars: { r },
        callStack: frames,
        aux: aux(res.length - 1),
        highlights: [...marks(), ...hl("found", ...queens.map((c, rr) => mi(rr, c)))],
      });
      frames.pop();
      return;
    }
    for (let c = 0; c < n; c++) {
      t.count("comparisons");
      const byCol = queens.findIndex((qc) => qc === c);
      const byDiag = queens.findIndex((qc, qr) => qr - qc === r - c);
      const byAnti = queens.findIndex((qc, qr) => qr + qc === r + c);
      const hit = byCol >= 0 ? byCol : byDiag >= 0 ? byDiag : byAnti;
      if (hit >= 0) {
        const why = byCol >= 0 ? `column ${c} is taken` : byDiag >= 0 ? `diagonal r−c = ${r - c} is taken` : `anti-diagonal r+c = ${r + c} is taken`;
        dt.prune(String(c), `(${r}, ${c}) attacked`);
        yield t.step("attacked", `(${r}, ${c}): ${why} by the queen at (${hit}, ${queens[hit]}). Skip.`, {
          state: state(),
          vars: { r, c, "r-c": r - c, "r+c": r + c },
          callStack: frames,
          aux: aux(),
          highlights: [...marks(), ...hl("mismatch", mi(r, c)), ...hl("compare", mi(hit, queens[hit]))],
        });
        continue;
      }
      queens.push(c);
      dt.enter(dt.child(String(c), `queen at (${r}, ${c})`));
      t.count("writes");
      yield t.step("place", `(${r}, ${c}) is safe: place a queen, add column ${c}, r−c = ${r - c}, r+c = ${r + c} to the sets, and go to row ${r + 1}.`, {
        state: state(),
        vars: { r, c, "r-c": r - c, "r+c": r + c },
        callStack: frames,
        aux: aux(),
        highlights: [...marks(), ...hl("current", mi(r, c))],
      });
      yield* place(r + 1);
      queens.pop();
      dt.finish("done");
      yield t.step("remove", `Back in row ${r}: remove the queen from (${r}, ${c}) and free its column and diagonals; try the next column.`, {
        state: state(),
        vars: { r, c },
        callStack: frames,
        aux: aux(),
        highlights: [...marks(), ...hl("removed", mi(r, c))],
      });
    }
    frames.pop();
  }

  yield* place(0);
  yield t.step("done", `Search finished: ${res.length} solution${res.length === 1 ? "" : "s"} for n = ${n}.`, { state: state(true), vars: { solutions: res.length }, callStack: [], aux: aux(), highlights: dt.marks() });
}

function reference({ n }: Input): string[][] {
  // Try every column assignment (n^n), keep the non-attacking ones, in lexicographic order.
  const out: string[][] = [];
  const total = n ** n;
  for (let code = 0; code < total; code++) {
    const q: number[] = [];
    for (let r = 0, x = code; r < n; r++, x = Math.floor(x / n)) q.unshift(x % n);
    let ok = true;
    for (let a = 0; a < n && ok; a++) for (let b = a + 1; b < n && ok; b++) if (q[a] === q[b] || Math.abs(q[a] - q[b]) === b - a) ok = false;
    if (ok) out.push(q.map((c) => ".".repeat(c) + "Q" + ".".repeat(n - c - 1)));
  }
  return out;
}

const algorithm: AlgorithmModule<Input, DecisionState> = {
  ...meta,
  renderer: "decisiontree",
  inputSchema: { fields: [{ key: "n", label: "n", kind: "number", integer: true, min: 1, max: 6 }] },
  presets: [
    { name: "LeetCode example: n = 4 (2 solutions)", input: { n: 4 } },
    { name: "n = 5 (10 solutions)", input: { n: 5 } },
    { name: "Edge case: n = 3 (no solution)", input: { n: 3 } },
    { name: "Edge case: n = 1", input: { n: 1 } },
    { name: "Largest: n = 6 (4 solutions, many dead ends)", input: { n: 6 } },
  ],
  randomInput: (size, rng = Math.random) => ({ n: randInt(rng, 1, Math.max(1, Math.min(6, size))) }),
  code: { python, javascript },
  generate,
  reference,
  outputOf: (state) => state.result,
  info,
  legendLabels: { active: "Queen / current path", current: "Just placed", mismatch: "Attacked square", compare: "Attacking queen", removed: "Removed queen", found: "Solution", visited: "Dead end / finished", pruned: "Attacked (skipped)" },
};

export default algorithm;
