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

function* generate({ ops }: Input) {
  const t = new Tracer<SQState>();
  Box.resetIds();
  const stack = new Box("stack");
  const mins = new Box("mins");
  const out: number[] = [];

  // Return values so far are the answer; the class has no "done" line, so every step carries them.
  const snap = (i: number | null, extra: Highlight[] = []) => ({
    state: {
      array: { rows: [{ label: "returns", values: out.length ? out : [""] }] },
      containers: [stack.view(`size ${stack.size}`), mins.view(mins.size ? `min = ${mins.top!.label}` : "empty")],
      result: out.slice(),
    },
    vars: { op: i === null ? "—" : ops[i], "mins[-1]": mins.top?.label ?? "—" },
    aux: [{ label: "operations", kind: "list" as const, items: ops, highlight: i === null ? [] : [i] }],
    highlights: extra,
  });

  yield t.step("init", "Two empty stacks: the values, and the running minimums.", snap(null));

  for (let i = 0; i < ops.length; i++) {
    const [op, x] = parseOp(ops[i]);
    if (op === "push") {
      const it = stack.push(x!);
      t.count("pushes");
      yield t.step("push", `push(${x}): put ${x} on the main stack.`, snap(i, hl("active", qid(0, it.id))));
      t.count("comparisons");
      const cur = mins.top ? Number(mins.top.label) : null;
      if (cur === null || x! <= cur) {
        const m = mins.push(x!);
        t.count("pushes");
        yield t.step(
          "push-min",
          cur === null ? `mins is empty, so ${x} is the minimum: push it onto mins.` : `${x} ≤ current min ${cur}: it is the new minimum (ties count), push it onto mins.`,
          snap(i, [...hl("active", qid(0, it.id)), ...hl("found", qid(1, m.id))]),
        );
      } else {
        yield t.step("push-min", `${x} > current min ${cur}: the minimum doesn't change, mins stays as it is.`, snap(i, [...hl("active", qid(0, it.id)), ...hl("compare", qid(1, mins.top!.id))]));
      }
    } else if (op === "pop") {
      const it = stack.top!;
      yield t.step("pop", `pop(): remove ${it.label} from the top of the main stack.`, snap(i, hl("removed", qid(0, it.id))));
      stack.pop();
      t.count("pops");
      t.count("comparisons");
      const m = mins.top!;
      if (it.label === m.label) {
        yield t.step("pop-min", `${it.label} equals mins[-1]: the current minimum is leaving, so pop mins too.`, snap(i, hl("removed", qid(1, m.id))));
        mins.pop();
        t.count("pops");
        yield t.step("pop-min", mins.size ? `The minimum is back to ${mins.top!.label}, the value it was before ${it.label} arrived.` : "Both stacks are empty again.", snap(i, mins.size ? hl("found", qid(1, mins.top!.id)) : []));
      } else {
        yield t.step("pop-min", `${it.label} ≠ mins[-1] = ${m.label}: the minimum is still in the stack, mins is unchanged.`, snap(i, hl("compare", qid(1, m.id))));
      }
    } else if (op === "top") {
      out.push(Number(stack.top!.label));
      yield t.step("top", `top() returns ${stack.top!.label}.`, snap(i, [...hl("compare", qid(0, stack.top!.id)), ...hl("found", ai(out.length - 1))]));
    } else {
      out.push(Number(mins.top!.label));
      yield t.step("get-min", `getMin() returns mins[-1] = ${mins.top!.label} in O(1) — no scan of the ${stack.size} value${stack.size === 1 ? "" : "s"}.`, snap(i, [...hl("found", qid(1, mins.top!.id)), ...hl("found", ai(out.length - 1))]));
    }
  }
}

/** Every pop / top / getMin must happen on a non-empty stack. */
function checkOps(ops: string[]): string | null {
  let size = 0;
  for (const tok of ops) {
    const [op] = parseOp(tok);
    if (op === "push") size++;
    else if (size === 0) return `"${tok}" is called on an empty stack.`;
    else if (op === "pop") size--;
  }
  return null;
}

const algorithm: AlgorithmModule<Input, SQState> = {
  ...meta,
  renderer: "stackqueue",
  inputSchema: {
    fields: [{ key: "ops", label: "operations", kind: "words", maxLength: 16, pattern: /^(push:-?\d{1,2}|pop|top|getMin)$/, patternHint: "must be push:x, pop, top or getMin" }],
    validate: ({ ops }) => checkOps(ops),
  },
  presets: [
    { name: "LeetCode example", input: { ops: ["push:-2", "push:0", "push:-3", "getMin", "pop", "top", "getMin"] } },
    { name: "Duplicate minimums", input: { ops: ["push:2", "push:2", "push:5", "getMin", "pop", "pop", "getMin", "pop"] } },
    { name: "Worst case for mins: decreasing pushes", input: { ops: ["push:5", "push:4", "push:3", "push:2", "push:1", "getMin", "pop", "getMin", "pop", "getMin"] } },
    { name: "Edge case: increasing pushes (mins stays 1 deep)", input: { ops: ["push:1", "push:2", "push:3", "getMin", "pop", "getMin"] } },
  ],
  randomInput: (size, rng = Math.random) => {
    const ops: string[] = [];
    let n = 0;
    for (let i = 0; i < Math.max(1, Math.min(16, size + 3)); i++) {
      const op = n === 0 ? "push" : pick(rng, ["push", "push", "pop", "top", "getMin"]);
      if (op === "push") n++;
      if (op === "pop") n--;
      ops.push(op === "push" ? `push:${randInt(rng, -5, 5)}` : op);
    }
    return { ops };
  },
  code: { python, javascript },
  generate,
  reference: ({ ops }) => {
    const s: number[] = [];
    const out: number[] = [];
    for (const tok of ops) {
      const [op, x] = parseOp(tok);
      if (op === "push") s.push(x!);
      else if (op === "pop") s.pop();
      else if (op === "top") out.push(s[s.length - 1]);
      else out.push(Math.min(...s));
    }
    return out;
  },
  outputOf: (s) => s.result,
  info,
  legendLabels: { active: "Just pushed", removed: "Being popped", compare: "Compared / read", found: "Minimum / return value" },
};

export default algorithm;
