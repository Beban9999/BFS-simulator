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

function* generate({ nums: input }: Input) {
  const t = new Tracer<ArrayState>();
  const nums = input.slice();
  const ids = range(nums.length);
  let write = 0;
  const state = (read: number, result?: number[]): ArrayState => ({
    rows: [{ values: nums.slice(), ids: ids.slice() }],
    pointers: [...(read < nums.length ? [{ name: "read", index: read }] : []), { name: "write", index: write }],
    ranges: write > 0 ? [{ from: 0, to: write - 1, kind: "found", label: "non-zeros" }] : [],
    result,
  });
  const packed = () => hl("found", ...range(write).map((k) => ai(k)));

  yield t.step("init", "write = 0: nothing packed yet.", { state: state(0), vars: { write } });

  for (let read = 0; read < nums.length; read++) {
    t.count("comparisons");
    if (nums[read] !== 0) {
      const same = read === write;
      [nums[write], nums[read]] = [nums[read], nums[write]];
      [ids[write], ids[read]] = [ids[read], ids[write]];
      if (!same) t.count("swaps");
      write++;
      yield t.step(
        "swap",
        same
          ? `nums[${read}] = ${nums[write - 1]} is non-zero and already at the write slot. write → ${write}.`
          : `nums[${read}] = ${nums[write - 1]} is non-zero: swap it back to index ${write - 1} (a zero moves to ${read}). write → ${write}.`,
        {
          state: state(read),
          vars: { read, write },
          highlights: [...packed(), ...hl(same ? "current" : "swap", ai(write - 1), ...(same ? [] : [ai(read)]))],
        },
      );
    } else {
      yield t.step("check", `nums[${read}] is 0: leave it; it will be swapped backwards later.`, {
        state: state(read),
        vars: { read, write },
        highlights: [...packed(), ...hl("pruned", ai(read))],
      });
    }
  }

  yield t.step("done", `All non-zeros are packed at the front in their original order: [${nums.join(", ")}].`, {
    state: state(nums.length, nums.slice()),
    vars: { write },
    highlights: [...packed(), ...hl("pruned", ...range(nums.length - write).map((k) => ai(write + k)))],
  });
}

const algorithm: AlgorithmModule<Input, ArrayState> = {
  ...meta,
  renderer: "array",
  inputSchema: { fields: [numbersField("nums", "nums")] },
  presets: [
    { name: "LeetCode example", input: { nums: [0, 1, 0, 3, 12] } },
    { name: "Zeros clustered", input: { nums: [4, 0, 0, 0, 5, 6, 0, 7] } },
    { name: "Edge case: no zeros", input: { nums: [1, 2, 3] } },
    { name: "Edge case: all zeros", input: { nums: [0, 0, 0] } },
  ],
  randomInput: (size, rng = Math.random) => ({ nums: randomNumbers(rng, size, 0, 9).map((v) => (v < 4 ? 0 : v)) }),
  code: { python, javascript },
  generate,
  reference: ({ nums }) => [...nums.filter((v) => v !== 0), ...nums.filter((v) => v === 0)],
  outputOf: (s) => s.result,
  info,
  legendLabels: { found: "Packed non-zeros", pruned: "Zero" },
};

export default algorithm;
