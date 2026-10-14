import type { AlgorithmModule } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { ai, numbersField, randomNumbers, type ArrayState } from "../../_shared/array";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  nums: number[];
}

function* generate({ nums: input }: Input) {
  const t = new Tracer<ArrayState>();
  const nums = input.slice().sort((a, b) => a - b);
  const result: number[][] = [];
  const state = (pointers: ArrayState["pointers"] = [], res?: number[][]): ArrayState => ({
    rows: [{ values: nums }],
    pointers,
    caption: result.length ? `found: ${result.map((r) => `[${r.join(", ")}]`).join(" ")}` : "found: none yet",
    result: res,
  });

  yield t.step("sort", `Sort: [${nums.join(", ")}]. Equal values are now adjacent, which makes duplicates easy to skip.`, { state: state() });

  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) {
      yield t.step("skip-i", `nums[${i}] = ${nums[i]} equals the previous value — it would repeat the same triplets. Skip.`, {
        state: state([{ name: "i", index: i }]),
        vars: { i },
        highlights: hl("pruned", ai(i)),
      });
      continue;
    }
    let left = i + 1;
    let right = nums.length - 1;
    const ptrs = () => [
      { name: "i", index: i },
      { name: "L", index: left },
      { name: "R", index: right },
    ];
    yield t.step("init-pointers", `Fix nums[${i}] = ${nums[i]}; look for a pair summing to ${-nums[i]} in the rest.`, {
      state: state(ptrs()),
      vars: { i, "need": -nums[i] },
      highlights: hl("pivot", ai(i)),
    });
    while (left < right) {
      const total = nums[i] + nums[left] + nums[right];
      t.count("comparisons");
      if (total < 0) {
        yield t.step("move-left", `${nums[i]} + ${nums[left]} + ${nums[right]} = ${total} < 0: need bigger, move L right.`, {
          state: state(ptrs()),
          vars: { i, left, right, total },
          highlights: [...hl("pivot", ai(i)), ...hl("compare", ai(left), ai(right))],
        });
        left++;
      } else if (total > 0) {
        yield t.step("move-right", `${nums[i]} + ${nums[left]} + ${nums[right]} = ${total} > 0: need smaller, move R left.`, {
          state: state(ptrs()),
          vars: { i, left, right, total },
          highlights: [...hl("pivot", ai(i)), ...hl("compare", ai(left), ai(right))],
        });
        right--;
      } else {
        result.push([nums[i], nums[left], nums[right]]);
        yield t.step("found", `${nums[i]} + ${nums[left]} + ${nums[right]} = 0 — record the triplet.`, {
          state: state(ptrs()),
          vars: { i, left, right, total },
          highlights: hl("found", ai(i), ai(left), ai(right)),
        });
        left++;
        while (left < right && nums[left] === nums[left - 1]) {
          left++;
          yield t.step("skip-dup", `nums[${left - 1}] repeats ${nums[left - 1]}; skip it so the same pair isn't found twice.`, {
            state: state(ptrs()),
            vars: { i, left, right },
            highlights: [...hl("pivot", ai(i)), ...hl("pruned", ai(left - 1))],
          });
        }
        right--;
      }
    }
  }

  yield t.step("done", result.length ? `${result.length} unique triplet${result.length === 1 ? "" : "s"}: ${result.map((r) => `[${r.join(", ")}]`).join(", ")}.` : "No triplet sums to zero.", {
    state: state([], result.map((r) => r.slice())),
    vars: { result },
  });
}

function reference({ nums }: Input): number[][] {
  const a = nums.slice().sort((x, y) => x - y);
  const seen = new Set<string>();
  const out: number[][] = [];
  for (let i = 0; i < a.length; i++)
    for (let j = i + 1; j < a.length; j++)
      for (let k = j + 1; k < a.length; k++)
        if (a[i] + a[j] + a[k] === 0) {
          const key = `${a[i]},${a[j]},${a[k]}`;
          if (!seen.has(key)) {
            seen.add(key);
            out.push([a[i], a[j], a[k]]);
          }
        }
  return out.sort((p, q) => p[0] - q[0] || p[1] - q[1]);
}

const algorithm: AlgorithmModule<Input, ArrayState> = {
  ...meta,
  renderer: "array",
  inputSchema: { fields: [numbersField("nums", "nums", { maxLength: 14, min: -20, max: 20 })] },
  presets: [
    { name: "LeetCode example", input: { nums: [-1, 0, 1, 2, -1, -4] } },
    { name: "Many duplicates", input: { nums: [-2, 0, 0, 2, 2, -2, 0, 1, -1] } },
    { name: "Edge case: all zeros", input: { nums: [0, 0, 0, 0] } },
    { name: "Edge case: no triplet", input: { nums: [1, 2, -2, -1] } },
  ],
  randomInput: (size, rng = Math.random) => ({ nums: randomNumbers(rng, Math.max(3, size), -6, 6, 14) }),
  code: { python, javascript },
  generate,
  reference,
  outputOf: (s) => s.result,
  info,
  legendLabels: { pivot: "Fixed nums[i]", compare: "Current pair", pruned: "Skipped duplicate", found: "Triplet" },
};

export default algorithm;
