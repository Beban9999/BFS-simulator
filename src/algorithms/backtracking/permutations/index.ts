import type { AlgorithmModule, Frame, Highlight, Step } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { ai, numbersField, randomNumbers } from "../../_shared/array";
import { DecisionTree, type DecisionState } from "../../_shared/decision";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  nums: number[];
}

const fmt = (xs: number[]) => `[${xs.join(", ")}]`;

function* generate({ nums: input }: Input) {
  const t = new Tracer<DecisionState>();
  const nums = input.slice().sort((a, b) => a - b);
  const n = nums.length;
  const dt = new DecisionTree("[]", "[]");
  const res: number[][] = [];
  const path: number[] = [];
  const used: boolean[] = Array(n).fill(false);
  const frames: Frame[] = [];

  const state = (i: number | null, done = false): DecisionState => ({
    tree: dt.view(),
    array: {
      rows: [
        { label: "nums", values: n ? nums : ["–"] },
        { label: "used", values: n ? used.map((u) => (u ? "T" : "F")) : ["–"], hideIndex: true },
        { label: "path", values: path.length ? path : ["–"], hideIndex: true },
      ],
      pointers: i === null ? [] : [{ name: "i", index: i }],
    },
    result: done ? res : undefined,
  });
  const aux = (hi?: number) => [{ label: `permutations (${res.length})`, kind: "list" as const, items: res.map(fmt), highlight: hi === undefined ? [] : [hi] }];
  const marks = (): Highlight[] => [...dt.marks(), ...hl("active", ...used.flatMap((u, k) => (u ? [ai(k), ai(k, 1)] : [])))];

  yield t.step("sort", `Sort nums → ${fmt(nums)}. Then fill position 0, 1, … with any unused element.`, { state: state(null), vars: { n }, aux: aux(), highlights: dt.marks() });

  function* backtrack(): Generator<Step<DecisionState>, void> {
    frames.push({ call: `backtrack()`, locals: { path: fmt(path) } });
    t.count("calls");
    if (path.length === n) {
      res.push(path.slice());
      dt.found();
      yield t.step("record", `All ${n} positions filled: record ${fmt(path)} (permutation #${res.length}) and return.`, {
        state: state(null),
        vars: { depth: path.length, path: fmt(path) },
        callStack: frames,
        aux: aux(res.length - 1),
        highlights: marks(),
      });
      frames.pop();
      return;
    }
    for (let i = 0; i < n; i++) {
      if (used[i]) continue;
      t.count("comparisons");
      if (i > 0 && nums[i] === nums[i - 1] && !used[i - 1]) {
        dt.prune(String(nums[i]), `${fmt([...path, nums[i]])} (duplicate)`);
        yield t.step("skip-dup", `nums[${i}] = ${nums[i]} equals nums[${i - 1}], which is not in use: using this copy first would repeat the branch of its twin. Skip.`, {
          state: state(i),
          vars: { i, "nums[i]": nums[i] },
          callStack: frames,
          aux: aux(),
          highlights: [...marks(), ...hl("mismatch", ai(i), ai(i - 1))],
        });
        continue;
      }
      used[i] = true;
      path.push(nums[i]);
      dt.enter(dt.child(String(nums[i]), fmt(path)));
      yield t.step("choose", `Position ${path.length - 1} ← nums[${i}] = ${nums[i]} (mark it used). path = ${fmt(path)}; explore.`, {
        state: state(i),
        vars: { i, depth: path.length, path: fmt(path) },
        callStack: frames,
        aux: aux(),
        highlights: marks(),
      });
      yield* backtrack();
      path.pop();
      used[i] = false;
      dt.finish("done");
      yield t.step("unchoose", `Back: remove ${nums[i]} from position ${path.length} and free nums[${i}]. path = ${fmt(path)}.`, {
        state: state(i),
        vars: { i, depth: path.length, path: fmt(path) },
        callStack: frames,
        aux: aux(),
        highlights: marks(),
      });
    }
    frames.pop();
  }

  yield* backtrack();
  yield t.step("done", `Done: ${res.length} permutation${res.length === 1 ? "" : "s"} of ${fmt(nums)}.`, { state: state(null, true), vars: { count: res.length }, callStack: [], aux: aux(), highlights: dt.marks() });
}

function reference({ nums }: Input): number[][] {
  // Heap-free brute force: all index orderings, deduplicated by value, sorted lexicographically.
  const s = nums.slice().sort((a, b) => a - b);
  const out = new Map<string, number[]>();
  const go = (rest: number[], acc: number[]) => {
    if (!rest.length) out.set(acc.join(","), acc);
    rest.forEach((x, i) => go([...rest.slice(0, i), ...rest.slice(i + 1)], [...acc, x]));
  };
  go(s, []);
  return [...out.values()].sort((a, b) => {
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i];
    return 0;
  });
}

const algorithm: AlgorithmModule<Input, DecisionState> = {
  ...meta,
  renderer: "decisiontree",
  inputSchema: { fields: [numbersField("nums", "nums", { minLength: 0, maxLength: 4, min: -9, max: 9 })] },
  presets: [
    { name: "LeetCode 46: [1, 2, 3]", input: { nums: [1, 2, 3] } },
    { name: "LeetCode 47: duplicates [1, 1, 2]", input: { nums: [1, 1, 2] } },
    { name: "Edge case: all equal [2, 2, 2]", input: { nums: [2, 2, 2] } },
    { name: "Largest: 4 distinct (24 leaves)", input: { nums: [1, 2, 3, 4] } },
    { name: "Edge case: empty", input: { nums: [] } },
  ],
  randomInput: (size, rng = Math.random) => ({ nums: randomNumbers(rng, Math.min(size, 4), 0, 3, 4) }),
  code: { python, javascript },
  generate,
  reference,
  outputOf: (state) => state.result,
  info,
  legendLabels: { found: "Complete permutation", visited: "Finished branch", active: "Current path / used", current: "Current call", pruned: "Skipped duplicate", mismatch: "Equal neighbours" },
};

export default algorithm;
