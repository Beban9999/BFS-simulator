import type { AlgorithmModule, Frame, Highlight, Step } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { ai } from "../../_shared/array";
import { DecisionTree, type DecisionState } from "../../_shared/decision";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  n: number;
  k: number;
}

const fmt = (xs: number[]) => `[${xs.join(", ")}]`;

function* generate({ n, k }: Input) {
  const t = new Tracer<DecisionState>();
  const dt = new DecisionTree("[]", "[]");
  const res: number[][] = [];
  const path: number[] = [];
  const frames: Frame[] = [];
  const numbers = Array.from({ length: n }, (_, i) => i + 1);

  const state = (x: number | null, done = false): DecisionState => ({
    tree: dt.view(),
    array: {
      rows: [
        { label: "1…n", values: numbers },
        { label: "path", values: path.length ? path : ["–"], hideIndex: true },
      ],
      pointers: x === null || x > n ? [] : [{ name: "x", index: x - 1 }],
    },
    caption: `choose k = ${k} of 1…${n}`,
    result: done ? res : undefined,
  });
  const aux = (hi?: number) => [{ label: `combinations (${res.length})`, kind: "list" as const, items: res.map(fmt), highlight: hi === undefined ? [] : [hi] }];
  const marks = (): Highlight[] => [...dt.marks(), ...hl("active", ...path.map((x) => ai(x - 1)))];

  function* backtrack(start: number): Generator<Step<DecisionState>, void> {
    frames.push({ call: `backtrack(start=${start})`, locals: { path: fmt(path) } });
    t.count("calls");
    if (path.length === k) {
      res.push(path.slice());
      dt.found();
      yield t.step("record", `path has k = ${k} numbers: record ${fmt(path)} (#${res.length}) and return.`, {
        state: state(null),
        vars: { start, path: fmt(path) },
        callStack: frames,
        aux: aux(res.length - 1),
        highlights: marks(),
      });
      frames.pop();
      return;
    }
    const need = k - path.length;
    for (let x = start; x <= n; x++) {
      t.count("comparisons");
      if (n - x + 1 < need) {
        dt.prune(String(x), `${fmt([...path, x])}: too few numbers left`);
        yield t.step("prune", `From ${x} only ${n - x + 1} number${n - x + 1 === 1 ? "" : "s"} remain (${x}…${n}) but ${need} are still needed. This and every later x can't finish: break.`, {
          state: state(x),
          vars: { start, x, need, left: n - x + 1 },
          callStack: frames,
          aux: aux(),
          highlights: [...marks(), ...hl("mismatch", ...Array.from({ length: n - x + 1 }, (_, j) => ai(x - 1 + j)))],
        });
        break;
      }
      path.push(x);
      dt.enter(dt.child(String(x), fmt(path)));
      yield t.step("choose", `Choose ${x} → ${fmt(path)}; ${k - path.length} more to pick, from ${x + 1} on.`, {
        state: state(x),
        vars: { start, x, need, path: fmt(path) },
        callStack: frames,
        aux: aux(),
        highlights: marks(),
      });
      yield* backtrack(x + 1);
      path.pop();
      dt.finish("done");
      yield t.step("unchoose", `Back: drop ${x} → ${fmt(path)}.`, { state: state(x), vars: { start, x, path: fmt(path) }, callStack: frames, aux: aux(), highlights: marks() });
    }
    frames.pop();
  }

  yield* backtrack(1);
  yield t.step("done", `Done: C(${n}, ${k}) = ${res.length} combination${res.length === 1 ? "" : "s"}.`, { state: state(null, true), vars: { count: res.length }, callStack: [], aux: aux(), highlights: dt.marks() });
}

function reference({ n, k }: Input): number[][] {
  const out: number[][] = [];
  for (let m = 0; m < 1 << n; m++) {
    const c = Array.from({ length: n }, (_, i) => i + 1).filter((_, i) => (m >> i) & 1);
    if (c.length === k) out.push(c);
  }
  return out.sort((a, b) => {
    for (let i = 0; i < k; i++) if (a[i] !== b[i]) return a[i] - b[i];
    return 0;
  });
}

const algorithm: AlgorithmModule<Input, DecisionState> = {
  ...meta,
  renderer: "decisiontree",
  inputSchema: {
    fields: [
      { key: "n", label: "n", kind: "number", integer: true, min: 1, max: 7 },
      { key: "k", label: "k", kind: "number", integer: true, min: 0, max: 7 },
    ],
    validate: ({ n, k }) => (k > n ? "k must be at most n." : null),
  },
  presets: [
    { name: "LeetCode example: n = 4, k = 2", input: { n: 4, k: 2 } },
    { name: "Pruning shows: n = 5, k = 4", input: { n: 5, k: 4 } },
    { name: "Edge case: k = n (one combination)", input: { n: 3, k: 3 } },
    { name: "Largest: n = 6, k = 3 (20)", input: { n: 6, k: 3 } },
  ],
  randomInput: (size, rng = Math.random) => {
    const n = randInt(rng, 1, Math.max(1, Math.min(6, size)));
    return { n, k: randInt(rng, 0, n) };
  },
  code: { python, javascript },
  generate,
  reference,
  outputOf: (state) => state.result,
  info,
  legendLabels: { found: "Complete combination", visited: "Finished branch", active: "Current path", current: "Current call", pruned: "Cut: too few left", mismatch: "Numbers left" },
};

export default algorithm;
