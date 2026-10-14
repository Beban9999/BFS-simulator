import type { AlgorithmModule } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt, shuffle } from "../../../engine/random";
import { ai, numbersField, range, type ArrayState } from "../../_shared/array";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  nums: number[];
}

function* generate({ nums }: Input) {
  const t = new Tracer<ArrayState>();
  // The "path" row shows the index sequence 0 → nums[0] → ... as a reading aid.
  const path: number[] = [0];
  const seen = new Set([0]);
  while (!seen.has(nums[path[path.length - 1]])) {
    const nx = nums[path[path.length - 1]];
    path.push(nx);
    seen.add(nx);
  }
  path.push(nums[path[path.length - 1]]);
  const pathCaption = `path: ${path.join(" → ")} (repeats)`;
  const state = (slow: number, fast: number, phase: string, result?: number): ArrayState => ({
    rows: [{ label: "nums", values: nums }],
    pointers: [
      { name: "slow", index: slow },
      { name: "fast", index: fast },
    ],
    caption: `${phase} · ${pathCaption}`,
    result,
  });

  let slow = nums[0];
  let fast = nums[0];
  yield t.step("init", `Follow index → value links from index 0. slow = fast = nums[0] = ${nums[0]}.`, {
    state: state(slow, fast, "phase 1"),
    vars: { slow, fast },
    highlights: hl("current", ai(slow)),
  });

  do {
    slow = nums[slow];
    const mid = nums[fast];
    fast = nums[mid];
    t.count("accesses", 3);
    yield t.step("fast-step", `slow moves 1 step to ${slow}; fast moves 2 steps (${mid} → ${fast}).`, {
      state: state(slow, fast, "phase 1"),
      vars: { slow, fast },
      highlights: [...hl("visited", ai(mid)), ...hl("current", ai(slow)), ...hl("active", ai(fast))],
    });
  } while (slow !== fast);

  yield t.step("meet", `slow and fast meet at index ${slow}: there is a cycle. Now find where it starts.`, {
    state: state(slow, fast, "phase 1"),
    vars: { slow, fast },
    highlights: hl("found", ai(slow)),
  });

  slow = nums[0];
  yield t.step("reset", `Phase 2: reset slow to the start (nums[0] = ${slow}); fast stays at the meeting point.`, {
    state: state(slow, fast, "phase 2"),
    vars: { slow, fast },
    highlights: hl("current", ai(slow), ai(fast)),
  });

  while (slow !== fast) {
    slow = nums[slow];
    fast = nums[fast];
    t.count("accesses", 2);
    yield t.step("step-both", `Both move 1 step: slow = ${slow}, fast = ${fast}.`, {
      state: state(slow, fast, "phase 2"),
      vars: { slow, fast },
      highlights: hl("current", ai(slow), ai(fast)),
    });
  }

  const sources = range(nums.length).filter((k) => nums[k] === slow);
  yield t.step("done", `They meet at ${slow}: the cycle entrance, i.e. the value that ${sources.length} indexes (${sources.join(", ")}) point to. The duplicate is ${slow}.`, {
    state: state(slow, fast, "done", slow),
    vars: { duplicate: slow },
    highlights: [...hl("found", ai(slow)), ...hl("match", ...sources.map((k) => ai(k)))],
  });
}

const algorithm: AlgorithmModule<Input, ArrayState> = {
  ...meta,
  renderer: "array",
  inputSchema: {
    fields: [numbersField("nums", "nums (n + 1 values in 1..n)", { min: 1, max: 15, minLength: 2 })],
    validate: ({ nums }) => {
      const n = nums.length - 1;
      if (nums.some((v) => v > n)) return `Values must be between 1 and n = ${n} (the array has n + 1 = ${nums.length} elements).`;
      return null;
    },
  },
  presets: [
    { name: "LeetCode example", input: { nums: [1, 3, 4, 2, 2] } },
    { name: "Second example", input: { nums: [3, 1, 3, 4, 2] } },
    { name: "Long tail before the cycle", input: { nums: [2, 5, 9, 6, 9, 3, 8, 9, 7, 1] } },
    { name: "Edge case: duplicate repeated many times", input: { nums: [2, 2, 2, 2, 2] } },
  ],
  randomInput: (size, rng = Math.random) => {
    const n = Math.max(1, Math.min(14, size));
    const dup = randInt(rng, 1, n);
    const base = range(n).map((k) => k + 1);
    return { nums: shuffle(rng, [...base, dup]) };
  },
  code: { python, javascript },
  generate,
  reference: ({ nums }) => nums.find((v, i) => nums.indexOf(v) !== i) ?? null,
  outputOf: (s) => s.result,
  info,
  legendLabels: { current: "slow (and phase-2 pointers)", active: "fast", visited: "fast's intermediate hop", found: "Meeting point / duplicate", match: "Indexes pointing at it" },
};

export default algorithm;
