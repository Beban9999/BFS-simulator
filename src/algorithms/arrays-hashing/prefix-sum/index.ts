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
  queries: number[][];
}

function* generate({ nums, queries }: Input) {
  const t = new Tracer<ArrayState>();
  const n = nums.length;
  const prefix: CellValue[] = [0, ...Array(n).fill(null)];
  const answers: number[] = [];
  const state = (extra: Partial<ArrayState> = {}): ArrayState => ({
    rows: [
      { label: "nums", values: nums },
      { label: "prefix", values: prefix.slice() },
    ],
    ...extra,
  });

  yield t.step("init", `Create prefix with n + 1 = ${n + 1} slots; prefix[0] = 0 is the sum of zero elements.`, {
    state: state(),
    vars: { n },
    highlights: hl("current", ai(0, 1)),
  });

  for (let i = 0; i < n; i++) {
    prefix[i + 1] = (prefix[i] as number) + nums[i];
    t.count("writes");
    yield t.step("build", `prefix[${i + 1}] = prefix[${i}] + nums[${i}] = ${prefix[i]} + ${nums[i]} = ${prefix[i + 1]}.`, {
      state: state({ pointers: [{ name: "i", index: i, row: 0 }] }),
      vars: { i, "nums[i]": nums[i], "prefix[i+1]": prefix[i + 1] },
      highlights: [...hl("current", ai(i, 0), ai(i + 1, 1)), ...hl("compare", ai(i, 1))],
    });
  }

  for (const [l, r] of queries) {
    const sum = (prefix[r + 1] as number) - (prefix[l] as number);
    answers.push(sum);
    t.count("accesses", 2);
    yield t.step(
      "query",
      `sum(${l}..${r}) = prefix[${r + 1}] − prefix[${l}] = ${prefix[r + 1]} − ${prefix[l]} = ${sum}. Two lookups instead of ${r - l + 1} additions.`,
      {
        state: state({
          ranges: [{ from: l, to: r, kind: "window", label: `sum = ${sum}`, row: 0 }],
        }),
        vars: { l, r, "prefix[r+1]": prefix[r + 1], "prefix[l]": prefix[l], sum, answers: answers.slice() },
        highlights: [...hl("window", ...range(r - l + 1).map((k) => ai(l + k, 0))), ...hl("found", ai(r + 1, 1)), ...hl("compare", ai(l, 1))],
      },
    );
  }

  yield t.step("done", queries.length ? `Answered ${queries.length} quer${queries.length === 1 ? "y" : "ies"}: [${answers.join(", ")}].` : "No queries to answer; the prefix array is ready.", {
    state: state({ result: answers }),
    vars: { answers },
  });
}

function reference({ nums, queries }: Input): number[] {
  return queries.map(([l, r]) => nums.slice(l, r + 1).reduce((a, b) => a + b, 0));
}

const algorithm: AlgorithmModule<Input, ArrayState> = {
  ...meta,
  renderer: "array",
  inputSchema: {
    fields: [
      numbersField("nums", "nums", { minLength: 1 }),
      { key: "queries", label: "queries (l r per line)", kind: "matrix", maxRows: 8, maxCols: 2, min: 0, max: 15 },
    ],
    validate: ({ nums, queries }) => {
      for (const q of queries) {
        if (q.length !== 2) return "Each query needs exactly two numbers: l r.";
        if (q[0] > q[1]) return `Query ${q[0]} ${q[1]}: l must be ≤ r.`;
        if (q[1] >= nums.length) return `Query ${q[0]} ${q[1]}: r must be < ${nums.length}.`;
      }
      return null;
    },
  },
  presets: [
    { name: "LeetCode example", input: { nums: [-2, 0, 3, -5, 2, -1], queries: [[0, 2], [2, 5], [0, 5]] } },
    { name: "Single-element ranges", input: { nums: [4, 1, 7, 3], queries: [[0, 0], [3, 3], [1, 2]] } },
    { name: "Edge case: one element", input: { nums: [5], queries: [[0, 0]] } },
    { name: "Longer array", input: { nums: [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5], queries: [[2, 7], [0, 10], [5, 5], [8, 10]] } },
  ],
  randomInput: (size, rng = Math.random) => {
    const nums = randomNumbers(rng, Math.max(1, size), -9, 9);
    const queries = Array.from({ length: randInt(rng, 1, 4) }, () => {
      const a = randInt(rng, 0, nums.length - 1);
      const b = randInt(rng, 0, nums.length - 1);
      return [Math.min(a, b), Math.max(a, b)];
    });
    return { nums, queries };
  },
  code: { python, javascript },
  generate,
  reference,
  outputOf: (s) => s.result,
  info,
  legendLabels: { window: "Queried range", found: "prefix[r+1]", compare: "prefix[l] / prefix[i]" },
};

export default algorithm;
