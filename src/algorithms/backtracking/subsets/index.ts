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

const fmtSet = (xs: number[]) => `[${xs.join(", ")}]`;

function* generate({ nums: input }: Input) {
  const t = new Tracer<DecisionState>();
  const nums = input.slice().sort((a, b) => a - b);
  const dt = new DecisionTree("{}", "[]");
  const res: number[][] = [];
  const path: number[] = [];
  const pathIdx: number[] = [];
  const frames: Frame[] = [];

  const state = (i: number | null, start: number | null, done = false): DecisionState => ({
    tree: dt.view(),
    array: {
      rows: [
        { label: "nums", values: nums.length ? nums : ["–"] },
        { label: "path", values: path.length ? path : ["–"], hideIndex: true },
      ],
      pointers: i === null || i >= nums.length ? [] : [{ name: "i", index: i }],
      ranges: start === null || start >= nums.length ? [] : [{ from: start, to: nums.length - 1, kind: "window", label: "start…" }],
    },
    result: done ? res : undefined,
  });
  const aux = (hi?: number) => [{ label: `results (${res.length})`, kind: "list" as const, items: res.map(fmtSet), highlight: hi === undefined ? [] : [hi] }];
  const marks = (): Highlight[] => [...dt.marks(), ...hl("active", ...pathIdx.map((k) => ai(k)))];

  yield t.step("sort", input.join() === nums.join() ? `nums is already sorted: ${fmtSet(nums)}. Equal values must be neighbours for the duplicate check.` : `Sort nums → ${fmtSet(nums)} so equal values sit next to each other.`, {
    state: state(null, null),
    vars: { n: nums.length },
    aux: aux(),
    highlights: dt.marks(),
  });

  function* backtrack(start: number): Generator<Step<DecisionState>, void> {
    frames.push({ call: `backtrack(start=${start})`, locals: { path: fmtSet(path) } });
    t.count("calls");
    res.push(path.slice());
    dt.found();
    yield t.step("record", `Record ${fmtSet(path)} (subset #${res.length}). Next, try each element from index ${start} on.`, {
      state: state(null, start),
      vars: { start, path: fmtSet(path) },
      callStack: frames,
      aux: aux(res.length - 1),
      highlights: marks(),
    });
    if (start >= nums.length) {
      yield t.step("loop", `start = ${start} is past the end: nothing left to add. Return.`, { state: state(null, start), vars: { start }, callStack: frames, aux: aux(), highlights: marks() });
    }
    for (let i = start; i < nums.length; i++) {
      t.count("comparisons");
      if (i > start && nums[i] === nums[i - 1]) {
        dt.prune(String(nums[i]), `${fmtSet([...path, nums[i]])} again`);
        yield t.step("skip-dup", `nums[${i}] = ${nums[i]} equals its left sibling nums[${i - 1}]: that branch would rebuild the same subsets. Skip it.`, {
          state: state(i, start),
          vars: { start, i, "nums[i]": nums[i] },
          callStack: frames,
          aux: aux(),
          highlights: [...marks(), ...hl("mismatch", ai(i), ai(i - 1))],
        });
        continue;
      }
      path.push(nums[i]);
      pathIdx.push(i);
      const node = dt.child(String(nums[i]), fmtSet(path));
      dt.enter(node);
      yield t.step("choose", `Choose nums[${i}] = ${nums[i]} → path ${fmtSet(path)}, then explore with start = ${i + 1}.`, {
        state: state(i, start),
        vars: { start, i, path: fmtSet(path) },
        callStack: frames,
        aux: aux(),
        highlights: marks(),
      });
      yield* backtrack(i + 1);
      path.pop();
      pathIdx.pop();
      dt.finish("found");
      yield t.step("unchoose", `Back from ${fmtSet([...path, nums[i]])}: pop ${nums[i]} → path ${fmtSet(path)}.`, {
        state: state(i, start),
        vars: { start, i, path: fmtSet(path) },
        callStack: frames,
        aux: aux(),
        highlights: marks(),
      });
    }
    frames.pop();
  }

  yield* backtrack(0);
  yield t.step("done", `Done: ${res.length} distinct subset${res.length === 1 ? "" : "s"} of ${fmtSet(nums)}${new Set(nums).size < nums.length ? " (duplicates skipped)" : ""}.`, {
    state: state(null, null, true),
    vars: { subsets: res.length },
    callStack: [],
    aux: aux(),
    highlights: dt.marks(),
  });
}

function reference({ nums }: Input): number[][] {
  // Every bitmask, deduplicated, then ordered like the recursion (lexicographic preorder on sorted values).
  const s = nums.slice().sort((a, b) => a - b);
  const seen = new Map<string, number[]>();
  for (let m = 0; m < 1 << s.length; m++) {
    const sub = s.filter((_, i) => (m >> i) & 1);
    seen.set(sub.join(","), sub);
  }
  return [...seen.values()].sort((a, b) => {
    for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) return a[i] - b[i];
    return a.length - b.length;
  });
}

const algorithm: AlgorithmModule<Input, DecisionState> = {
  ...meta,
  renderer: "decisiontree",
  inputSchema: { fields: [numbersField("nums", "nums", { minLength: 0, maxLength: 5, min: -9, max: 9 })] },
  presets: [
    { name: "LeetCode 78: [1, 2, 3]", input: { nums: [1, 2, 3] } },
    { name: "LeetCode 90: duplicates [1, 2, 2]", input: { nums: [1, 2, 2] } },
    { name: "Many duplicates [2, 1, 2, 1, 2]", input: { nums: [2, 1, 2, 1, 2] } },
    { name: "Edge case: empty", input: { nums: [] } },
    { name: "Largest: 5 distinct (32 subsets)", input: { nums: [4, 1, 3, 5, 2] } },
  ],
  randomInput: (size, rng = Math.random) => ({ nums: randomNumbers(rng, Math.min(size, 5), 0, 4, 5) }),
  code: { python, javascript },
  generate,
  reference,
  outputOf: (state) => state.result,
  info,
  legendLabels: { found: "Recorded subset", active: "Current path", current: "Current call", pruned: "Skipped duplicate", window: "Candidates (start…)", mismatch: "Equal neighbours" },
};

export default algorithm;
