import type { AlgorithmModule } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { ai, range, type ArrayState, type CellValue } from "../../_shared/array";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  n: number;
  updates: number[][];
}

function* generate({ n, updates }: Input) {
  const t = new Tracer<ArrayState>();
  const diff = Array(n + 1).fill(0);
  const result: CellValue[] = Array(n).fill(null);
  const state = (extra: Partial<ArrayState> = {}): ArrayState => ({
    rows: [
      { label: "diff", values: diff.slice() },
      { label: "result", values: result.slice() },
    ],
    ...extra,
  });

  yield t.step("init", `Start with n + 1 = ${n + 1} zero differences (the extra slot absorbs r + 1 = n).`, {
    state: state(),
    vars: { n, updates: updates.length },
  });

  for (let u = 0; u < updates.length; u++) {
    const [l, r, v] = updates[u];
    const ranges = [{ from: l, to: r, kind: "window" as const, label: `+${v} on [${l}..${r}]`, row: 0 }];
    diff[l] += v;
    t.count("writes");
    yield t.step("mark-start", `Update ${u + 1}: add ${v} to [${l}..${r}]. Mark the rise: diff[${l}] += ${v} → ${diff[l]}.`, {
      state: state({ ranges }),
      vars: { l, r, v },
      highlights: hl("current", ai(l)),
    });
    diff[r + 1] -= v;
    t.count("writes");
    yield t.step("mark-end", `Mark the drop right after the range: diff[${r + 1}] −= ${v} → ${diff[r + 1]}. Two writes, whatever the range length.`, {
      state: state({ ranges }),
      vars: { l, r, v },
      highlights: hl("current", ai(r + 1)),
    });
  }

  let running = 0;
  for (let i = 0; i < n; i++) {
    running += diff[i];
    result[i] = running;
    yield t.step("sweep", `running += diff[${i}] (${diff[i]}) → ${running}; result[${i}] = ${running}.`, {
      state: state({ pointers: [{ name: "i", index: i, row: 0 }] }),
      vars: { i, "diff[i]": diff[i], running },
      highlights: [...hl("visited", ...range(i).map((k) => ai(k, 0))), ...hl("current", ai(i, 0), ai(i, 1))],
    });
  }

  yield t.step("done", `Final array after ${updates.length} range update${updates.length === 1 ? "" : "s"}: [${result.join(", ")}].`, {
    state: state({ result: result.slice() }),
    vars: { result: result.slice() },
    highlights: hl("sorted", ...range(n).map((k) => ai(k, 1))),
  });
}

function reference({ n, updates }: Input): number[] {
  const a = Array(n).fill(0);
  for (const [l, r, v] of updates) for (let i = l; i <= r; i++) a[i] += v;
  return a;
}

const algorithm: AlgorithmModule<Input, ArrayState> = {
  ...meta,
  renderer: "array",
  inputSchema: {
    fields: [
      { key: "n", label: "n (array length)", kind: "number", integer: true, min: 1, max: 15 },
      { key: "updates", label: "updates (l r v per line)", kind: "matrix", maxRows: 8, maxCols: 3, min: -50, max: 50 },
    ],
    validate: ({ n, updates }) => {
      for (const u of updates) {
        if (u.length !== 3) return "Each update needs three numbers: l r v.";
        if (u[0] < 0 || u[1] >= n || u[0] > u[1]) return `Update "${u.join(" ")}": need 0 ≤ l ≤ r < ${n}.`;
      }
      return null;
    },
  },
  presets: [
    { name: "LeetCode example", input: { n: 5, updates: [[1, 3, 2], [2, 4, 3], [0, 2, -2]] } },
    { name: "Overlapping bookings", input: { n: 8, updates: [[0, 4, 1], [2, 6, 2], [3, 3, 5], [5, 7, 1]] } },
    { name: "Edge case: whole array", input: { n: 6, updates: [[0, 5, 4]] } },
    { name: "Edge case: no updates", input: { n: 4, updates: [] } },
  ],
  randomInput: (size, rng = Math.random) => {
    const n = Math.max(1, Math.min(15, size));
    const updates = Array.from({ length: randInt(rng, 1, 4) }, () => {
      const a = randInt(rng, 0, n - 1);
      const b = randInt(rng, 0, n - 1);
      return [Math.min(a, b), Math.max(a, b), randInt(rng, -5, 9)];
    });
    return { n, updates };
  },
  code: { python, javascript },
  generate,
  reference,
  outputOf: (s) => s.result,
  info,
  legendLabels: { sorted: "Final value", visited: "Swept" },
  legendExtra: ["window"],
};

export default algorithm;
