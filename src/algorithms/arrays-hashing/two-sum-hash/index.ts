import type { AlgorithmModule } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { ai, numbersField, randomNumbers, type ArrayState } from "../../_shared/array";
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
  const seen = new Map<number, number>();
  const aux = (hot?: number) => {
    const items = [...seen.entries()];
    return [
      {
        label: "seen (value → index)",
        kind: "map" as const,
        items,
        highlight: hot === undefined ? undefined : [items.findIndex(([k]) => k === hot)],
      },
    ];
  };
  const state = (i: number, result?: number[]): ArrayState => ({
    rows: [{ values: nums }],
    pointers: i < nums.length ? [{ name: "i", index: i }] : [],
    caption: `target = ${target}`,
    result,
  });
  const stored = () => hl("visited", ...[...seen.values()].map((j) => ai(j)));

  yield t.step("init", `Create an empty map from value to index. We look for two numbers adding up to ${target}.`, {
    state: state(0),
    aux: aux(),
  });

  for (let i = 0; i < nums.length; i++) {
    const x = nums[i];
    const need = target - x;
    yield t.step("need", `nums[${i}] = ${x}, so its partner must be ${target} − ${x} = ${need}.`, {
      state: state(i),
      vars: { i, x, need },
      aux: aux(),
      highlights: [...stored(), ...hl("current", ai(i))],
    });
    t.count("hashes");
    if (seen.has(need)) {
      const j = seen.get(need)!;
      yield t.step("found", `${need} is in the map at index ${j}. Answer: [${j}, ${i}] because ${nums[j]} + ${x} = ${target}.`, {
        state: state(i, [j, i]),
        vars: { i, x, need, "seen[need]": j },
        aux: aux(need),
        highlights: hl("found", ai(j), ai(i)),
      });
      return;
    }
    yield t.step("lookup", `${need} is not in the map yet, so no partner for ${x} among the numbers seen so far.`, {
      state: state(i),
      vars: { i, x, need },
      aux: aux(),
      highlights: [...stored(), ...hl("current", ai(i))],
    });
    seen.set(x, i);
    yield t.step("store", `Remember seen[${x}] = ${i} for the numbers still to come.`, {
      state: state(i),
      vars: { i, x, need },
      aux: aux(x),
      highlights: [...stored(), ...hl("current", ai(i))],
    });
  }

  yield t.step("none", `Scanned every number without finding a pair that sums to ${target}.`, {
    state: state(nums.length, []),
    aux: aux(),
    highlights: stored(),
  });
}

function reference({ nums, target }: Input): number[] {
  const seen = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    if (seen.has(target - nums[i])) return [seen.get(target - nums[i])!, i];
    seen.set(nums[i], i);
  }
  return [];
}

const algorithm: AlgorithmModule<Input, ArrayState> = {
  ...meta,
  renderer: "array",
  inputSchema: {
    fields: [
      numbersField("nums", "nums"),
      { key: "target", label: "target", kind: "number", integer: true, min: -200, max: 200 },
    ],
  },
  presets: [
    { name: "LeetCode example", input: { nums: [2, 7, 11, 15], target: 9 } },
    { name: "Pair at the end", input: { nums: [3, 8, 1, 9, 4, 12, 6], target: 18 } },
    { name: "Edge case: duplicates (3 + 3)", input: { nums: [3, 2, 4, 3], target: 6 } },
    { name: "Edge case: no pair", input: { nums: [1, 2, 5, 9], target: 100 } },
  ],
  randomInput: (size, rng = Math.random) => {
    const nums = randomNumbers(rng, Math.max(2, size), -10, 20);
    const a = randInt(rng, 0, nums.length - 1);
    let b = randInt(rng, 0, nums.length - 1);
    if (b === a) b = (a + 1) % nums.length;
    return { nums, target: nums[a] + nums[b] };
  },
  code: { python, javascript },
  generate,
  reference,
  outputOf: (s) => s.result,
  info,
  legendLabels: { visited: "Stored in the map", found: "Answer pair" },
};

export default algorithm;
