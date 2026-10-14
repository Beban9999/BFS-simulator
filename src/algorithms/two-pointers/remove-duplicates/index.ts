import type { AlgorithmModule } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { ai, numbersField, range, sortedNumbers, type ArrayState } from "../../_shared/array";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  nums: number[];
}

function* generate({ nums: input }: Input) {
  const t = new Tracer<ArrayState>();
  const nums = input.slice();
  if (nums.length === 0) {
    yield t.step("done", "Empty array: the answer is 0.", { state: { rows: [{ values: [] }], result: { k: 0, kept: [] } } });
    return;
  }
  let write = 1;
  const state = (read: number, result?: unknown): ArrayState => ({
    rows: [{ values: nums.slice() }],
    pointers: [
      ...(read < nums.length ? [{ name: "read", index: read }] : []),
      { name: "write", index: write },
    ],
    ranges: [{ from: 0, to: write - 1, kind: "found", label: `kept (k = ${write})` }],
    result,
  });
  const kept = () => hl("found", ...range(write).map((k) => ai(k)));

  yield t.step("init", "nums[0] is always kept, so the deduplicated prefix starts as [nums[0]] and write = 1.", {
    state: state(1),
    vars: { read: 1, write },
    highlights: kept(),
  });

  for (let read = 1; read < nums.length; read++) {
    t.count("comparisons");
    if (nums[read] !== nums[write - 1]) {
      yield t.step("compare", `nums[read] = ${nums[read]} differs from the last kept value ${nums[write - 1]}: it's new.`, {
        state: state(read),
        vars: { read, write, "nums[read]": nums[read], "nums[write-1]": nums[write - 1] },
        highlights: [...kept(), ...hl("compare", ai(read), ai(write - 1))],
      });
      nums[write] = nums[read];
      t.count("writes");
      write++;
      yield t.step("keep", `Copy it to index ${write - 1} and advance write to ${write}.`, {
        state: state(read),
        vars: { read, write },
        highlights: [...kept(), ...hl("current", ai(write - 1))],
      });
    } else {
      yield t.step("compare", `nums[read] = ${nums[read]} equals the last kept value — a duplicate. Skip it.`, {
        state: state(read),
        vars: { read, write, "nums[read]": nums[read] },
        highlights: [...kept(), ...hl("pruned", ai(read))],
      });
    }
  }

  yield t.step("done", `k = ${write}. The first ${write} slots hold the distinct values [${nums.slice(0, write).join(", ")}]; the rest is ignored.`, {
    state: state(nums.length, { k: write, kept: nums.slice(0, write) }),
    vars: { k: write },
    highlights: [...kept(), ...hl("pruned", ...range(nums.length - write).map((k) => ai(write + k)))],
  });
}

function reference({ nums }: Input) {
  const kept = nums.filter((v, i) => i === 0 || v !== nums[i - 1]);
  return { k: kept.length, kept };
}

const algorithm: AlgorithmModule<Input, ArrayState> = {
  ...meta,
  renderer: "array",
  inputSchema: { fields: [numbersField("nums", "nums (sorted)", { sorted: true })] },
  presets: [
    { name: "LeetCode example", input: { nums: [0, 0, 1, 1, 1, 2, 2, 3, 3, 4] } },
    { name: "Short example", input: { nums: [1, 1, 2] } },
    { name: "Edge case: all distinct", input: { nums: [1, 2, 3, 4, 5] } },
    { name: "Edge case: all equal", input: { nums: [7, 7, 7, 7, 7] } },
  ],
  randomInput: (size, rng = Math.random) => ({ nums: sortedNumbers(rng, size, 0, 6) }),
  code: { python, javascript },
  generate,
  reference,
  outputOf: (s) => s.result,
  info,
  legendLabels: { found: "Kept prefix", pruned: "Duplicate / ignored", compare: "Compared", current: "Just written" },
};

export default algorithm;
