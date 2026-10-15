import type { AlgorithmModule, Frame, Highlight, Step } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { DecisionTree, dn } from "../../_shared/decision";
import { tc, type DPState } from "../../_shared/dp";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

type Mode = "rec" | "memo" | "table" | "vars";

interface Input {
  n: number;
  mode: Mode;
}

const FORMULA = "ways(n) = ways(n−1) + ways(n−2),   ways(0) = ways(1) = 1";
const LIMIT: Record<Mode, number> = { rec: 7, memo: 10, table: 15, vars: 15 };

function* recursive(n: number, memoised: boolean) {
  const t = new Tracer<DPState>();
  const dt = new DecisionTree(`${n}`, `ways(${n})`, 90);
  const ks = Array.from({ length: n + 1 }, (_, k) => k);
  const times: number[] = Array(n + 1).fill(0);
  const memo: (number | null)[] = Array(n + 1).fill(null);
  const repeats: number[] = [];
  const hits: number[] = [];
  const frames: Frame[] = [];
  const p = memoised ? "m" : "r";

  const state = (result?: number): DPState => ({
    formula: FORMULA,
    tree: dt.view(),
    treeTitle: memoised ? "Call tree (green = cache hit)" : "Call tree (orange = repeated work)",
    table: memoised
      ? { rows: [ks, memo], rowLabels: ["n", "memo[n]"] }
      : { rows: [ks, times], rowLabels: ["n", "times computed"] },
    result,
  });
  const marks = (): Highlight[] => [...dt.marks(), ...hl("compare", ...repeats.map(dn)), ...hl("match", ...hits.map(dn))];

  function* call(k: number, node: number): Generator<Step<DPState>, number> {
    frames.push({ call: memoised ? `climb_memo(${k})` : `climb_rec(${k})` });
    t.count("calls");
    if (k <= 1) {
      dt.relabel(node, `${k}:1`, `ways(${k}) = 1 (base case)`);
      yield t.step(`${p}-base`, `ways(${k}) is a base case: 1 way.`, { state: state(), vars: { n: k, calls: t.counters.calls }, callStack: frames, highlights: [...marks(), ...hl("current", tc(0, k))] });
      frames.pop();
      return 1;
    }
    if (memoised && memo[k] !== null) {
      hits.push(node);
      dt.relabel(node, `${k}:${memo[k]}`, `ways(${k}) = ${memo[k]} from the memo`);
      yield t.step("m-hit", `ways(${k}) is already in the memo: return ${memo[k]} without recursing.`, {
        state: state(),
        vars: { n: k, calls: t.counters.calls },
        callStack: frames,
        highlights: [...marks(), ...hl("found", tc(1, k))],
      });
      frames.pop();
      return memo[k]!;
    }
    times[k]++;
    if (!memoised && times[k] > 1) repeats.push(node);
    yield t.step(memoised ? "m-store" : "r-call", `ways(${k}) = ways(${k - 1}) + ways(${k - 2})${!memoised && times[k] > 1 ? ` — computing ways(${k}) for the ${times[k] === 2 ? "2nd" : times[k] === 3 ? "3rd" : `${times[k]}th`} time!` : ""}. Recurse into ways(${k - 1}).`, {
      state: state(),
      vars: { n: k, calls: t.counters.calls },
      callStack: frames,
      highlights: [...marks(), ...hl("current", tc(0, k))],
    });
    const a = dt.child(`${k - 1}`, `ways(${k - 1})`, node);
    dt.enter(a);
    const va = yield* call(k - 1, a);
    dt.finish("done", a);
    const b = dt.child(`${k - 2}`, `ways(${k - 2})`, node);
    dt.enter(b);
    const vb = yield* call(k - 2, b);
    dt.finish("done", b);
    const v = va + vb;
    if (memoised) memo[k] = v;
    dt.relabel(node, `${k}:${v}`, `ways(${k}) = ${v}`);
    yield t.step(memoised ? "m-store" : "r-call", `ways(${k}) = ${va} + ${vb} = ${v}${memoised ? `; store memo[${k}] = ${v}` : ""}. Return.`, {
      state: state(),
      vars: { n: k, value: v, calls: t.counters.calls },
      callStack: frames,
      highlights: [...marks(), ...hl("found", tc(memoised ? 1 : 0, k))],
    });
    frames.pop();
    return v;
  }

  const v = yield* call(n, 0);
  dt.found(0);
  yield t.step(`${p}-${memoised ? "store" : "call"}`, memoised ? `ways(${n}) = ${v} with ${t.counters.calls} calls — every n was computed once, the rest were cache hits.` : `ways(${n}) = ${v}, but it took ${t.counters.calls} calls: smaller n were recomputed (see "times computed").`, {
    state: state(v),
    vars: { result: v, calls: t.counters.calls },
    callStack: [],
    highlights: marks(),
  });
}

function* table(n: number) {
  const t = new Tracer<DPState>();
  const dp: (number | null)[] = Array(n + 1).fill(null);
  const ks = Array.from({ length: n + 1 }, (_, k) => k);
  const state = (arrows: DPState["arrows"] = [], result?: number): DPState => ({ formula: "dp[i] = dp[i−1] + dp[i−2]", table: { rows: [ks, dp], rowLabels: ["i", "dp[i]"] }, arrows, result });
  dp[0] = 1;
  if (n >= 1) dp[1] = 1;
  yield t.step("t-init", `Base cases: dp[0] = dp[1] = 1. Everything else is filled left to right.`, { state: state(), vars: { n }, highlights: hl("found", tc(1, 0), tc(1, 1)) });
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1]! + dp[i - 2]!;
    t.count("writes");
    yield t.step("t-fill", `dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}. Both inputs were filled earlier.`, {
      state: state([
        { from: [1, i - 1], to: [1, i] },
        { from: [1, i - 2], to: [1, i] },
      ]),
      vars: { i, "dp[i]": dp[i] },
      highlights: [...hl("compare", tc(1, i - 1), tc(1, i - 2)), ...hl("current", tc(1, i))],
    });
  }
  yield t.step("t-done", `dp[${n}] = ${dp[n]}: ${n} additions, no recursion.`, { state: state([], dp[n]!), vars: { result: dp[n] }, highlights: hl("found", tc(1, n)) });
}

function* vars(n: number) {
  const t = new Tracer<DPState>();
  let a = 1;
  let b = 1;
  const state = (i: number, result?: number): DPState => ({
    formula: "(a, b) ← (b, a + b)",
    table: { rows: [["ways(i−2)", "ways(i−1)"], [a, b]], rowLabels: ["", `i = ${i}`] },
    result,
  });
  yield t.step("v-init", "a = ways(0) = 1, b = ways(1) = 1. Only these two numbers are kept.", { state: state(1), vars: { a, b } });
  for (let i = 2; i <= n; i++) {
    [a, b] = [b, a + b];
    t.count("writes");
    yield t.step("v-step", `i = ${i}: slide forward — a = old b, b = old a + old b = ${b}. b is now ways(${i}).`, { state: state(i), vars: { i, a, b }, highlights: hl("current", tc(1, 1)) });
  }
  yield t.step("v-done", `Return b = ways(${n}) = ${b} using O(1) memory.`, { state: state(n, b), vars: { result: b }, highlights: hl("found", tc(1, 1)) });
}

function generate({ n, mode }: Input) {
  if (mode === "rec") return recursive(n, false);
  if (mode === "memo") return recursive(n, true);
  if (mode === "table") return table(n);
  return vars(n);
}

function reference({ n }: Input): number {
  let a = 1;
  let b = 1;
  for (let i = 2; i <= n; i++) [a, b] = [b, a + b];
  return b;
}

const algorithm: AlgorithmModule<Input, DPState> = {
  ...meta,
  renderer: "dptable",
  inputSchema: {
    fields: [
      { key: "n", label: "n (stairs)", kind: "number", integer: true, min: 1, max: 15 },
      {
        key: "mode",
        label: "View",
        kind: "select",
        options: [
          { value: "rec", label: "1. Plain recursion (tree)" },
          { value: "memo", label: "2. Memoisation" },
          { value: "table", label: "3. Tabulation" },
          { value: "vars", label: "4. Two variables" },
        ],
      },
    ],
    validate: ({ n, mode }) => (n > LIMIT[mode] ? `This view supports n ≤ ${LIMIT[mode]} (the recursion tree grows exponentially).` : null),
  },
  presets: [
    { name: "1. Recursion tree, n = 5", input: { n: 5, mode: "rec" } },
    { name: "2. Memoisation, n = 5", input: { n: 5, mode: "memo" } },
    { name: "3. Tabulation, n = 5", input: { n: 5, mode: "table" } },
    { name: "4. Two variables, n = 5", input: { n: 5, mode: "vars" } },
    { name: "Recursion blow-up: n = 7 (41 calls)", input: { n: 7, mode: "rec" } },
    { name: "Edge case: n = 1", input: { n: 1, mode: "table" } },
  ],
  randomInput: (size, rng = Math.random) => {
    const mode = (["rec", "memo", "table", "vars"] as Mode[])[randInt(rng, 0, 3)];
    return { n: randInt(rng, 1, Math.min(LIMIT[mode], Math.max(1, size))), mode };
  },
  code: { python, javascript },
  generate,
  reference,
  outputOf: (state) => state.result,
  info,
  legendLabels: { compare: "Repeated work / read", match: "Cache hit", found: "Known value", current: "Being computed", active: "Current call path", visited: "Returned call" },
};

export default algorithm;
