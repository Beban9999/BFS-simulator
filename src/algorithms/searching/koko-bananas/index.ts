import type { AlgorithmModule } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { ai, numbersField, randomNumbers, range, type ArrayState, type CellValue } from "../../_shared/array";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  piles: number[];
  h: number;
}

const hoursAt = (piles: number[], k: number) => piles.reduce((s, p) => s + Math.ceil(p / k), 0);

function* generate({ piles, h }: Input) {
  const t = new Tracer<ArrayState>();
  const maxPile = Math.max(...piles);
  // Row 1 shows candidate speeds 1..max; index i ↔ speed i + 1.
  const speeds = range(maxPile).map((k) => k + 1);
  const verdict: CellValue[] = Array(maxPile).fill(null);
  let lo = 1;
  let hi = maxPile;
  const state = (mid: number | null, result?: number): ArrayState => ({
    rows: [
      { label: "piles", values: piles },
      { label: "speed k", values: speeds },
      { label: "hours ≤ h?", values: verdict.slice(), hideIndex: true },
    ],
    pointers: [
      { name: "lo", index: lo - 1, row: 1 },
      { name: "hi", index: hi - 1, row: 1 },
      ...(mid !== null ? [{ name: "mid", index: mid - 1, row: 1 }] : []),
    ],
    ranges: [{ from: lo - 1, to: hi - 1, row: 1, kind: "active", label: "[lo, hi]" }],
    caption: `h = ${h} hours`,
    result,
  });
  const out = () => hl("pruned", ...range(maxPile).filter((k) => k + 1 < lo || k + 1 > hi).map((k) => ai(k, 1)));

  yield t.step("init", `Speeds 1..${maxPile} are possible (at ${maxPile}/h every pile takes one hour). Find the slowest speed that finishes in ${h} hours.`, {
    state: state(null),
    vars: { lo, hi, h },
  });

  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    const hrs = hoursAt(piles, mid);
    t.count("calls");
    t.count("accesses", piles.length);
    verdict[mid - 1] = hrs <= h ? `✓${hrs}` : `✗${hrs}`;
    yield t.step("check", `At speed ${mid}: ${piles.map((p) => `⌈${p}/${mid}⌉`).join(" + ")} = ${hrs} hours — ${hrs <= h ? `fits in ${h}` : `more than ${h}`}.`, {
      state: state(mid),
      vars: { lo, hi, mid, "hours(mid)": hrs },
      highlights: [...out(), ...hl(hrs <= h ? "match" : "mismatch", ai(mid - 1, 1), ai(mid - 1, 2))],
    });
    if (hrs <= h) {
      hi = mid;
      yield t.step("go-left", `Speed ${mid} works, so every faster speed works too. The answer is ≤ ${mid}: hi = ${hi}.`, { state: state(null), vars: { lo, hi }, highlights: out() });
    } else {
      lo = mid + 1;
      yield t.step("go-right", `Speed ${mid} is too slow, so every slower speed is too. lo = ${lo}.`, { state: state(null), vars: { lo, hi }, highlights: out() });
    }
  }
  yield t.step("done", `lo == hi: the minimum speed is ${lo} (${hoursAt(piles, lo)} hours).`, {
    state: state(null, lo),
    vars: { answer: lo, hours: hoursAt(piles, lo) },
    highlights: [...out(), ...hl("found", ai(lo - 1, 1))],
  });
}

function reference({ piles, h }: Input): number {
  for (let k = 1; ; k++) if (hoursAt(piles, k) <= h) return k;
}

const algorithm: AlgorithmModule<Input, ArrayState> = {
  ...meta,
  renderer: "array",
  inputSchema: {
    fields: [numbersField("piles", "piles", { min: 1, max: 24, minLength: 1, maxLength: 8 }), { key: "h", label: "h (hours)", kind: "number", integer: true, min: 1, max: 100 }],
    validate: ({ piles, h }) => (h < piles.length ? `h must be at least the number of piles (${piles.length}).` : null),
  },
  presets: [
    { name: "LeetCode example", input: { piles: [3, 6, 7, 11], h: 8 } },
    { name: "Tight deadline", input: { piles: [5, 10, 15, 20], h: 4 } },
    { name: "Lots of time", input: { piles: [12, 7, 9], h: 30 } },
    { name: "Edge case: one pile", input: { piles: [17], h: 5 } },
  ],
  randomInput: (size, rng = Math.random) => {
    const piles = randomNumbers(rng, Math.min(6, Math.max(1, size)), 1, 20, 8);
    return { piles, h: randInt(rng, piles.length, piles.length * 4) };
  },
  code: { python, javascript },
  generate,
  reference,
  outputOf: (s) => s.result,
  info,
  legendLabels: { match: "Feasible (✓)", mismatch: "Too slow (✗)", pruned: "Ruled out", found: "Answer", active: "Candidate range" },
};

export default algorithm;
