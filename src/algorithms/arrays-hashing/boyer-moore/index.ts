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
  let candidate: number | null = null;
  let count = 0;
  // Which earlier indexes are "cancelled" vs still supporting the candidate (for colouring).
  const supporters: number[] = [];
  const cancelled = new Set<number>();
  const state = (i: number, result?: number | null): ArrayState => ({
    rows: [{ values: nums }],
    pointers: i >= 0 && i < nums.length ? [{ name: "x", index: i }] : [],
    caption: `candidate = ${candidate ?? "None"}, count = ${count}`,
    result,
  });
  const colours = () => [...hl("pruned", ...[...cancelled].map((k) => ai(k))), ...hl("active", ...supporters.map((k) => ai(k)))];

  yield t.step("init", "No candidate yet and count = 0.", { state: state(-1), vars: { candidate, count } });

  for (let i = 0; i < nums.length; i++) {
    const x = nums[i];
    if (count === 0) {
      candidate = x;
      supporters.length = 0;
      yield t.step("pick", `count is 0, so ${x} becomes the new candidate.`, {
        state: state(i),
        vars: { x, candidate, count },
        highlights: [...colours(), ...hl("current", ai(i))],
      });
    }
    t.count("comparisons");
    if (x === candidate) {
      count++;
      supporters.push(i);
      yield t.step("vote", `${x} matches the candidate: count += 1 → ${count}.`, {
        state: state(i),
        vars: { x, candidate, count },
        highlights: [...colours(), ...hl("match", ai(i))],
      });
    } else {
      count--;
      const partner = supporters.pop()!;
      cancelled.add(partner);
      cancelled.add(i);
      yield t.step("vote", `${x} differs from ${candidate}: it cancels one ${candidate} (index ${partner}), count −= 1 → ${count}.`, {
        state: state(i),
        vars: { x, candidate, count },
        highlights: [...colours(), ...hl("mismatch", ai(i), ai(partner))],
      });
    }
  }

  const freq = nums.filter((v) => v === candidate).length;
  t.count("comparisons", nums.length);
  const ok = freq > Math.floor(nums.length / 2);
  const all = range(nums.length).filter((k) => nums[k] === candidate);
  yield t.step("verify", `Verify: ${candidate} appears ${freq} times; a majority needs more than ${Math.floor(nums.length / 2)}.`, {
    state: state(-1),
    vars: { candidate, freq, "n // 2": Math.floor(nums.length / 2) },
    highlights: hl("compare", ...all.map((k) => ai(k))),
  });
  if (ok) {
    yield t.step("done", `${candidate} is the majority element.`, {
      state: state(-1, candidate),
      vars: { candidate, freq },
      highlights: hl("found", ...all.map((k) => ai(k))),
    });
  } else {
    yield t.step("none", `${candidate} is not a majority — this array has no majority element.`, {
      state: state(-1, null),
      vars: { candidate, freq },
      highlights: hl("mismatch", ...all.map((k) => ai(k))),
    });
  }
}

function reference({ nums }: Input): number | null {
  const counts = new Map<number, number>();
  for (const x of nums) counts.set(x, (counts.get(x) ?? 0) + 1);
  for (const [x, c] of counts) if (c > Math.floor(nums.length / 2)) return x;
  return null;
}

const algorithm: AlgorithmModule<Input, ArrayState> = {
  ...meta,
  renderer: "array",
  inputSchema: { fields: [numbersField("nums", "nums", { minLength: 1 })] },
  presets: [
    { name: "LeetCode example", input: { nums: [2, 2, 1, 1, 1, 2, 2] } },
    { name: "Candidate switches several times", input: { nums: [1, 2, 3, 3, 3, 1, 3, 3, 2, 3] } },
    { name: "Edge case: no majority", input: { nums: [1, 2, 3, 1, 2] } },
    { name: "Edge case: single element", input: { nums: [5] } },
  ],
  randomInput: (size, rng = Math.random) => {
    const n = Math.max(1, Math.min(16, size));
    if (rng() < 0.3) return { nums: Array.from({ length: n }, () => randInt(rng, 1, 4)) };
    const major = randInt(rng, 1, 5);
    const k = Math.floor(n / 2) + 1;
    const rest = Array.from({ length: n - k }, () => randInt(rng, 1, 6));
    return { nums: shuffle(rng, [...Array(k).fill(major), ...rest]) };
  },
  code: { python, javascript },
  generate,
  reference,
  outputOf: (s) => s.result,
  info,
  legendLabels: { active: "Supporting the candidate", pruned: "Cancelled pair", match: "Vote for", mismatch: "Vote against", compare: "Counted" },
};

export default algorithm;
