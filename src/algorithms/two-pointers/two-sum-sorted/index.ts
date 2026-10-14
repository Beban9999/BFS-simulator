import type { AlgorithmModule } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { ai, numbersField, range, sortedNumbers, type ArrayState } from "../../_shared/array";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  numbers: number[];
  target: number;
}

function* generate({ numbers, target }: Input) {
  const t = new Tracer<ArrayState>();
  let left = 0;
  let right = numbers.length - 1;
  const discarded = () => hl("pruned", ...range(numbers.length).filter((k) => k < left || k > right).map((k) => ai(k)));
  const state = (result?: number[]): ArrayState => ({
    rows: [{ values: numbers }],
    pointers: [
      { name: "left", index: left },
      { name: "right", index: right },
    ],
    caption: `target = ${target}`,
    result,
  });

  yield t.step("init", "Start with left on the smallest value and right on the largest.", {
    state: state(),
    vars: { left, right, target },
    highlights: discarded(),
  });

  while (left < right) {
    const total = numbers[left] + numbers[right];
    t.count("comparisons");
    if (total === target) {
      yield t.step("found", `${numbers[left]} + ${numbers[right]} = ${target}. Found the pair at indexes [${left}, ${right}].`, {
        state: state([left, right]),
        vars: { left, right, total },
        highlights: [...discarded(), ...hl("found", ai(left), ai(right))],
      });
      return;
    }
    if (total < target) {
      yield t.step("sum", `${numbers[left]} + ${numbers[right]} = ${total} < ${target}. Even the largest partner is too small for numbers[${left}], so discard it.`, {
        state: state(),
        vars: { left, right, total },
        highlights: [...discarded(), ...hl("compare", ai(left), ai(right))],
      });
      left++;
      yield t.step("move-left", `left → ${left}.`, { state: state(), vars: { left, right }, highlights: discarded() });
    } else {
      yield t.step("sum", `${numbers[left]} + ${numbers[right]} = ${total} > ${target}. Even the smallest partner is too big for numbers[${right}], so discard it.`, {
        state: state(),
        vars: { left, right, total },
        highlights: [...discarded(), ...hl("compare", ai(left), ai(right))],
      });
      right--;
      yield t.step("move-right", `right → ${right}.`, { state: state(), vars: { left, right }, highlights: discarded() });
    }
  }

  yield t.step("none", "The pointers met: no pair adds up to the target.", { state: state([]), vars: { left, right }, highlights: discarded() });
}

function reference({ numbers, target }: Input): number[] {
  let l = 0;
  let r = numbers.length - 1;
  while (l < r) {
    const s = numbers[l] + numbers[r];
    if (s === target) return [l, r];
    if (s < target) l++;
    else r--;
  }
  return [];
}

const algorithm: AlgorithmModule<Input, ArrayState> = {
  ...meta,
  renderer: "array",
  inputSchema: {
    fields: [numbersField("numbers", "numbers (sorted)", { sorted: true }), { key: "target", label: "target", kind: "number", integer: true, min: -200, max: 200 }],
  },
  presets: [
    { name: "LeetCode example", input: { numbers: [2, 7, 11, 15], target: 9 } },
    { name: "Pointers walk a long way", input: { numbers: [1, 3, 4, 6, 8, 10, 13, 17, 20], target: 14 } },
    { name: "Edge case: negatives", input: { numbers: [-5, -3, 0, 2, 4, 9], target: -1 } },
    { name: "Edge case: no pair", input: { numbers: [1, 2, 4, 8], target: 20 } },
  ],
  randomInput: (size, rng = Math.random) => {
    const numbers = sortedNumbers(rng, Math.max(2, size), -10, 30);
    const a = randInt(rng, 0, numbers.length - 1);
    const b = randInt(rng, 0, numbers.length - 1);
    return { numbers, target: a === b ? randInt(rng, -20, 60) : numbers[a] + numbers[b] };
  },
  code: { python, javascript },
  generate,
  reference,
  outputOf: (s) => s.result,
  info,
  legendLabels: { pruned: "Ruled out", compare: "Current pair" },
};

export default algorithm;
