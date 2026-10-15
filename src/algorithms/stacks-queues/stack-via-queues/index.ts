import type { AlgorithmModule, Highlight } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { pick, randInt } from "../../../engine/random";
import { ai } from "../../_shared/array";
import { Box, parseOp, qid, type SQState } from "../../_shared/stackqueue";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  ops: string[];
}

type Ret = number | boolean;

function* generate({ ops }: Input) {
  const t = new Tracer<SQState>();
  Box.resetIds();
  const q = new Box("queue", "queue");
  const out: Ret[] = [];
  const show = (r: Ret) => (r === true ? "T" : r === false ? "F" : String(r));

  // Return values so far are the answer; the class has no "done" line, so every step carries them.
  const snap = (i: number | null, extra: Highlight[] = []) => ({
    state: {
      array: { rows: [{ label: "returns", values: out.length ? out.map(show) : [""] }] },
      containers: [q.view(q.size ? `stack top = queue front = ${q.front!.label}` : "empty")],
      result: out.slice(),
    },
    vars: { op: i === null ? "—" : ops[i], "len(q)": q.size },
    aux: [{ label: "operations", kind: "list" as const, items: ops, highlight: i === null ? [] : [i] }],
    highlights: extra,
  });

  yield t.step("init", "One empty queue. Goal: keep the newest item at the front.", snap(null));

  for (let i = 0; i < ops.length; i++) {
    const [op, x] = parseOp(ops[i]);
    if (op === "push") {
      const it = q.push(x!);
      t.count("pushes");
      yield t.step("push", `push(${x}): append it at the back of the queue${q.size > 1 ? ` — but it must reach the front, so rotate the ${q.size - 1} older item${q.size === 2 ? "" : "s"} behind it` : " — it is alone, so it is already at the front"}.`, snap(i, hl("active", qid(0, it.id))));
      for (let r = 1; r < q.size; r++) {
        const moved = q.items.shift()!;
        q.items.push(moved); // same item, so it glides to the back
        t.count("pops");
        t.count("pushes");
        yield t.step("rotate", `Rotation ${r} of ${q.size - 1}: popleft ${moved.label} and append it at the back.`, snap(i, [...hl("compare", qid(0, moved.id)), ...hl("active", qid(0, it.id))]));
      }
    } else if (op === "pop") {
      const f = q.front!;
      out.push(Number(f.label));
      yield t.step("pop", `pop(): popleft ${f.label} — the most recently pushed item still in the stack.`, snap(i, [...hl("removed", qid(0, f.id)), ...hl("found", ai(out.length - 1))]));
      q.shift();
      t.count("pops");
    } else if (op === "top") {
      out.push(Number(q.front!.label));
      yield t.step("top", `top(): read the front, ${q.front!.label}.`, snap(i, [...hl("compare", qid(0, q.front!.id)), ...hl("found", ai(out.length - 1))]));
    } else {
      out.push(q.size === 0);
      yield t.step("empty", `empty(): the queue holds ${q.size} item${q.size === 1 ? "" : "s"} → ${q.size === 0 ? "True" : "False"}.`, snap(i, hl("found", ai(out.length - 1))));
    }
  }
}

function checkOps(ops: string[]): string | null {
  let size = 0;
  for (const tok of ops) {
    const [op] = parseOp(tok);
    if (op === "push") size++;
    else if (op === "empty") continue;
    else if (size === 0) return `"${tok}" is called on an empty stack.`;
    else if (op === "pop") size--;
  }
  return null;
}

const algorithm: AlgorithmModule<Input, SQState> = {
  ...meta,
  renderer: "stackqueue",
  inputSchema: {
    fields: [{ key: "ops", label: "operations", kind: "words", maxLength: 14, pattern: /^(push:-?\d{1,2}|pop|top|empty)$/, patternHint: "must be push:x, pop, top or empty" }],
    validate: ({ ops }) => checkOps(ops),
  },
  presets: [
    { name: "LeetCode example", input: { ops: ["push:1", "push:2", "top", "pop", "empty"] } },
    { name: "Push cost grows (worst case)", input: { ops: ["push:1", "push:2", "push:3", "push:4", "push:5", "top", "pop", "pop"] } },
    { name: "Edge case: empty checks", input: { ops: ["empty", "push:9", "top", "pop", "empty"] } },
  ],
  randomInput: (size, rng = Math.random) => {
    const ops: string[] = [];
    let n = 0;
    for (let i = 0; i < Math.max(1, Math.min(14, size + 3)); i++) {
      const op = n === 0 ? pick(rng, ["push", "push", "empty"]) : pick(rng, ["push", "pop", "top", "empty"]);
      if (op === "push") n++;
      if (op === "pop") n--;
      ops.push(op === "push" ? `push:${randInt(rng, 0, 9)}` : op);
    }
    return { ops };
  },
  code: { python, javascript },
  generate,
  reference: ({ ops }) => {
    const s: number[] = [];
    const out: Ret[] = [];
    for (const tok of ops) {
      const [op, x] = parseOp(tok);
      if (op === "push") s.push(x!);
      else if (op === "pop") out.push(s.pop()!);
      else if (op === "top") out.push(s[s.length - 1]);
      else out.push(s.length === 0);
    }
    return out;
  },
  outputOf: (s) => s.result,
  info,
  legendLabels: { active: "Newest item", compare: "Rotated / read", removed: "Popped", found: "Return value" },
};

export default algorithm;
