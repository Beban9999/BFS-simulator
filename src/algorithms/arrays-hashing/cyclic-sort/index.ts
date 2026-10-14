import type { AlgorithmModule } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { ai, numbersField, range, type ArrayState } from "../../_shared/array";
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
  const n = nums.length;
  const ids = range(n);
  const missing: number[] = [];
  const state = (pointers: ArrayState["pointers"], result?: number[]): ArrayState => ({
    rows: [{ values: nums.slice(), ids: ids.slice() }, { label: "wants", values: range(n).map((k) => k + 1), hideIndex: true }],
    pointers,
    caption: missing.length ? `missing = [${missing.join(", ")}]` : undefined,
    result,
  });
  const placed = () => hl("sorted", ...range(n).filter((k) => nums[k] === k + 1).map((k) => ai(k)));

  yield t.step("init", `Values are in 1..${n}, so value v belongs at index v − 1 (shown in the "wants" row).`, {
    state: state([{ name: "i", index: 0 }]),
    vars: { i: 0, n },
    highlights: placed(),
  });

  let i = 0;
  while (i < n) {
    const home = nums[i] - 1;
    t.count("comparisons");
    if (nums[i] !== nums[home]) {
      yield t.step("check", `nums[${i}] = ${nums[i]} belongs at index ${home}, which holds ${nums[home]} — swap them.`, {
        state: state([{ name: "i", index: i }, { name: "home", index: home }]),
        vars: { i, "nums[i]": nums[i], home, "nums[home]": nums[home] },
        highlights: [...placed(), ...hl("current", ai(i)), ...hl("compare", ai(home))],
      });
      [nums[i], nums[home]] = [nums[home], nums[i]];
      [ids[i], ids[home]] = [ids[home], ids[i]];
      t.count("swaps");
      yield t.step("swap", `${nums[home]} is now home at index ${home}. Stay at i = ${i}: the new value ${nums[i]} may also need moving.`, {
        state: state([{ name: "i", index: i }, { name: "home", index: home }]),
        vars: { i, "nums[i]": nums[i], home },
        highlights: [...placed(), ...hl("swap", ai(i), ai(home))],
      });
    } else {
      const why = home === i ? `${nums[i]} is already home` : `${nums[i]} is a duplicate (index ${home} already holds ${nums[home]})`;
      i++;
      yield t.step("advance", `${why}; move on to i = ${i}.`, {
        state: state(i < n ? [{ name: "i", index: i }] : []),
        vars: { i, home },
        highlights: [...placed(), ...hl("current", ai(i - 1))],
      });
    }
  }

  for (let k = 0; k < n; k++) {
    t.count("comparisons");
    if (nums[k] !== k + 1) {
      missing.push(k + 1);
      yield t.step("missing", `Index ${k} holds ${nums[k]} instead of ${k + 1}, so ${k + 1} is missing (and ${nums[k]} is a duplicate).`, {
        state: state([{ name: "i", index: k }]),
        vars: { i: k, "nums[i]": nums[k], missing: missing.slice() },
        highlights: [...placed(), ...hl("mismatch", ai(k))],
      });
    } else {
      yield t.step("scan-check", `Index ${k} holds ${k + 1} — correct.`, {
        state: state([{ name: "i", index: k }]),
        vars: { i: k, missing: missing.slice() },
        highlights: [...placed(), ...hl("current", ai(k))],
      });
    }
  }

  yield t.step("done", missing.length ? `Missing numbers: [${missing.join(", ")}].` : `Nothing is missing: the array is a permutation of 1..${n}.`, {
    state: state([], missing.slice()),
    vars: { missing },
    highlights: [...placed(), ...hl("mismatch", ...missing.map((m) => ai(m - 1)))],
  });
}

function reference({ nums }: Input): number[] {
  const s = new Set(nums);
  return range(nums.length)
    .map((k) => k + 1)
    .filter((v) => !s.has(v));
}

const algorithm: AlgorithmModule<Input, ArrayState> = {
  ...meta,
  renderer: "array",
  inputSchema: {
    fields: [numbersField("nums", "nums (values 1..n)", { min: 1, max: 16, minLength: 1 })],
    validate: ({ nums }) => (nums.some((v) => v > nums.length) ? `Every value must be between 1 and n = ${nums.length}.` : null),
  },
  presets: [
    { name: "LeetCode example", input: { nums: [4, 3, 2, 7, 8, 2, 3, 1] } },
    { name: "Edge case: permutation (none missing)", input: { nums: [3, 1, 5, 4, 2] } },
    { name: "Edge case: all the same", input: { nums: [1, 1, 1, 1] } },
    { name: "Long swap chain", input: { nums: [2, 3, 4, 5, 6, 7, 1, 7] } },
  ],
  randomInput: (size, rng = Math.random) => {
    const n = Math.max(1, Math.min(16, size));
    return { nums: Array.from({ length: n }, () => randInt(rng, 1, n)) };
  },
  code: { python, javascript },
  generate,
  reference,
  outputOf: (s) => s.result,
  info,
  legendLabels: { sorted: "Value is home", mismatch: "Hole (missing value)", compare: "Home of nums[i]" },
};

export default algorithm;
