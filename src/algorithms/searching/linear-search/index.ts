import type { AlgorithmModule } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { pick } from "../../../engine/random";
import { ai, numbersField, randomNumbers, range, type ArrayState } from "../../_shared/array";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  nums: number[];
  target: number;
}

function* generate({ nums, target }: Input) {
  const t = new Tracer<ArrayState>();
  const state = (i: number, result?: number): ArrayState => ({
    rows: [{ values: nums }],
    pointers: i >= 0 && i < nums.length ? [{ name: "i", index: i }] : [],
    caption: `target = ${target}`,
    result,
  });
  const checked = (i: number) => hl("pruned", ...range(i).map((k) => ai(k)));

  for (let i = 0; i < nums.length; i++) {
    t.count("comparisons");
    if (nums[i] === target) {
      yield t.step("found", `nums[${i}] = ${nums[i]} equals the target. Found at index ${i} after ${i + 1} comparison${i ? "s" : ""}.`, {
        state: state(i, i),
        vars: { i, "nums[i]": nums[i] },
        highlights: [...checked(i), ...hl("found", ai(i))],
      });
      return;
    }
    yield t.step("compare", `nums[${i}] = ${nums[i]} ≠ ${target}. Move on.`, {
      state: state(i),
      vars: { i, "nums[i]": nums[i] },
      highlights: [...checked(i), ...hl("compare", ai(i))],
    });
  }
  yield t.step("none", `Checked all ${nums.length} elements: ${target} is not present. Return −1.`, {
    state: state(-1, -1),
    highlights: checked(nums.length),
  });
}

const algorithm: AlgorithmModule<Input, ArrayState> = {
  ...meta,
  renderer: "array",
  inputSchema: { fields: [numbersField("nums", "nums"), { key: "target", label: "target", kind: "number", integer: true, min: -99, max: 99 }] },
  presets: [
    { name: "Typical", input: { nums: [7, 3, 9, 1, 5, 8, 2], target: 5 } },
    { name: "Edge case: first element", input: { nums: [4, 1, 2], target: 4 } },
    { name: "Worst case: absent", input: { nums: [3, 1, 4, 1, 5, 9, 2, 6], target: 7 } },
    { name: "Edge case: empty", input: { nums: [], target: 1 } },
  ],
  randomInput: (size, rng = Math.random) => {
    const nums = randomNumbers(rng, size, 0, 20);
    return { nums, target: rng() < 0.7 ? pick(rng, nums) : 21 };
  },
  code: { python, javascript },
  generate,
  reference: ({ nums, target }) => nums.indexOf(target),
  outputOf: (s) => s.result,
  info,
  legendLabels: { pruned: "Checked", compare: "Comparing" },
};

export default algorithm;
