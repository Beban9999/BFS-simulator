import type { AlgorithmModule } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { ai, range, type ArrayState } from "../../_shared/array";
import { sortField, sortedCopy, type SortInput } from "../../_shared/sorting";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

const PLACE = ["ones", "tens", "hundreds"];
/** Digit position of exp = 10^p, computed without floating-point logarithms. */
const posOf = (exp: number) => String(exp).length - 1;

function* generate({ nums: input }: SortInput) {
  const t = new Tracer<ArrayState>();
  let nums = input.slice();
  let ids = range(nums.length);
  const max = Math.max(...nums);
  const width = String(max).length;
  const pad = (x: number) => String(x).padStart(width, "0");
  let buckets: { v: number; id: number }[][] = [];

  const state = (exp: number | null, result?: number[]): ArrayState => ({
    rows: [
      { label: "nums", values: nums.map(pad), ids: ids.slice() },
      ...(exp !== null ? [{ label: "digit", values: nums.map((x) => Math.floor(x / exp) % 10), ids: ids.slice(), hideIndex: true }] : []),
    ],
    caption: exp !== null ? `pass for the ${PLACE[posOf(exp)] ?? `10^${posOf(exp)}`} digit (exp = ${exp})` : undefined,
    result,
  });
  const aux = (hot?: number) => [
    {
      label: "buckets (digit → values, in arrival order)",
      kind: "map" as const,
      items: buckets.map((b, d) => [d, b.map((e) => e.v)]),
      highlight: hot === undefined ? undefined : [hot],
    },
  ];

  let exp = 1;
  while (Math.floor(max / exp) > 0) {
    buckets = Array.from({ length: 10 }, () => []);
    yield t.step("pass", `max = ${max} still has a ${PLACE[posOf(exp)] ?? ""} digit: start a pass with 10 empty buckets.`, {
      state: state(exp),
      vars: { exp },
      aux: aux(),
    });
    for (let i = 0; i < nums.length; i++) {
      const d = Math.floor(nums[i] / exp) % 10;
      buckets[d].push({ v: nums[i], id: ids[i] });
      t.count("writes");
      yield t.step("bucket", `${pad(nums[i])} has ${PLACE[posOf(exp)] ?? ""} digit ${d}: append it to bucket ${d}.`, {
        state: state(exp),
        vars: { exp, x: nums[i], digit: d },
        aux: aux(d),
        highlights: [...hl("visited", ...range(i).map((k) => ai(k))), ...hl("current", ai(i), ai(i, 1))],
      });
    }
    const flat = buckets.flat();
    nums = flat.map((e) => e.v);
    ids = flat.map((e) => e.id);
    yield t.step("collect", `Read the buckets back in order 0…9: [${nums.map(pad).join(", ")}]. Now sorted by the last ${posOf(exp) + 1} digit${exp === 1 ? "" : "s"}.`, {
      state: state(exp),
      vars: { exp },
      aux: aux(),
      highlights: hl("found", ...range(nums.length).map((k) => ai(k, 1))),
    });
    exp *= 10;
  }

  yield t.step("done", `No digits left beyond max = ${max}. Sorted: [${nums.join(", ")}].`, {
    state: state(null, nums.slice()),
    vars: { passes: posOf(exp) },
    highlights: hl("sorted", ...range(nums.length).map((k) => ai(k))),
  });
}

const algorithm: AlgorithmModule<SortInput, ArrayState> = {
  ...meta,
  renderer: "array",
  inputSchema: { fields: [sortField({ max: 999, maxLength: 12 })] },
  presets: [
    { name: "Classic example", input: { nums: [170, 45, 75, 90, 802, 24, 2, 66] } },
    { name: "Same last digit (watch stability)", input: { nums: [31, 21, 11, 41, 13, 23] } },
    { name: "Edge case: single digit values", input: { nums: [7, 3, 9, 1, 3] } },
    { name: "Edge case: all zeros", input: { nums: [0, 0, 0] } },
  ],
  randomInput: (size, rng = Math.random) => ({ nums: Array.from({ length: Math.max(1, Math.min(12, size + 2)) }, () => randInt(rng, 0, rng() < 0.5 ? 99 : 999)) }),
  code: { python, javascript },
  generate,
  reference: sortedCopy,
  outputOf: (s) => s.result,
  info,
  legendLabels: { current: "Being bucketed", visited: "Already bucketed", found: "Order after this pass", sorted: "Sorted" },
};

export default algorithm;
