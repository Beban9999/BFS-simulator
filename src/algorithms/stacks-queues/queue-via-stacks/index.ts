import type { AlgorithmModule, Highlight, Step } from "../../../engine/types";
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
  const inbox = new Box("inbox");
  const outbox = new Box("outbox");
  const out: Ret[] = [];
  const show = (r: Ret) => (r === true ? "T" : r === false ? "F" : String(r));

  // Return values so far are the answer; the class has no "done" line, so every step carries them.
  const snap = (i: number | null, extra: Highlight[] = []) => ({
    state: {
      array: { rows: [{ label: "returns", values: out.length ? out.map(show) : [""] }] },
      containers: [inbox.view("push here"), outbox.view("pop / peek here")],
      caption: `queue front → back: [${[...outbox.labels().reverse(), ...inbox.labels()].join(", ")}]`,
      result: out.slice(),
    },
    vars: { op: i === null ? "—" : ops[i], "len(inbox)": inbox.size, "len(outbox)": outbox.size },
    aux: [{ label: "operations", kind: "list" as const, items: ops, highlight: i === null ? [] : [i] }],
    highlights: extra,
  });

  function* refill(i: number): Generator<Step<SQState>, void, unknown> {
    t.count("comparisons");
    if (outbox.size > 0) {
      yield t.step("check-out", `The outbox still has ${outbox.size} item${outbox.size === 1 ? "" : "s"}, and its top ${outbox.top!.label} is the oldest in the queue — no refill.`, snap(i, hl("compare", qid(1, outbox.top!.id))));
      return;
    }
    yield t.step("check-out", `The outbox is empty: move all ${inbox.size} item${inbox.size === 1 ? "" : "s"} over from the inbox.`, snap(i));
    while (inbox.size) {
      const it = inbox.pop();
      t.count("pops");
      const moved = outbox.push(it.label);
      t.count("pushes");
      yield t.step("move", `Pop ${it.label} from the inbox and push it onto the outbox${inbox.size === 0 ? ` — the oldest item ${moved.label} is now on top` : ""}.`, snap(i, hl("active", qid(1, moved.id))));
    }
  }

  yield t.step("init", "Two empty stacks: the inbox takes new items, the outbox gives out old ones.", snap(null));

  for (let i = 0; i < ops.length; i++) {
    const [op, x] = parseOp(ops[i]);
    if (op === "push") {
      const it = inbox.push(x!);
      t.count("pushes");
      yield t.step("push", `push(${x}): put it on the inbox — O(1), the outbox is untouched.`, snap(i, hl("active", qid(0, it.id))));
    } else if (op === "pop" || op === "peek") {
      yield* refill(i);
      const top = outbox.top!;
      out.push(Number(top.label));
      if (op === "pop") {
        yield t.step("pop", `pop(): remove ${top.label} from the outbox's top — the front of the queue.`, snap(i, [...hl("removed", qid(1, top.id)), ...hl("found", ai(out.length - 1))]));
        outbox.pop();
        t.count("pops");
      } else {
        yield t.step("peek", `peek(): the outbox's top ${top.label} is the front of the queue.`, snap(i, [...hl("compare", qid(1, top.id)), ...hl("found", ai(out.length - 1))]));
      }
    } else {
      const e = inbox.size === 0 && outbox.size === 0;
      out.push(e);
      yield t.step("empty", `empty(): both stacks ${e ? "are empty — True" : `together hold ${inbox.size + outbox.size} item${inbox.size + outbox.size === 1 ? "" : "s"} — False`}.`, snap(i, hl("found", ai(out.length - 1))));
    }
  }
}

function checkOps(ops: string[]): string | null {
  let size = 0;
  for (const tok of ops) {
    const [op] = parseOp(tok);
    if (op === "push") size++;
    else if (op === "empty") continue;
    else if (size === 0) return `"${tok}" is called on an empty queue.`;
    else if (op === "pop") size--;
  }
  return null;
}

const algorithm: AlgorithmModule<Input, SQState> = {
  ...meta,
  renderer: "stackqueue",
  inputSchema: {
    fields: [{ key: "ops", label: "operations", kind: "words", maxLength: 16, pattern: /^(push:-?\d{1,2}|pop|peek|empty)$/, patternHint: "must be push:x, pop, peek or empty" }],
    validate: ({ ops }) => checkOps(ops),
  },
  presets: [
    { name: "LeetCode example", input: { ops: ["push:1", "push:2", "peek", "pop", "empty"] } },
    { name: "Pushes between pops (no early refill)", input: { ops: ["push:1", "push:2", "push:3", "pop", "push:4", "push:5", "pop", "pop", "pop", "peek"] } },
    { name: "Edge case: empty checks", input: { ops: ["empty", "push:7", "empty", "pop", "empty"] } },
    { name: "One big refill, then cheap pops", input: { ops: ["push:1", "push:2", "push:3", "push:4", "push:5", "pop", "pop", "pop", "pop", "pop"] } },
  ],
  randomInput: (size, rng = Math.random) => {
    const ops: string[] = [];
    let n = 0;
    for (let i = 0; i < Math.max(1, Math.min(16, size + 3)); i++) {
      const op = n === 0 ? pick(rng, ["push", "push", "empty"]) : pick(rng, ["push", "push", "pop", "peek", "empty"]);
      if (op === "push") n++;
      if (op === "pop") n--;
      ops.push(op === "push" ? `push:${randInt(rng, 0, 9)}` : op);
    }
    return { ops };
  },
  code: { python, javascript },
  generate,
  reference: ({ ops }) => {
    const q: number[] = [];
    const out: Ret[] = [];
    for (const tok of ops) {
      const [op, x] = parseOp(tok);
      if (op === "push") q.push(x!);
      else if (op === "pop") out.push(q.shift()!);
      else if (op === "peek") out.push(q[0]);
      else out.push(q.length === 0);
    }
    return out;
  },
  outputOf: (s) => s.result,
  info,
  legendLabels: { active: "Just pushed / moved", removed: "Popped (queue front)", compare: "Outbox top", found: "Return value" },
};

export default algorithm;
