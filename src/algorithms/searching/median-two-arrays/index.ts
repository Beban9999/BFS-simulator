import type { AlgorithmModule } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { ai, numbersField, range, sortedNumbers, type ArrayState, type Range } from "../../_shared/array";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  nums1: number[];
  nums2: number[];
}

const fmt = (x: number) => (x === Infinity ? "+∞" : x === -Infinity ? "−∞" : String(x));

function* generate({ nums1, nums2 }: Input) {
  const t = new Tracer<ArrayState>();
  let A = nums1;
  let B = nums2;
  const swapped = A.length > B.length;
  if (swapped) [A, B] = [B, A];
  const m = A.length;
  const n = B.length;
  const half = (m + n + 1) >> 1;
  let lo = 0;
  let hi = m;

  const state = (i: number | null, j: number | null, result?: number): ArrayState => {
    const ranges: Range[] = [];
    if (i !== null && i > 0) ranges.push({ from: 0, to: i - 1, row: 0, kind: "window", label: "left" });
    if (j !== null && j > 0) ranges.push({ from: 0, to: j - 1, row: 1, kind: "window", label: "left" });
    if (i !== null && i < m) ranges.push({ from: i, to: m - 1, row: 0, kind: "active", label: "right" });
    if (j !== null && j < n) ranges.push({ from: j, to: n - 1, row: 1, kind: "active", label: "right" });
    return {
      rows: [
        { label: "A (shorter)", values: A },
        { label: "B", values: B },
      ],
      pointers: i !== null && j !== null ? [{ name: "cut i", index: i, row: 0 }, { name: "cut j", index: j, row: 1 }] : [{ name: "lo", index: lo, row: 0 }, { name: "hi", index: hi, row: 0 }],
      ranges,
      caption: `m + n = ${m + n}, half = ${half} · searching i in [${lo}, ${hi}]`,
      result,
    };
  };

  yield t.step("swap", swapped ? "nums1 is longer, so swap: always binary search the shorter array (A)." : "nums1 is already the shorter array; call it A and nums2 B.", {
    state: state(null, null),
    vars: { m, n, half },
  });

  while (lo <= hi) {
    const i = (lo + hi) >> 1;
    const j = half - i;
    const aL = i > 0 ? A[i - 1] : -Infinity;
    const aR = i < m ? A[i] : Infinity;
    const bL = j > 0 ? B[j - 1] : -Infinity;
    const bR = j < n ? B[j] : Infinity;
    t.count("comparisons", 2);
    const cells = [...(i > 0 ? [ai(i - 1, 0)] : []), ...(i < m ? [ai(i, 0)] : []), ...(j > 0 ? [ai(j - 1, 1)] : []), ...(j < n ? [ai(j, 1)] : [])];
    yield t.step("cut", `Try i = ${i} from A and j = ${half} − ${i} = ${j} from B. Left tops: ${fmt(aL)}, ${fmt(bL)}; right bottoms: ${fmt(aR)}, ${fmt(bR)}.`, {
      state: state(i, j),
      vars: { lo, hi, i, j, a_left: fmt(aL), a_right: fmt(aR), b_left: fmt(bL), b_right: fmt(bR) },
      highlights: hl("compare", ...cells),
    });
    if (aL <= bR && bL <= aR) {
      const odd = (m + n) % 2 === 1;
      const median = odd ? Math.max(aL, bL) : (Math.max(aL, bL) + Math.min(aR, bR)) / 2;
      yield t.step(odd ? "odd" : "even", odd ? `${fmt(aL)} ≤ ${fmt(bR)} and ${fmt(bL)} ≤ ${fmt(aR)}: valid split. Odd total, so the median is max(${fmt(aL)}, ${fmt(bL)}) = ${median}.` : `${fmt(aL)} ≤ ${fmt(bR)} and ${fmt(bL)} ≤ ${fmt(aR)}: valid split. Even total: (max(${fmt(aL)}, ${fmt(bL)}) + min(${fmt(aR)}, ${fmt(bR)})) / 2 = ${median}.`, {
        state: state(i, j, median),
        vars: { i, j, median },
        highlights: [...hl("sorted", ...range(i).map((k) => ai(k, 0)), ...range(j).map((k) => ai(k, 1))), ...hl("found", ...cells)],
      });
      return;
    }
    if (aL > bR) {
      hi = i - 1;
      yield t.step("go-left", `A[i−1] = ${fmt(aL)} > B[j] = ${fmt(bR)}: A contributed too many big values. Move the cut left: hi = ${hi}.`, {
        state: state(i, j),
        vars: { lo, hi },
        highlights: hl("mismatch", ...(i > 0 ? [ai(i - 1, 0)] : []), ...(j < n ? [ai(j, 1)] : [])),
      });
    } else {
      lo = i + 1;
      yield t.step("go-right", `B[j−1] = ${fmt(bL)} > A[i] = ${fmt(aR)}: A contributed too few. Move the cut right: lo = ${lo}.`, {
        state: state(i, j),
        vars: { lo, hi },
        highlights: hl("mismatch", ...(j > 0 ? [ai(j - 1, 1)] : []), ...(i < m ? [ai(i, 0)] : [])),
      });
    }
  }
}

function reference({ nums1, nums2 }: Input): number {
  const all = [...nums1, ...nums2].sort((a, b) => a - b);
  const k = all.length;
  return k % 2 ? all[(k - 1) / 2] : (all[k / 2 - 1] + all[k / 2]) / 2;
}

const algorithm: AlgorithmModule<Input, ArrayState> = {
  ...meta,
  renderer: "array",
  inputSchema: {
    fields: [numbersField("nums1", "nums1 (sorted)", { sorted: true, maxLength: 10 }), numbersField("nums2", "nums2 (sorted)", { sorted: true, maxLength: 10 })],
    validate: ({ nums1, nums2 }) => (nums1.length + nums2.length === 0 ? "At least one array must be non-empty." : null),
  },
  presets: [
    { name: "LeetCode example (odd total)", input: { nums1: [1, 3], nums2: [2] } },
    { name: "LeetCode example (even total)", input: { nums1: [1, 2], nums2: [3, 4] } },
    { name: "Interleaved", input: { nums1: [1, 4, 7, 10, 13], nums2: [2, 3, 5, 8, 9, 11, 12, 15] } },
    { name: "Edge case: one array empty", input: { nums1: [], nums2: [2, 5, 9, 11] } },
  ],
  randomInput: (size, rng = Math.random) => {
    const a = randInt(rng, 0, Math.min(8, size));
    const b = randInt(rng, a === 0 ? 1 : 0, Math.min(8, size + 2));
    return { nums1: a ? sortedNumbers(rng, a, 0, 30) : [], nums2: b ? sortedNumbers(rng, b, 0, 30) : [] };
  },
  code: { python, javascript },
  generate,
  reference,
  outputOf: (s) => s.result,
  info,
  legendLabels: { compare: "Boundary values", mismatch: "Broken condition", found: "Median candidates", sorted: "Combined left half", window: "Left part", active: "Right part" },
};

export default algorithm;
