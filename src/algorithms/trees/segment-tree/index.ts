import type { AlgorithmModule, Frame, Highlight, Step } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { ai, numbersField, randomNumbers, range } from "../../_shared/array";
import { tn, type TreeState, type TreeView } from "../../_shared/tree";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  nums: number[];
  ops: string[];
}

/** "sum:1-4" or "set:2=7". */
function parseSeg(tok: string): { op: "sum"; l: number; r: number } | { op: "set"; i: number; val: number } {
  const [op, rest] = tok.split(":");
  if (op === "sum") {
    const [l, r] = rest.split("-").map(Number);
    return { op, l, r };
  }
  const [i, val] = rest.split("=").map(Number);
  return { op: "set", i, val };
}

function* generate({ nums, ops }: Input) {
  const t = new Tracer<TreeState>();
  const n = nums.length;
  const a = nums.slice();
  const tree = new Map<number, number>(); // node k -> sum (only nodes built so far)
  const span = new Map<number, [number, number]>();
  const frames: Frame[] = [];
  const answers: number[] = [];
  let opIdx = -1;
  let rangeHl: [number, number] | null = null;

  const view = (): TreeView => {
    const children: TreeView["children"] = {};
    for (const k of tree.keys()) if (tree.has(2 * k)) children[k] = [2 * k, tree.has(2 * k + 1) ? 2 * k + 1 : null];
    return {
      name: "segment tree (value = sum of its range)",
      root: tree.has(1) ? 1 : null,
      nodes: [...tree.keys()].map((k) => ({ id: k, label: String(tree.get(k)), sub: `[${span.get(k)![0]}..${span.get(k)![1]}]` })),
      children,
    };
  };
  // Answers so far are the result (class code has no "done" line), so every step carries them.
  const snap = (line: string, msg: string, extra: Highlight[] = []): Step<TreeState> =>
    t.step(line, msg, {
      state: {
        trees: [view()],
        array: {
          rows: [
            { label: "nums", values: a.slice() },
            { label: "answers", values: answers.length ? answers.slice() : [""], hideIndex: true },
          ],
          ranges: rangeHl ? [{ from: rangeHl[0], to: rangeHl[1], kind: "window", label: `[${rangeHl[0]}..${rangeHl[1]}]` }] : [],
        },
        result: { answers: answers.slice(), nums: a.slice() },
      },
      vars: { op: opIdx < 0 ? "build" : ops[opIdx] },
      callStack: frames.map((f) => ({ ...f })),
      aux: ops.length ? [{ label: "operations", kind: "list" as const, items: ops, highlight: opIdx < 0 ? [] : [opIdx] }] : undefined,
      highlights: extra,
    });
  const cells = (lo: number, hi: number) => range(hi - lo + 1).map((d) => ai(lo + d));

  function* build(k: number, lo: number, hi: number): Generator<Step<TreeState>, void, unknown> {
    frames.push({ call: `build(${k}, ${lo}, ${hi})` });
    t.count("calls");
    span.set(k, [lo, hi]);
    if (lo === hi) {
      tree.set(k, a[lo]);
      t.count("writes");
      yield snap("build-leaf", `Node ${k} covers just index ${lo}: it stores nums[${lo}] = ${a[lo]}.`, [...hl("found", tn(k)), ...hl("current", ai(lo))]);
      frames.pop();
      return;
    }
    tree.set(k, 0);
    const mid = (lo + hi) >> 1;
    yield snap("build", `Node ${k} covers [${lo}..${hi}]: build its halves [${lo}..${mid}] and [${mid + 1}..${hi}] first.`, [...hl("current", tn(k)), ...hl("window", ...cells(lo, hi))]);
    yield* build(2 * k, lo, mid);
    yield* build(2 * k + 1, mid + 1, hi);
    tree.set(k, tree.get(2 * k)! + tree.get(2 * k + 1)!);
    t.count("writes");
    yield snap("build-sum", `Node ${k} = ${tree.get(2 * k)} + ${tree.get(2 * k + 1)} = ${tree.get(k)} (sum of [${lo}..${hi}]).`, hl("found", tn(k), tn(2 * k), tn(2 * k + 1)));
    frames.pop();
  }

  function* query(k: number, lo: number, hi: number, l: number, r: number): Generator<Step<TreeState>, number, unknown> {
    frames.push({ call: `query(${k}, ${lo}, ${hi})` });
    t.count("calls");
    if (r < lo || hi < l) {
      yield snap("q-none", `Node ${k} [${lo}..${hi}] doesn't overlap [${l}..${r}]: contributes 0.`, hl("pruned", tn(k)));
      frames.pop();
      return 0;
    }
    if (l <= lo && hi <= r) {
      yield snap("q-full", `Node ${k} [${lo}..${hi}] lies fully inside [${l}..${r}]: use its stored sum ${tree.get(k)} — no need to go deeper.`, [...hl("found", tn(k)), ...hl("found", ...cells(lo, hi))]);
      frames.pop();
      return tree.get(k)!;
    }
    const mid = (lo + hi) >> 1;
    yield snap("q-split", `Node ${k} [${lo}..${hi}] overlaps [${l}..${r}] only partly: ask both halves.`, hl("compare", tn(k)));
    const x = yield* query(2 * k, lo, mid, l, r);
    const y = yield* query(2 * k + 1, mid + 1, hi, l, r);
    t.count("comparisons");
    yield snap("q-combine", `Node ${k}: ${x} + ${y} = ${x + y}.`, hl("current", tn(k)));
    frames.pop();
    return x + y;
  }

  function* update(k: number, lo: number, hi: number, i: number, val: number): Generator<Step<TreeState>, void, unknown> {
    frames.push({ call: `update(${k}, ${lo}, ${hi})` });
    t.count("calls");
    if (lo === hi) {
      a[i] = val;
      tree.set(k, val);
      t.count("writes");
      yield snap("u-leaf", `Reached the leaf for index ${i}: set it to ${val}.`, [...hl("swap", tn(k)), ...hl("swap", ai(i))]);
      frames.pop();
      return;
    }
    const mid = (lo + hi) >> 1;
    const left = i <= mid;
    yield snap("u-call", `Node ${k} [${lo}..${hi}]: index ${i} is in the ${left ? "left" : "right"} half.`, hl("compare", tn(k)));
    if (left) yield* update(2 * k, lo, mid, i, val);
    else yield* update(2 * k + 1, mid + 1, hi, i, val);
    const old = tree.get(k);
    tree.set(k, tree.get(2 * k)! + tree.get(2 * k + 1)!);
    t.count("writes");
    yield snap("u-sum", `Recompute node ${k}: ${tree.get(2 * k)} + ${tree.get(2 * k + 1)} = ${tree.get(k)} (was ${old}).`, hl("active", tn(k)));
    frames.pop();
  }

  yield* build(1, 0, n - 1);
  for (const [k, tok] of ops.entries()) {
    opIdx = k;
    const o = parseSeg(tok);
    if (o.op === "sum") {
      rangeHl = [o.l, o.r];
      yield snap("q-call", `Query the sum of nums[${o.l}..${o.r}], starting at the root.`);
      const s = yield* query(1, 0, n - 1, o.l, o.r);
      answers.push(s);
      yield snap("q-combine", `sum(${o.l}, ${o.r}) = ${s}.`, hl("found", ai(answers.length - 1, 1)));
      rangeHl = null;
    } else {
      yield snap("u-call", `Set nums[${o.i}] = ${o.val}: walk down to its leaf, then fix the sums on the way back up.`, hl("current", ai(o.i)));
      yield* update(1, 0, n - 1, o.i, o.val);
    }
  }
}

const SEG_RE = /^(sum:\d{1,2}-\d{1,2}|set:\d{1,2}=-?\d{1,2})$/;

const algorithm: AlgorithmModule<Input, TreeState> = {
  ...meta,
  renderer: "tree",
  inputSchema: {
    fields: [
      numbersField("nums", "nums", { minLength: 1, maxLength: 8 }),
      { key: "ops", label: "operations", kind: "words", maxLength: 6, pattern: SEG_RE, patternHint: "must be sum:l-r or set:i=value" },
    ],
    validate: ({ nums, ops }) => {
      for (const tok of ops) {
        const o = parseSeg(tok);
        if (o.op === "sum" && !(o.l <= o.r && o.r < nums.length)) return `${tok}: need 0 ≤ l ≤ r < ${nums.length}.`;
        if (o.op === "set" && o.i >= nums.length) return `${tok}: index must be below ${nums.length}.`;
      }
      return null;
    },
  },
  presets: [
    { name: "LeetCode example: sum, update, sum", input: { nums: [1, 3, 5], ops: ["sum:0-2", "set:1=2", "sum:0-2"] } },
    { name: "Eight values, mixed queries", input: { nums: [2, 7, 1, 8, 2, 8, 1, 8], ops: ["sum:2-5", "set:3=0", "sum:0-7", "sum:4-4"] } },
    { name: "Edge case: one value", input: { nums: [5], ops: ["sum:0-0", "set:0=9", "sum:0-0"] } },
    { name: "Build only", input: { nums: [4, -1, 6, 3, 2], ops: [] } },
  ],
  randomInput: (size, rng = Math.random) => {
    const nums = randomNumbers(rng, size, -5, 9, 8);
    const ops = Array.from({ length: randInt(rng, 0, 4) }, () => {
      if (rng() < 0.6) {
        const l = randInt(rng, 0, nums.length - 1);
        return `sum:${l}-${randInt(rng, l, nums.length - 1)}`;
      }
      return `set:${randInt(rng, 0, nums.length - 1)}=${randInt(rng, -5, 9)}`;
    });
    return { nums, ops };
  },
  code: { python, javascript },
  generate,
  reference: ({ nums, ops }) => {
    const a = nums.slice();
    const answers: number[] = [];
    for (const tok of ops) {
      const o = parseSeg(tok);
      if (o.op === "sum") answers.push(a.slice(o.l, o.r + 1).reduce((x, y) => x + y, 0));
      else a[o.i] = o.val;
    }
    return { answers, nums: a };
  },
  outputOf: (s) => s.result,
  info,
  legendLabels: { current: "Current node / index", window: "Range", found: "Used in the answer", pruned: "No overlap", compare: "Partial overlap / path", swap: "Updated leaf", active: "Sum recomputed" },
};

export default algorithm;
