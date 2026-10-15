import type { AlgorithmModule } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { ai, numbersField, range, type ArrayState, type CellValue } from "../../_shared/array";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  nums: number[];
  k: number;
}

function* generate({ nums, k }: Input) {
  const t = new Tracer<ArrayState>();
  const n = nums.length;
  const hi = Math.max(...nums) + 1;
  const buckets: number[][] = Array.from({ length: k }, () => []);
  const which: CellValue[] = Array(n).fill(null);
  const out: CellValue[] = Array(n).fill(null);
  let filled = 0;
  const lo = (b: number) => Math.ceil((b * hi) / k);
  const rangeText = (b: number) => (lo(b + 1) - 1 < lo(b) ? "(no integers)" : `[${lo(b)}..${lo(b + 1) - 1}]`);

  const state = (result?: number[]): ArrayState => ({
    rows: [
      { label: "nums", values: nums },
      { label: "bucket #", values: which.slice(), hideIndex: true },
      { label: "out", values: out.slice() },
    ],
    caption: `${k} buckets over [0, ${hi}) — each covers about ${(hi / k).toFixed(1)} values`,
    result,
  });
  const aux = (hot?: number) => [
    {
      label: "buckets",
      kind: "map" as const,
      items: buckets.map((b, i) => [`${i} ${rangeText(i)}`, b]),
      highlight: hot === undefined ? undefined : [hot],
    },
  ];

  yield t.step("init", `Create ${k} empty buckets. Value x goes to bucket x·${k} // ${hi}.`, { state: state(), vars: { k, hi }, aux: aux() });

  for (let i = 0; i < n; i++) {
    const x = nums[i];
    const b = Math.floor((x * k) / hi);
    buckets[b].push(x);
    which[i] = b;
    t.count("writes");
    yield t.step("scatter", `${x} · ${k} // ${hi} = ${b}: drop ${x} into bucket ${b} ${rangeText(b)}.`, {
      state: state(),
      vars: { x, bucket: b },
      aux: aux(b),
      highlights: [...hl("visited", ...range(i).map((j) => ai(j))), ...hl("current", ai(i), ai(i, 1))],
    });
  }

  for (let b = 0; b < k; b++) {
    if (!buckets[b].length) continue;
    const before = buckets[b].slice();
    buckets[b].sort((p, q) => p - q);
    t.count("comparisons", Math.max(0, before.length - 1));
    yield t.step("sort-bucket", before.length === 1 ? `Bucket ${b} holds one value — already sorted.` : `Sort bucket ${b}: [${before.join(", ")}] → [${buckets[b].join(", ")}].`, {
      state: state(),
      vars: { bucket: b, size: buckets[b].length },
      aux: aux(b),
      highlights: hl("sorted", ...range(filled).map((j) => ai(j, 2))),
    });
    const start = filled;
    for (const x of buckets[b]) out[filled++] = x;
    yield t.step("gather", `Append bucket ${b} to the output at positions ${start}..${filled - 1}.`, {
      state: state(),
      vars: { bucket: b, "len(out)": filled },
      aux: aux(b),
      highlights: [...hl("sorted", ...range(start).map((j) => ai(j, 2))), ...hl("found", ...range(filled - start).map((j) => ai(start + j, 2)))],
    });
  }

  const biggest = Math.max(...buckets.map((b) => b.length));
  yield t.step("done", `Sorted: [${out.join(", ")}]. Largest bucket held ${biggest} of ${n} values${biggest > Math.ceil(n / 2) ? " — the values were clustered, so most of the work fell to one inner sort" : ""}.`, {
    state: state(out.slice() as number[]),
    vars: { "largest bucket": biggest },
    aux: aux(),
    highlights: hl("sorted", ...range(n).map((j) => ai(j, 2))),
  });
}

const algorithm: AlgorithmModule<Input, ArrayState> = {
  ...meta,
  renderer: "array",
  inputSchema: {
    fields: [numbersField("nums", "nums", { min: 0, max: 99, minLength: 1, maxLength: 14 }), { key: "k", label: "k (number of buckets)", kind: "number", integer: true, min: 1, max: 10 }],
  },
  presets: [
    { name: "Evenly spread values", input: { nums: [42, 32, 33, 52, 37, 47, 51, 5, 81, 66, 18, 93], k: 5 } },
    { name: "Worst case: clustered values", input: { nums: [91, 95, 92, 99, 90, 93, 2, 97], k: 5 } },
    { name: "Edge case: one bucket", input: { nums: [9, 4, 7, 1], k: 1 } },
    { name: "Duplicates", input: { nums: [20, 20, 5, 70, 5, 20], k: 4 } },
  ],
  randomInput: (size, rng = Math.random) => ({ nums: Array.from({ length: Math.max(1, Math.min(14, size + 2)) }, () => randInt(rng, 0, 99)), k: randInt(rng, 1, 6) }),
  code: { python, javascript },
  generate,
  reference: ({ nums }) => nums.slice().sort((a, b) => a - b),
  outputOf: (s) => s.result,
  info,
  legendLabels: { current: "Being scattered", visited: "Scattered", found: "Just gathered", sorted: "Output so far" },
};

export default algorithm;
