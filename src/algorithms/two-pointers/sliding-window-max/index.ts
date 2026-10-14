import type { AlgorithmModule } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { ai, numbersField, randomNumbers, range, type ArrayState, type CellValue } from "../../_shared/array";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  nums: number[];
  k: number;
}

function* generate({ nums, k }: Input) {
  const t = new Tracer<ArrayState>();
  const dq: number[] = [];
  const result: number[] = [];
  const out: CellValue[] = Array(nums.length).fill(null);
  const state = (i: number, res?: number[]): ArrayState => ({
    rows: [
      { label: "nums", values: nums },
      { label: "max", values: out.slice(), hideIndex: true },
    ],
    pointers: i >= 0 && i < nums.length ? [{ name: "i", index: i }] : [],
    ranges: i >= 0 && i < nums.length ? [{ from: Math.max(0, i - k + 1), to: i, kind: "window", label: `k = ${k}` }] : [],
    result: res,
  });
  const aux = (hot?: number) => [{ label: "deque (index:value, front → back)", kind: "deque" as const, items: dq.map((j) => `${j}:${nums[j]}`), highlight: hot === undefined ? undefined : [hot] }];
  const inDeque = () => hl("active", ...dq.map((j) => ai(j)));

  yield t.step("init", "The deque will hold indexes whose values decrease from front to back.", { state: state(-1), vars: { k }, aux: aux() });

  for (let i = 0; i < nums.length; i++) {
    const x = nums[i];
    while (dq.length && nums[dq[dq.length - 1]] <= x) {
      const j = dq.pop()!;
      t.count("pops");
      yield t.step("pop-back", `nums[${j}] = ${nums[j]} ≤ ${x}: it is older and not larger, so it can never be a window max again. Pop it from the back.`, {
        state: state(i),
        vars: { i, x },
        aux: aux(),
        highlights: [...inDeque(), ...hl("removed", ai(j)), ...hl("current", ai(i))],
      });
    }
    dq.push(i);
    t.count("pushes");
    yield t.step("push", `Push index ${i} (${x}) on the back.`, {
      state: state(i),
      vars: { i, x },
      aux: aux(dq.length - 1),
      highlights: [...inDeque(), ...hl("current", ai(i))],
    });
    if (dq[0] <= i - k) {
      const j = dq.shift()!;
      t.count("pops");
      yield t.step("pop-front", `Front index ${j} is outside the window [${i - k + 1}..${i}]: pop it from the front.`, {
        state: state(i),
        vars: { i, front: dq[0] },
        aux: aux(),
        highlights: [...inDeque(), ...hl("pruned", ai(j))],
      });
    }
    if (i >= k - 1) {
      result.push(nums[dq[0]]);
      out[i] = nums[dq[0]];
      yield t.step("record", `Window [${i - k + 1}..${i}] max = nums[${dq[0]}] = ${nums[dq[0]]} (the deque's front).`, {
        state: state(i),
        vars: { i, max: nums[dq[0]], result: result.slice() },
        aux: aux(0),
        highlights: [...hl("window", ...range(k).map((d) => ai(i - d))), ...inDeque(), ...hl("found", ai(dq[0]), ai(i, 1))],
      });
    }
  }

  yield t.step("done", `Window maxima: [${result.join(", ")}].`, { state: state(-1, result.slice()), vars: { result }, aux: aux() });
}

function reference({ nums, k }: Input): number[] {
  const out: number[] = [];
  for (let i = 0; i + k <= nums.length; i++) out.push(Math.max(...nums.slice(i, i + k)));
  return out;
}

const algorithm: AlgorithmModule<Input, ArrayState> = {
  ...meta,
  renderer: "array",
  inputSchema: {
    fields: [numbersField("nums", "nums", { minLength: 1 }), { key: "k", label: "k", kind: "number", integer: true, min: 1, max: 16 }],
    validate: ({ nums, k }) => (k > nums.length ? `k must be at most the array length (${nums.length}).` : null),
  },
  presets: [
    { name: "LeetCode example", input: { nums: [1, 3, -1, -3, 5, 3, 6, 7], k: 3 } },
    { name: "Decreasing (deque fills up)", input: { nums: [9, 8, 7, 6, 5, 4, 3], k: 3 } },
    { name: "Edge case: k = 1", input: { nums: [4, 2, 7], k: 1 } },
    { name: "Increasing (deque stays tiny)", input: { nums: [1, 2, 3, 4, 5, 6], k: 4 } },
  ],
  randomInput: (size, rng = Math.random) => {
    const nums = randomNumbers(rng, size, -5, 12);
    return { nums, k: randInt(rng, 1, nums.length) };
  },
  code: { python, javascript },
  generate,
  reference,
  outputOf: (s) => s.result,
  info,
  legendLabels: { active: "In the deque", removed: "Popped from back", pruned: "Expired from front", found: "Window max", window: "Window" },
};

export default algorithm;
