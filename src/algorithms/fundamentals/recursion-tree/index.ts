import type { AlgorithmModule, Frame, Step } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { ai } from "../../_shared/array";
import { DecisionTree, type DecisionState } from "../../_shared/decision";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

type Fn = "fib" | "power" | "fast";

interface Input {
  fn: Fn;
  n: number;
  x: number;
}

interface Result {
  value: number;
  calls: number;
}

const MAX_N: Record<Fn, number> = { fib: 9, power: 16, fast: 30 };
const NAME: Record<Fn, string> = { fib: "fib", power: "power", fast: "fast_power" };

function* generate({ fn, n, x }: Input) {
  const t = new Tracer<DecisionState>();
  const call = (k: number) => (fn === "fib" ? `fib(${k})` : `${NAME[fn]}(${x}, ${k})`);
  const dt = new DecisionTree(`${n}`, call(n), 90);
  const times: number[] = Array(n + 1).fill(0);
  const frames: Frame[] = [];
  let calls = 0;

  const state = (result?: Result): DecisionState => ({
    tree: dt.view(),
    treeTitle: "Recursion tree (n:value once returned)",
    array: {
      rows: [
        { label: "n", values: Array.from({ length: n + 1 }, (_, k) => k) },
        { label: "calls", values: times.slice(), hideIndex: true },
      ],
    },
    caption: `${call(n)} — ${calls} call${calls === 1 ? "" : "s"} so far, stack depth ${frames.length}`,
    result,
  });
  const repeated = () => times.flatMap((c, k) => (c > 1 ? [ai(k, 1)] : []));
  const step = (line: string, message: string, k: number, vars: Record<string, unknown>, result?: Result) =>
    t.step(line, message, {
      state: state(result),
      vars: { n: k, ...vars, calls, depth: frames.length },
      callStack: frames.slice(),
      highlights: [...dt.marks(), ...hl("compare", ...repeated()), ...hl("current", ai(k, 0), ai(k, 1))],
    });

  function* rec(k: number, node: number): Generator<Step<DecisionState>, number> {
    frames.push({ call: call(k) });
    calls++;
    t.count("calls");
    times[k]++;
    let v: number;
    if (fn === "fib") {
      if (k <= 1) {
        v = k;
        dt.relabel(node, `${k}:${v}`, `fib(${k}) = ${v} (base case)`);
        yield step("fib-base", `fib(${k}) is a base case: return ${v}.${times[k] > 1 ? ` (call number ${times[k]} for n = ${k})` : ""}`, k, { result: v });
      } else {
        yield step("fib-call", `fib(${k}) = fib(${k - 1}) + fib(${k - 2}). First recurse into fib(${k - 1}).${times[k] > 1 ? ` fib(${k}) is being computed for the ${times[k]}${times[k] === 2 ? "nd" : times[k] === 3 ? "rd" : "th"} time!` : ""}`, k, {});
        const a = dt.child(`${k - 1}`, `fib(${k - 1})`, node);
        dt.enter(a);
        const va = yield* rec(k - 1, a);
        dt.finish("done", a);
        yield step("fib-call2", `fib(${k - 1}) returned ${va}. Now the second branch: fib(${k - 2}).`, k, { a: va });
        const b = dt.child(`${k - 2}`, `fib(${k - 2})`, node);
        dt.enter(b);
        const vb = yield* rec(k - 2, b);
        dt.finish("done", b);
        v = va + vb;
        dt.relabel(node, `${k}:${v}`, `fib(${k}) = ${v}`);
        yield step("fib-ret", `fib(${k}) = ${va} + ${vb} = ${v}. Return to the caller.`, k, { a: va, b: vb, result: v });
      }
    } else if (fn === "power") {
      if (k === 0) {
        v = 1;
        dt.relabel(node, `0:1`, `power(${x}, 0) = 1`);
        yield step("pn-base", `power(${x}, 0) = 1: the base case, at depth ${frames.length}.`, k, { result: v });
      } else {
        yield step("pn-call", `power(${x}, ${k}) = ${x} × power(${x}, ${k - 1}): one call, but only one smaller.`, k, {});
        const c = dt.child(`${k - 1}`, call(k - 1), node);
        dt.enter(c);
        const rest = yield* rec(k - 1, c);
        dt.finish("done", c);
        v = x * rest;
        dt.relabel(node, `${k}:${v}`, `power(${x}, ${k}) = ${v}`);
        yield step("pn-ret", `power(${x}, ${k}) = ${x} × ${rest} = ${v}.`, k, { rest, result: v });
      }
    } else {
      if (k === 0) {
        v = 1;
        dt.relabel(node, `0:1`, `fast_power(${x}, 0) = 1`);
        yield step("pf-base", `fast_power(${x}, 0) = 1: the base case, reached at depth ${frames.length}.`, k, { result: v });
      } else {
        const h = Math.floor(k / 2);
        yield step("pf-call", `fast_power(${x}, ${k}) only needs fast_power(${x}, ${h}) — n halves, so the chain is short.`, k, {});
        const c = dt.child(`${h}`, call(h), node);
        dt.enter(c);
        const half = yield* rec(h, c);
        dt.finish("done", c);
        const odd = k % 2 === 1;
        v = half * half * (odd ? x : 1);
        dt.relabel(node, `${k}:${v}`, `fast_power(${x}, ${k}) = ${v}`);
        yield step(
          odd ? "pf-odd" : "pf-even",
          odd ? `${k} is odd: ${half} × ${half} × ${x} = ${v}.` : `${k} is even: ${half} × ${half} = ${v}.`,
          k,
          { half, result: v },
        );
      }
    }
    frames.pop();
    return v;
  }

  const value = yield* rec(n, 0);
  dt.found(0);
  const growth =
    fn === "fib"
      ? n <= 1
        ? `A base case: a single call. Try a bigger n to see the tree branch.`
        : `The tree has ${calls} nodes — it roughly doubles with each n (O(2ⁿ), more precisely O(1.618ⁿ)) because the same subproblems are solved again and again (orange counts). Memoising fixes that.`
      : fn === "power"
        ? `${calls} calls in a single chain: O(n) time and O(n) stack depth.`
        : `${calls} calls: n is halved each time, so O(log n) time and depth.`;
  yield t.step(fn === "fib" ? "fib-ret" : fn === "power" ? "pn-ret" : n % 2 ? "pf-odd" : n === 0 ? "pf-base" : "pf-even", `${call(n)} = ${value}. ${growth}`, {
    state: state({ value, calls }),
    vars: { result: value, calls },
    callStack: [],
    highlights: [...dt.marks(), ...hl("compare", ...repeated())],
  });
}

function reference({ fn, n, x }: Input): Result {
  if (fn === "fib") {
    // fib(k) needs calls(k) = 1 + calls(k − 1) + calls(k − 2) calls.
    const f = [0, 1];
    const c = [1, 1];
    for (let k = 2; k <= n; k++) {
      f[k] = f[k - 1] + f[k - 2];
      c[k] = 1 + c[k - 1] + c[k - 2];
    }
    return { value: f[n], calls: c[n] };
  }
  if (fn === "power") return { value: x ** n, calls: n + 1 };
  let calls = 1;
  for (let k = n; k > 0; k = Math.floor(k / 2)) calls++;
  return { value: x ** n, calls };
}

const algorithm: AlgorithmModule<Input, DecisionState> = {
  ...meta,
  renderer: "decisiontree",
  inputSchema: {
    fields: [
      {
        key: "fn",
        label: "function",
        kind: "select",
        options: [
          { value: "fib", label: "fib(n) — two calls" },
          { value: "power", label: "power(x, n) — x · xⁿ⁻¹" },
          { value: "fast", label: "fast_power(x, n) — halve n" },
        ],
      },
      { key: "n", label: "n", kind: "number", integer: true, min: 0, max: 30, help: "fib: n ≤ 9 · power: n ≤ 16 · fast_power: n ≤ 30" },
      { key: "x", label: "x", kind: "number", integer: true, min: 2, max: 3, help: "Base for the power functions (ignored by fib)." },
    ],
    validate: ({ fn, n }) => (n > MAX_N[fn] ? `${NAME[fn]} is limited to n ≤ ${MAX_N[fn]} here (the tree gets too big to draw).` : null),
  },
  presets: [
    { name: "fib(5): repeated work", input: { fn: "fib", n: 5, x: 2 } },
    { name: "Edge case: fib(1)", input: { fn: "fib", n: 1, x: 2 } },
    { name: "Worst: fib(8)", input: { fn: "fib", n: 8, x: 2 } },
    { name: "power(2, 10): a chain", input: { fn: "power", n: 10, x: 2 } },
    { name: "fast_power(2, 10): log depth", input: { fn: "fast", n: 10, x: 2 } },
    { name: "fast_power(3, 19): odd steps", input: { fn: "fast", n: 19, x: 3 } },
  ],
  randomInput: (size, rng = Math.random) => {
    const fn = (["fib", "power", "fast"] as const)[randInt(rng, 0, 2)];
    return { fn, n: randInt(rng, 0, Math.min(MAX_N[fn], size + 2)), x: randInt(rng, 2, 3) };
  },
  code: { python, javascript },
  generate,
  reference,
  outputOf: (s) => s.result,
  info,
  legendLabels: { compare: "n computed more than once", active: "Current call path", visited: "Returned call", found: "Final answer", current: "Running call" },
};

export default algorithm;
