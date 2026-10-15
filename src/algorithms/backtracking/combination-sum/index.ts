import type { AlgorithmModule, Frame, Highlight, Step } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { ai, numbersField, randomNumbers } from "../../_shared/array";
import { DecisionTree, type DecisionState } from "../../_shared/decision";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  candidates: number[];
  target: number;
  mode: "reuse" | "once";
}

const fmt = (xs: number[]) => `[${xs.join(", ")}]`;

function* generate({ candidates: input, target, mode }: Input) {
  const t = new Tracer<DecisionState>();
  const reuse = mode === "reuse";
  const cands = input.slice().sort((a, b) => a - b);
  const dt = new DecisionTree(String(target), `remain ${target}`);
  const res: number[][] = [];
  const path: number[] = [];
  const pathIdx: number[] = [];
  const frames: Frame[] = [];

  const state = (i: number | null, start: number | null, remain: number, done = false): DecisionState => ({
    tree: dt.view(),
    array: {
      rows: [
        { label: "cands", values: cands.length ? cands : ["–"] },
        { label: "path", values: path.length ? path : ["–"], hideIndex: true },
      ],
      pointers: i === null || i >= cands.length ? [] : [{ name: "i", index: i }],
      ranges: start === null || start >= cands.length ? [] : [{ from: start, to: cands.length - 1, kind: "window", label: "start…" }],
    },
    caption: `target ${target} · remain ${remain} · ${reuse ? "numbers may repeat (I)" : "each element once (II)"} · node labels = remaining`,
    result: done ? res : undefined,
  });
  const aux = (hi?: number) => [{ label: `combinations (${res.length})`, kind: "list" as const, items: res.map(fmt), highlight: hi === undefined ? [] : [hi] }];
  const marks = (): Highlight[] => [...dt.marks(), ...hl("active", ...pathIdx.map((k) => ai(k)))];

  yield t.step("sort", `Sort the candidates → ${fmt(cands)} so a too-big candidate ends the loop. Node labels show the remaining amount.`, {
    state: state(null, null, target),
    vars: { target },
    aux: aux(),
    highlights: dt.marks(),
  });

  function* backtrack(start: number, remain: number): Generator<Step<DecisionState>, void> {
    frames.push({ call: `backtrack(${start}, remain=${remain})`, locals: { path: fmt(path) } });
    t.count("calls");
    if (remain === 0) {
      res.push(path.slice());
      dt.found();
      yield t.step("record", `remain = 0: ${fmt(path)} adds up to ${target}. Record it (#${res.length}).`, {
        state: state(null, start, remain),
        vars: { start, remain, path: fmt(path) },
        callStack: frames,
        aux: aux(res.length - 1),
        highlights: marks(),
      });
      frames.pop();
      return;
    }
    for (let i = start; i < cands.length; i++) {
      const c = cands[i];
      t.count("comparisons");
      if (c > remain) {
        dt.prune(String(remain - c), `${fmt([...path, c])} overshoots`);
        yield t.step("too-big", `${c} > remain ${remain}: too big, and every later candidate is at least as big. Break.`, {
          state: state(i, start, remain),
          vars: { start, i, c, remain },
          callStack: frames,
          aux: aux(),
          highlights: [...marks(), ...hl("mismatch", ...cands.slice(i).map((_, j) => ai(i + j)))],
        });
        break;
      }
      if (!reuse && i > start && c === cands[i - 1]) {
        dt.prune(String(remain - c), `${fmt([...path, c])} again`);
        yield t.step("skip-dup", `cands[${i}] = ${c} equals its left sibling: it would repeat the same combinations. Skip.`, {
          state: state(i, start, remain),
          vars: { start, i, c, remain },
          callStack: frames,
          aux: aux(),
          highlights: [...marks(), ...hl("mismatch", ai(i), ai(i - 1))],
        });
        continue;
      }
      path.push(c);
      pathIdx.push(i);
      dt.enter(dt.child(String(remain - c), `${fmt(path)}, remain ${remain - c}`));
      yield t.step("choose", `Choose ${c} → ${fmt(path)}, remain ${remain} − ${c} = ${remain - c}. Next start: ${reuse ? `${i} (${c} may be used again)` : i + 1}.`, {
        state: state(i, start, remain - c),
        vars: { start, i, c, remain: remain - c },
        callStack: frames,
        aux: aux(),
        highlights: marks(),
      });
      yield* backtrack(reuse ? i : i + 1, remain - c);
      path.pop();
      pathIdx.pop();
      dt.finish("done");
      yield t.step("unchoose", `Back: remove ${c} → ${fmt(path)}, remain ${remain}.`, { state: state(i, start, remain), vars: { start, i, remain }, callStack: frames, aux: aux(), highlights: marks() });
    }
    frames.pop();
  }

  yield* backtrack(0, target);
  yield t.step("done", res.length ? `Done: ${res.length} combination${res.length === 1 ? "" : "s"} sum to ${target}.` : `Done: no combination sums to ${target}.`, {
    state: state(null, null, target, true),
    vars: { count: res.length },
    callStack: [],
    aux: aux(),
    highlights: dt.marks(),
  });
}

function reference({ candidates, target, mode }: Input): number[][] {
  // Enumerate multiplicity vectors over the distinct values, then sort lexicographically.
  const vals = [...new Set(candidates)].sort((a, b) => a - b);
  const avail = vals.map((v) => (mode === "reuse" ? Math.floor(target / v) : candidates.filter((c) => c === v).length));
  const out: number[][] = [];
  const go = (k: number, remain: number, acc: number[]) => {
    if (remain === 0) return void out.push(acc);
    if (k === vals.length) return;
    for (let m = 0; m <= avail[k] && m * vals[k] <= remain; m++) go(k + 1, remain - m * vals[k], [...acc, ...Array(m).fill(vals[k])]);
  };
  go(0, target, []);
  return out.sort((a, b) => {
    for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) return a[i] - b[i];
    return a.length - b.length;
  });
}

const algorithm: AlgorithmModule<Input, DecisionState> = {
  ...meta,
  renderer: "decisiontree",
  inputSchema: {
    fields: [
      numbersField("candidates", "candidates", { minLength: 1, maxLength: 7, min: 1, max: 20 }),
      { key: "target", label: "target", kind: "number", integer: true, min: 1, max: 15 },
      {
        key: "mode",
        label: "Version",
        kind: "select",
        options: [
          { value: "reuse", label: "I: reuse numbers" },
          { value: "once", label: "II: each element once" },
        ],
      },
    ],
    validate: ({ candidates, mode }) => (mode === "reuse" && new Set(candidates).size < candidates.length ? "Combination Sum I expects distinct candidates." : null),
  },
  presets: [
    { name: "LeetCode 39: [2, 3, 6, 7], target 7", input: { candidates: [2, 3, 6, 7], target: 7, mode: "reuse" } },
    { name: "LeetCode 40: [10, 1, 2, 7, 6, 1, 5], target 8", input: { candidates: [10, 1, 2, 7, 6, 1, 5], target: 8, mode: "once" } },
    { name: "Reuse: [2, 3, 5], target 8", input: { candidates: [2, 3, 5], target: 8, mode: "reuse" } },
    { name: "Edge case: impossible ([4, 6], target 5)", input: { candidates: [4, 6], target: 5, mode: "reuse" } },
  ],
  randomInput: (size, rng = Math.random) => {
    const reuse = rng() < 0.5;
    const raw = randomNumbers(rng, Math.min(size, reuse ? 4 : 6), 2, 7, 6);
    return { candidates: reuse ? [...new Set(raw)] : raw, target: randInt(rng, 3, reuse ? 10 : 12), mode: reuse ? "reuse" : "once" };
  },
  code: { python, javascript },
  generate,
  reference,
  outputOf: (state) => state.result,
  info,
  legendLabels: { found: "Sum reached", visited: "Finished branch", active: "Current path", current: "Current call", pruned: "Cut (too big / duplicate)", window: "Candidates (start…)", mismatch: "Cut" },
};

export default algorithm;
