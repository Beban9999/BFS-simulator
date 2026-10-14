import type { AlgorithmModule } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { ai, numbersField, randomNumbers, range, type ArrayState } from "../../_shared/array";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  nums: number[];
}

/** Avoid printing -0 when a product involves zero and a negative. */
const clean = (x: number) => (Object.is(x, -0) ? 0 : x);

function* generate({ nums }: Input) {
  const t = new Tracer<ArrayState>();
  const n = nums.length;
  const answer = Array(n).fill(1);
  const state = (i: number, extra: Partial<ArrayState> = {}): ArrayState => ({
    rows: [
      { label: "nums", values: nums },
      { label: "answer", values: answer.map(clean) },
    ],
    pointers: i >= 0 && i < n ? [{ name: "i", index: i, row: 0 }] : [],
    ...extra,
  });

  yield t.step("init", "Fill answer with 1s. It will first hold left products, then be multiplied by right products.", {
    state: state(-1),
    vars: { n },
  });

  let left = 1;
  for (let i = 0; i < n; i++) {
    answer[i] = left;
    yield t.step("left-store", `answer[${i}] = left = ${clean(left)} — the product of everything left of index ${i}.`, {
      state: state(i, i > 0 ? { ranges: [{ from: 0, to: i - 1, kind: "window", label: `left = ${clean(left)}` }] } : {}),
      vars: { i, left: clean(left) },
      highlights: [...hl("window", ...range(i).map((k) => ai(k))), ...hl("current", ai(i, 1))],
    });
    left *= nums[i];
    t.count("writes");
    yield t.step("left-mul", `Include nums[${i}] = ${nums[i]} for the next index: left = ${clean(left)}.`, {
      state: state(i),
      vars: { i, left: clean(left) },
      highlights: hl("current", ai(i)),
    });
  }

  let right = 1;
  for (let i = n - 1; i >= 0; i--) {
    answer[i] *= right;
    yield t.step("right-store", `answer[${i}] *= right (${clean(right)}) → ${clean(answer[i])}: now left × right of index ${i}.`, {
      state: state(i, i < n - 1 ? { ranges: [{ from: i + 1, to: n - 1, kind: "active", label: `right = ${clean(right)}` }] } : {}),
      vars: { i, right: clean(right), "answer[i]": clean(answer[i]) },
      highlights: [...hl("active", ...range(n - 1 - i).map((k) => ai(i + 1 + k))), ...hl("found", ai(i, 1))],
    });
    right *= nums[i];
    t.count("writes");
    yield t.step("right-mul", `Include nums[${i}] = ${nums[i]} for the index to the left: right = ${clean(right)}.`, {
      state: state(i),
      vars: { i, right: clean(right) },
      highlights: hl("current", ai(i)),
    });
  }

  const result = answer.map(clean);
  yield t.step("done", `answer = [${result.join(", ")}].`, {
    state: state(-1, { result }),
    vars: { answer: result },
    highlights: hl("sorted", ...range(n).map((k) => ai(k, 1))),
  });
}

function reference({ nums }: Input): number[] {
  return nums.map((_, i) => clean(nums.reduce((p, x, j) => (j === i ? p : p * x), 1)));
}

const algorithm: AlgorithmModule<Input, ArrayState> = {
  ...meta,
  renderer: "array",
  inputSchema: { fields: [numbersField("nums", "nums", { minLength: 2, maxLength: 10, min: -9, max: 9 })] },
  presets: [
    { name: "LeetCode example", input: { nums: [1, 2, 3, 4] } },
    { name: "Edge case: one zero", input: { nums: [-1, 1, 0, -3, 3] } },
    { name: "Edge case: two zeros", input: { nums: [4, 0, 2, 0] } },
    { name: "Two elements", input: { nums: [5, 7] } },
  ],
  randomInput: (size, rng = Math.random) => ({ nums: randomNumbers(rng, Math.max(2, size), -4, 5, 10) }),
  code: { python, javascript },
  generate,
  reference,
  outputOf: (s) => s.result,
  info,
  legendLabels: { window: "Left of i", active: "Right of i", found: "Finished answer", sorted: "Final" },
};

export default algorithm;
