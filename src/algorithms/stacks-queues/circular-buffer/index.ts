import type { AlgorithmModule, Highlight } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { pick, randInt } from "../../../engine/random";
import { ai } from "../../_shared/array";
import { Box, parseOp, slotId, type SQItem, type SQState } from "../../_shared/stackqueue";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  k: number;
  ops: string[];
}

type Ret = boolean | number;

function* generate({ k, ops }: Input) {
  const t = new Tracer<SQState>();
  Box.resetIds();
  const buf: (SQItem | null)[] = Array(k).fill(null);
  let head = 0;
  let count = 0;
  const out: Ret[] = [];
  const show = (r: Ret) => (r === true ? "T" : r === false ? "F" : String(r));
  const live = () => new Set(Array.from({ length: count }, (_, i) => (head + i) % k));

  // The returns so far are the answer, so every step carries them (the class has no "done" line).
  const snap = (i: number | null, extra: Highlight[] = [], ptrExtra: { name: string; index: number }[] = []) => {
    const alive = live();
    const stale = buf.map((s, j) => (s && !alive.has(j) ? j : -1)).filter((j) => j >= 0);
    const pointers = count === 0 ? [{ name: "head", index: head }] : [{ name: "front", index: head }, { name: "rear", index: (head + count - 1) % k }];
    return {
      state: {
        array: { rows: [{ label: "returns", values: out.length ? out.map(show) : [""] }] },
        containers: [{ name: `buffer (k = ${k})`, kind: "ring" as const, items: [], slots: buf.slice(), pointers: [...pointers, ...ptrExtra], note: `head = ${head} · count = ${count}` }],
        result: out.slice(),
      },
      vars: { op: i === null ? "—" : ops[i], head, count },
      aux: [{ label: "operations", kind: "list" as const, items: ops, highlight: i === null ? [] : [i] }],
      highlights: [...hl("pruned", ...stale.map((j) => slotId(0, j))), ...hl("visited", ...[...alive].map((j) => slotId(0, j))), ...extra],
    };
  };

  yield t.step("init", `Allocate ${k} slots once. head = 0, count = 0: the queue is empty.`, snap(null));

  for (let i = 0; i < ops.length; i++) {
    const [op, x] = parseOp(ops[i]);
    if (op === "enq") {
      t.count("comparisons");
      if (count === k) {
        out.push(false);
        yield t.step("enq-full", `enQueue(${x}): count = ${count} = k — the ring is full. Return False.`, snap(i, hl("mismatch", ai(out.length - 1))));
        continue;
      }
      const tail = (head + count) % k;
      yield t.step(
        "enq-tail",
        `enQueue(${x}): the free slot is (head + count) % k = (${head} + ${count}) % ${k} = ${tail}${head + count >= k ? " — wrapped around to the start" : ""}.`,
        snap(i, hl("frontier", slotId(0, tail)), [{ name: "tail", index: tail }]),
      );
      buf[tail] = Box.item(x!);
      count++;
      t.count("writes");
      out.push(true);
      yield t.step("enq-write", `Write ${x} into slot ${tail}; count = ${count}. Return True.`, snap(i, [...hl("active", slotId(0, tail)), ...hl("found", ai(out.length - 1))]));
    } else if (op === "deq") {
      t.count("comparisons");
      if (count === 0) {
        out.push(false);
        yield t.step("deq-empty", "deQueue(): count = 0 — nothing to remove. Return False.", snap(i, hl("mismatch", ai(out.length - 1))));
        continue;
      }
      const old = head;
      yield t.step("deq-empty", `deQueue(): count = ${count}, so the front item ${buf[head]!.label} (slot ${head}) can leave.`, snap(i, hl("removed", slotId(0, old))));
      head = (head + 1) % k;
      count--;
      out.push(true);
      yield t.step(
        "deq-move",
        `head = (${old} + 1) % ${k} = ${head}; count = ${count}. Slot ${old} still holds ${buf[old]!.label}, but it is outside the queue now and will be overwritten later. Return True.`,
        snap(i, [...hl("pruned", slotId(0, old)), ...hl("found", ai(out.length - 1))]),
      );
    } else if (op === "front") {
      const v = count === 0 ? -1 : Number(buf[head]!.label);
      out.push(v);
      yield t.step("front", count === 0 ? "Front(): the queue is empty. Return -1." : `Front(): buf[head] = buf[${head}] = ${v}.`, snap(i, [...(count ? hl("compare", slotId(0, head)) : []), ...hl("found", ai(out.length - 1))]));
    } else {
      const r = (head + count - 1 + k) % k;
      const v = count === 0 ? -1 : Number(buf[r]!.label);
      out.push(v);
      yield t.step(
        "rear",
        count === 0 ? "Rear(): the queue is empty. Return -1." : `Rear(): buf[(head + count - 1) % k] = buf[(${head} + ${count} - 1) % ${k}] = buf[${r}] = ${v}.`,
        snap(i, [...(count ? hl("compare", slotId(0, r)) : []), ...hl("found", ai(out.length - 1))]),
      );
    }
  }
}

const algorithm: AlgorithmModule<Input, SQState> = {
  ...meta,
  renderer: "stackqueue",
  inputSchema: {
    fields: [
      { key: "k", label: "capacity k", kind: "number", integer: true, min: 1, max: 8 },
      { key: "ops", label: "operations", kind: "words", maxLength: 16, pattern: /^(enq:-?\d{1,2}|deq|front|rear)$/, patternHint: "must be enq:x, deq, front or rear" },
    ],
  },
  presets: [
    { name: "LeetCode example (k = 3)", input: { k: 3, ops: ["enq:1", "enq:2", "enq:3", "enq:4", "rear", "deq", "enq:4", "rear"] } },
    { name: "Wrap around several times (k = 4)", input: { k: 4, ops: ["enq:1", "enq:2", "enq:3", "deq", "deq", "enq:4", "enq:5", "enq:6", "front", "rear", "deq", "deq", "enq:7", "front"] } },
    { name: "Edge case: empty queue", input: { k: 2, ops: ["deq", "front", "rear", "enq:9", "front", "rear"] } },
    { name: "Edge case: capacity 1", input: { k: 1, ops: ["enq:5", "enq:6", "front", "deq", "enq:6", "rear"] } },
  ],
  randomInput: (size, rng = Math.random) => {
    const k = randInt(rng, 1, 6);
    const n = Math.max(1, Math.min(16, size + 3));
    return { k, ops: Array.from({ length: n }, () => (rng() < 0.45 ? `enq:${randInt(rng, 0, 9)}` : pick(rng, ["deq", "front", "rear"]))) };
  },
  code: { python, javascript },
  generate,
  reference: ({ k, ops }) => {
    const q: number[] = [];
    const out: Ret[] = [];
    for (const tok of ops) {
      const [op, x] = parseOp(tok);
      if (op === "enq") out.push(q.length < k ? (q.push(x!), true) : false);
      else if (op === "deq") out.push(q.length > 0 ? (q.shift(), true) : false);
      else if (op === "front") out.push(q.length ? q[0] : -1);
      else out.push(q.length ? q[q.length - 1] : -1);
    }
    return out;
  },
  outputOf: (s) => s.result,
  info,
  legendLabels: { visited: "In the queue", pruned: "Stale (abandoned) value", frontier: "Free slot to write", active: "Just written", removed: "Leaving", compare: "Read", found: "Return value", mismatch: "Full / empty: False" },
};

export default algorithm;
