import type { AlgorithmModule, Highlight } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { pick, randInt } from "../../../engine/random";
import { ai } from "../../_shared/array";
import { Box, parseOp, qid, type SQState } from "../../_shared/stackqueue";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

type Kind = "stack" | "queue" | "deque";

interface Input {
  kind: Kind;
  ops: string[];
}

const OP_RE = /^(push:-?\d{1,2}|pushleft:-?\d{1,2}|pop|popleft|peek)$/;

function* generate({ kind, ops }: Input) {
  const t = new Tracer<SQState>();
  Box.resetIds();
  const box = new Box(kind, kind);
  const out: (number | null)[] = [];
  const show = (v: number | null) => (v === null ? "None" : String(v));

  const snap = (i: number | null, extra: Highlight[] = [], result?: unknown) => ({
    state: {
      array: { rows: [{ label: "out", values: out.length ? out.map(show) : [""] }] },
      containers: [box.view(`size ${box.size}`)],
      caption: kind === "stack" ? "Stack: push and pop at the top (LIFO)" : kind === "queue" ? "Queue: push at the back, pop from the front (FIFO)" : "Deque: push and pop at both ends",
      result,
    },
    vars: { op: i === null ? "—" : ops[i], size: box.size },
    aux: [{ label: "operations", kind: "list" as const, items: ops, highlight: i === null ? [] : [i] }],
    highlights: extra,
  });

  yield t.step("init", `Start with an empty ${kind} and an empty list of results.`, snap(null));

  for (let i = 0; i < ops.length; i++) {
    const [op, x] = parseOp(ops[i]);
    yield t.step("loop", `Operation ${i + 1} of ${ops.length}: ${ops[i]}.`, snap(i));
    if (op === "push") {
      const it = box.push(x!);
      t.count("pushes");
      const where = kind === "stack" ? "on top" : "at the back";
      yield t.step("push", `Push ${x} ${where}.`, snap(i, hl("active", qid(0, it.id))));
    } else if (op === "pushleft") {
      const it = box.pushFront(x!);
      t.count("pushes");
      yield t.step("pushleft", `Push ${x} at the front of the deque.`, snap(i, hl("active", qid(0, it.id))));
    } else if (box.size === 0) {
      out.push(null);
      yield t.step("empty", `The ${kind} is empty — ${op} has nothing to return, so record None.`, snap(i, hl("mismatch", ai(out.length - 1))));
    } else if (op === "pop" || op === "popleft") {
      const fromFront = op === "popleft" || kind === "queue";
      const it = fromFront ? box.front! : box.top!;
      yield t.step(
        op,
        `${op}: remove the ${kind === "stack" ? "top" : fromFront ? "front" : "back"} item ${it.label}${kind === "queue" ? " — the oldest one" : kind === "stack" ? " — the newest one" : ""}.`,
        snap(i, hl("removed", qid(0, it.id))),
      );
      if (fromFront) box.shift();
      else box.pop();
      t.count("pops");
      out.push(Number(it.label));
      yield t.step(op, `${it.label} is gone; out = [${out.map(show).join(", ")}].`, snap(i, hl("found", ai(out.length - 1))));
    } else {
      const it = kind === "stack" ? box.top! : box.front!;
      out.push(Number(it.label));
      yield t.step("peek", `peek: look at the ${kind === "stack" ? "top" : "front"} item ${it.label} without removing it.`, snap(i, [...hl("compare", qid(0, it.id)), ...hl("found", ai(out.length - 1))]));
    }
  }

  yield t.step("done", `All operations done. Results: [${out.map(show).join(", ")}]; ${box.size} item${box.size === 1 ? "" : "s"} left (${box.labels().join(", ") || "none"}).`, snap(null, [], { out, left: box.labels().map(Number) }));
}

const algorithm: AlgorithmModule<Input, SQState> = {
  ...meta,
  renderer: "stackqueue",
  inputSchema: {
    fields: [
      {
        key: "kind",
        label: "structure",
        kind: "select",
        options: [
          { value: "stack", label: "Stack (LIFO)" },
          { value: "queue", label: "Queue (FIFO)" },
          { value: "deque", label: "Deque (both ends)" },
        ],
      },
      {
        key: "ops",
        label: "operations",
        kind: "words",
        maxLength: 14,
        pattern: OP_RE,
        patternHint: "must be push:x, pop, peek (deque also: pushleft:x, popleft), x between -99 and 99",
      },
    ],
    validate: ({ kind, ops }) => (kind !== "deque" && ops.some((o) => o.startsWith("pushleft") || o === "popleft") ? "pushleft / popleft only work on a deque." : null),
  },
  presets: [
    { name: "Stack: LIFO order", input: { kind: "stack", ops: ["push:1", "push:2", "push:3", "peek", "pop", "pop", "push:4", "pop", "pop"] } },
    { name: "Queue: same operations, FIFO order", input: { kind: "queue", ops: ["push:1", "push:2", "push:3", "peek", "pop", "pop", "push:4", "pop", "pop"] } },
    { name: "Deque: both ends", input: { kind: "deque", ops: ["push:1", "pushleft:2", "push:3", "pushleft:4", "peek", "popleft", "pop", "popleft", "pop"] } },
    { name: "Edge case: pop and peek on empty", input: { kind: "stack", ops: ["pop", "peek", "push:5", "pop", "pop"] } },
  ],
  randomInput: (size, rng = Math.random) => {
    const kind = pick(rng, ["stack", "queue", "deque"] as const);
    const n = Math.max(1, Math.min(14, size + 2));
    const choices = kind === "deque" ? ["push", "push", "pushleft", "pop", "popleft", "peek"] : ["push", "push", "pop", "peek"];
    const ops = Array.from({ length: n }, () => {
      const op = pick(rng, choices);
      return op.startsWith("push") ? `${op}:${randInt(rng, 0, 9)}` : op;
    });
    return { kind, ops };
  },
  code: { python, javascript },
  generate,
  reference: ({ kind, ops }) => {
    const box: number[] = [];
    const out: (number | null)[] = [];
    for (const tok of ops) {
      const [op, x] = parseOp(tok);
      if (op === "push") box.push(x!);
      else if (op === "pushleft") box.unshift(x!);
      else if (box.length === 0) out.push(null);
      else if (op === "pop") out.push(kind === "queue" ? box.shift()! : box.pop()!);
      else if (op === "popleft") out.push(box.shift()!);
      else out.push(kind === "stack" ? box[box.length - 1] : box[0]);
    }
    return { out, left: box };
  },
  outputOf: (s) => s.result,
  info,
  legendLabels: { active: "Just pushed", removed: "Being removed", compare: "Peeked", found: "Returned value", mismatch: "Empty: None" },
};

export default algorithm;
