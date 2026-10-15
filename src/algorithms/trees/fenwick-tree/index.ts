import type { AlgorithmModule, Highlight, Step } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { ai, numbersField, randomNumbers } from "../../_shared/array";
import { tn, type TreeState, type TreeView } from "../../_shared/tree";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  nums: number[];
  ops: string[];
}

/** "sum:1-4" or "add:2=3". */
function parseBit(tok: string): { op: "sum"; l: number; r: number } | { op: "add"; i: number; d: number } {
  const [op, rest] = tok.split(":");
  if (op === "sum") {
    const [l, r] = rest.split("-").map(Number);
    return { op, l, r };
  }
  const [i, d] = rest.split("=").map(Number);
  return { op: "add", i, d };
}

const lowbit = (i: number) => i & -i;

function* generate({ nums, ops }: Input) {
  const t = new Tracer<TreeState>();
  const n = nums.length;
  const a = nums.map(() => 0); // the values the tree currently represents
  const bit = Array(n + 1).fill(0);
  const answers: number[] = [];
  let opIdx = -1;

  /** Query tree: parent(i) = i − lowbit(i), node 0 is the root. */
  const view = (): TreeView => {
    const children: TreeView["children"] = {};
    for (let i = 1; i <= n; i++) (children[i - lowbit(i)] ??= []).push(i);
    return {
      name: "Fenwick tree (parent of i = i − lowbit(i))",
      root: 0,
      nodes: [{ id: 0, label: "0", sub: "root" }, ...Array.from({ length: n }, (_, k) => ({ id: k + 1, label: String(bit[k + 1]), sub: `#${k + 1} (${k + 1 - lowbit(k + 1) + 1}..${k + 1})` }))],
      children,
    };
  };
  // Answers so far are the result (class code has no "done" line), so every step carries them.
  const snap = (line: string, msg: string, extra: Highlight[] = [], vars: Record<string, unknown> = {}): Step<TreeState> =>
    t.step(line, msg, {
      state: {
        trees: [view()],
        array: {
          rows: [
            { label: "nums", values: a.slice() },
            { label: "tree[1..n]", values: bit.slice(1) },
            { label: "answers", values: answers.length ? answers.slice() : [""], hideIndex: true },
          ],
        },
        result: { answers: answers.slice(), nums: a.slice() },
      },
      vars: { op: opIdx < 0 ? "build" : ops[opIdx], ...vars },
      aux: ops.length ? [{ label: "operations", kind: "list" as const, items: ops, highlight: opIdx < 0 ? [] : [opIdx] }] : undefined,
      highlights: extra,
    });

  function* add(i: number, d: number): Generator<Step<TreeState>, void, unknown> {
    a[i] += d;
    for (let j = i + 1; j <= n; j += lowbit(j)) {
      bit[j] += d;
      t.count("writes");
      yield snap(
        "add-step",
        `tree[${j}] += ${d} → ${bit[j]} (it covers ${j - lowbit(j) + 1}..${j}, which contains position ${i + 1}). Next: ${j} + lowbit(${j}) = ${j} + ${lowbit(j)} = ${j + lowbit(j)}${j + lowbit(j) > n ? ` > ${n}, stop` : ""}.`,
        [...hl("active", tn(j)), ...hl("active", ai(j - 1, 1)), ...hl("current", ai(i))],
        { i: j, lowbit: lowbit(j) },
      );
    }
  }

  function* prefix(i: number): Generator<Step<TreeState>, number, unknown> {
    let s = 0;
    const used: number[] = [];
    for (let j = i + 1; j > 0; j -= lowbit(j)) {
      s += bit[j];
      used.push(j);
      t.count("accesses");
      yield snap(
        "sum-step",
        `prefix(${i}): add tree[${j}] = ${bit[j]} (positions ${j - lowbit(j) + 1}..${j}) → s = ${s}. Next: ${j} − ${lowbit(j)} = ${j - lowbit(j)}${j - lowbit(j) === 0 ? ", done" : ""}.`,
        [...hl("found", ...used.map(tn)), ...hl("found", ...used.map((u) => ai(u - 1, 1)))],
        { i: j, s },
      );
    }
    return s;
  }

  yield snap("build", `Start with an all-zero tree; add each of the ${n} values.`);
  for (let i = 0; i < n; i++) {
    yield snap("build", `add(${i}, ${nums[i]}).`, hl("current", ai(i)));
    yield* add(i, nums[i]);
  }
  for (const [k, tok] of ops.entries()) {
    opIdx = k;
    const o = parseBit(tok);
    if (o.op === "add") {
      yield snap("add-step", `nums[${o.i}] += ${o.d}: update every block that contains position ${o.i + 1}.`, hl("current", ai(o.i)));
      yield* add(o.i, o.d);
    } else {
      yield snap("range", `sum(${o.l}..${o.r}) = prefix(${o.r}) − prefix(${o.l - 1}).`);
      const right = yield* prefix(o.r);
      const left = o.l > 0 ? yield* prefix(o.l - 1) : 0;
      answers.push(right - left);
      yield snap("range", `${right} − ${left} = ${right - left}.`, hl("found", ai(answers.length - 1, 2)));
    }
  }
}

const BIT_RE = /^(sum:\d{1,2}-\d{1,2}|add:\d{1,2}=-?\d{1,2})$/;

const algorithm: AlgorithmModule<Input, TreeState> = {
  ...meta,
  renderer: "tree",
  inputSchema: {
    fields: [
      numbersField("nums", "nums", { minLength: 1, maxLength: 8 }),
      { key: "ops", label: "operations", kind: "words", maxLength: 5, pattern: BIT_RE, patternHint: "must be sum:l-r or add:i=delta" },
    ],
    validate: ({ nums, ops }) => {
      for (const tok of ops) {
        const o = parseBit(tok);
        if (o.op === "sum" && !(o.l <= o.r && o.r < nums.length)) return `${tok}: need 0 ≤ l ≤ r < ${nums.length}.`;
        if (o.op === "add" && o.i >= nums.length) return `${tok}: index must be below ${nums.length}.`;
      }
      return null;
    },
  },
  presets: [
    { name: "Eight values: query, update, query", input: { nums: [3, 2, -1, 6, 5, 4, -3, 3], ops: ["sum:0-6", "add:3=2", "sum:2-5"] } },
    { name: "Powers of two (blocks are easy to see)", input: { nums: [1, 1, 1, 1, 1, 1, 1, 1], ops: ["sum:0-7", "sum:4-6"] } },
    { name: "Edge case: one value", input: { nums: [5], ops: ["sum:0-0", "add:0=-5", "sum:0-0"] } },
    { name: "Build only", input: { nums: [4, 0, 2, 7, 1], ops: [] } },
  ],
  randomInput: (size, rng = Math.random) => {
    const nums = randomNumbers(rng, size, -5, 9, 8);
    const ops = Array.from({ length: randInt(rng, 0, 3) }, () => {
      if (rng() < 0.6) {
        const l = randInt(rng, 0, nums.length - 1);
        return `sum:${l}-${randInt(rng, l, nums.length - 1)}`;
      }
      return `add:${randInt(rng, 0, nums.length - 1)}=${randInt(rng, -5, 9)}`;
    });
    return { nums, ops };
  },
  code: { python, javascript },
  generate,
  reference: ({ nums, ops }) => {
    const a = nums.slice();
    const answers: number[] = [];
    for (const tok of ops) {
      const o = parseBit(tok);
      if (o.op === "sum") answers.push(a.slice(o.l, o.r + 1).reduce((x, y) => x + y, 0));
      else a[o.i] += o.d;
    }
    return { answers, nums: a };
  },
  outputOf: (s) => s.result,
  info,
  legendLabels: { current: "Position being changed", active: "Block updated", found: "Block added to the sum" },
};

export default algorithm;
