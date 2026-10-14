import type { AlgorithmModule } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { ai, type ArrayState } from "../../_shared/array";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  n: number;
}

export function nextNumber(n: number): number {
  let total = 0;
  while (n > 0) {
    const d = n % 10;
    total += d * d;
    n = Math.floor(n / 10);
  }
  return total;
}

const explain = (n: number) =>
  `${String(n)
    .split("")
    .map((d) => `${d}²`)
    .join(" + ")} = ${nextNumber(n)}`;

function* generate({ n }: Input) {
  const t = new Tracer<ArrayState>();
  // The sequence is drawn as a row; slow/fast are positions along it.
  const seq: number[] = [n];
  const ensure = (k: number) => {
    while (seq.length <= k) seq.push(nextNumber(seq[seq.length - 1]));
  };
  let s = 0;
  let f = 1;
  ensure(f);
  const state = (result?: boolean): ArrayState => ({
    rows: [{ label: "sequence", values: seq.slice() }],
    pointers: [
      { name: "slow", index: s },
      { name: "fast", index: f },
    ],
    result,
  });

  yield t.step("init", `slow = ${n}, fast = next(${n}) = ${explain(n)}.`, {
    state: state(),
    vars: { slow: seq[s], fast: seq[f] },
    highlights: hl("current", ai(s), ai(f)),
  });

  while (seq[f] !== 1 && seq[s] !== seq[f]) {
    s += 1;
    f += 2;
    ensure(f);
    t.count("calls", 3);
    yield t.step("fast-step", `slow → next(${seq[s - 1]}) = ${seq[s]}; fast jumps two: ${seq[f - 2]} → ${seq[f - 1]} → ${seq[f]}.`, {
      state: state(),
      vars: { slow: seq[s], fast: seq[f] },
      highlights: [...hl("visited", ai(f - 1)), ...hl("current", ai(s)), ...hl("active", ai(f))],
    });
  }

  const happy = seq[f] === 1;
  yield t.step(
    "done",
    happy ? `fast reached 1, so ${n} is a happy number.` : `slow and fast both equal ${seq[s]}: the sequence loops without ever reaching 1, so ${n} is not happy.`,
    {
      state: state(happy),
      vars: { slow: seq[s], fast: seq[f], happy },
      highlights: happy ? hl("found", ai(f)) : hl("mismatch", ai(s), ai(f)),
    },
  );
}

function reference({ n }: Input): boolean {
  const seen = new Set<number>();
  while (n !== 1 && !seen.has(n)) {
    seen.add(n);
    n = nextNumber(n);
  }
  return n === 1;
}

const algorithm: AlgorithmModule<Input, ArrayState> = {
  ...meta,
  renderer: "array",
  inputSchema: { fields: [{ key: "n", label: "n", kind: "number", integer: true, min: 1, max: 99999 }] },
  presets: [
    { name: "LeetCode example (happy)", input: { n: 19 } },
    { name: "Unhappy: falls into the 4 → 16 → … loop", input: { n: 2 } },
    { name: "Edge case: n = 1", input: { n: 1 } },
    { name: "Happy after a while", input: { n: 7 } },
  ],
  randomInput: (_size, rng = Math.random) => ({ n: randInt(rng, 1, 999) }),
  code: { python, javascript },
  generate,
  reference,
  outputOf: (s) => s.result,
  info,
  legendLabels: { current: "slow", active: "fast", visited: "fast's middle hop" },
};

export default algorithm;
