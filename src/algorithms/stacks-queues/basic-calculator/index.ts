import type { AlgorithmModule, Highlight, Rng } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { pick, randInt } from "../../../engine/random";
import { ai, type Pointer } from "../../_shared/array";
import { Box, applyOp, qid, type SQState } from "../../_shared/stackqueue";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  s: string;
}

const PREC: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2 };
const tokenize = (s: string) => s.match(/\d+|[-+*/()]/g) ?? [];
const isNum = (tok: string) => /^\d+$/.test(tok);

/** Recursive-descent evaluation; throws on malformed input. Used for validation and as the reference. */
function parseEval(s: string): number {
  const toks = tokenize(s);
  let p = 0;
  const expr = (): number => {
    let v = term();
    while (toks[p] === "+" || toks[p] === "-") {
      const op = toks[p++];
      v = applyOp(op, v, term());
    }
    return v;
  };
  const term = (): number => {
    let v = factor();
    while (toks[p] === "*" || toks[p] === "/") {
      const op = toks[p++];
      const r = factor();
      if (op === "/" && r === 0) throw new Error("The expression divides by zero.");
      v = applyOp(op, v, r);
    }
    return v;
  };
  const factor = (): number => {
    const tok = toks[p++];
    if (tok === undefined) throw new Error("The expression ends too early.");
    if (isNum(tok)) return Number(tok);
    if (tok === "(") {
      const v = expr();
      if (toks[p++] !== ")") throw new Error("A \"(\" is never closed.");
      return v;
    }
    throw new Error(`Unexpected "${tok}" (unary minus is not supported).`);
  };
  const v = expr();
  if (p !== toks.length) throw new Error(`Unexpected "${toks[p]}".`);
  return v;
}

function* generate({ s }: Input) {
  const t = new Tracer<SQState>();
  Box.resetIds();
  const toks = tokenize(s);
  const output: string[] = [];
  const ops = new Box("operator stack");
  const vals = new Box("value stack");
  let phase: 1 | 2 = 1;

  const snap = (ptrs: Pointer[], extra: Highlight[] = [], result?: number) => ({
    state: {
      array: {
        rows: [
          { label: "infix", values: toks },
          { label: "postfix", values: output.length ? output.slice() : [""] },
        ],
        pointers: ptrs,
      },
      containers: [phase === 1 ? ops.view(ops.size ? `top: ${ops.top!.label}` : "empty") : vals.view(`size ${vals.size}`)],
      caption: phase === 1 ? "Phase 1 — convert infix to postfix" : "Phase 2 — evaluate the postfix",
      result,
    },
    vars: phase === 1 ? { ops: `[${ops.labels().join(" ")}]`, postfix: output.join(" ") } : { stack: `[${vals.labels().join(", ")}]` },
    highlights: extra,
  });
  const emit = (tok: string) => {
    output.push(tok);
    t.count("writes");
    return ai(output.length - 1, 1);
  };

  yield t.step("init", `Tokens: ${toks.join(" ")}. Empty postfix output and empty operator stack.`, snap([]));

  for (let i = 0; i < toks.length; i++) {
    const tok = toks[i];
    const at = [{ name: "tok", index: i }];
    const cur = hl("current", ai(i));
    yield t.step("loop", `Token "${tok}".`, snap(at, cur));
    if (isNum(tok)) {
      yield t.step("number", `${tok} is a number: it goes straight to the output.`, snap(at, [...cur, ...hl("found", emit(tok))]));
    } else if (tok === "(") {
      const it = ops.push("(");
      t.count("pushes");
      yield t.step("open", `Push "(" as a barrier: operators after it stay inside the group.`, snap(at, [...cur, ...hl("active", qid(0, it.id))]));
    } else if (tok === ")") {
      while (ops.top!.label !== "(") {
        const op = ops.pop();
        t.count("pops");
        yield t.step("close", `")": move "${op.label}" from the stack to the output — it belongs to this group.`, snap(at, [...cur, ...hl("found", emit(op.label))]));
      }
      const open = ops.top!;
      yield t.step("drop-open", `Reached the matching "(": pop and discard it — parentheses never appear in postfix.`, snap(at, [...cur, ...hl("removed", qid(0, open.id))]));
      ops.pop();
      t.count("pops");
    } else {
      while (true) {
        const top = ops.top;
        t.count("comparisons");
        if (!top || top.label === "(" || PREC[top.label] < PREC[tok]) {
          const why = !top ? "the stack is empty" : top.label === "(" ? `the top is "(" (a barrier)` : `"${top.label}" binds less tightly than "${tok}"`;
          const it = ops.push(tok);
          t.count("pushes");
          yield t.step("push-op", `Push "${tok}": ${why}.`, snap(at, [...cur, ...hl("active", qid(0, it.id))]));
          break;
        }
        ops.pop();
        t.count("pops");
        yield t.step(
          "pop-op",
          `"${top.label}" on top binds ${PREC[top.label] > PREC[tok] ? "more tightly than" : "as tightly as"} "${tok}"${PREC[top.label] === PREC[tok] ? " (and comes first, left to right)" : ""}, so it must be applied first: move it to the output.`,
          snap(at, [...cur, ...hl("found", emit(top.label))]),
        );
      }
    }
  }
  while (ops.size) {
    const op = ops.pop();
    t.count("pops");
    yield t.step("flush", `End of input: move the remaining "${op.label}" to the output.`, snap([], hl("found", emit(op.label))));
  }
  yield t.step("to-eval", `Postfix: ${output.join(" ")}. Now evaluate it.`, snap([]));

  phase = 2;
  yield t.step("eval-init", "Evaluate the postfix left to right with a value stack.", snap([]));
  for (let k = 0; k < output.length; k++) {
    const tok = output[k];
    const at = [{ name: "k", index: k, row: 1 }];
    if (isNum(tok)) {
      const it = vals.push(tok);
      t.count("pushes");
      yield t.step("eval-num", `Push ${tok}.`, snap(at, [...hl("current", ai(k, 1)), ...hl("active", qid(0, it.id))]));
    } else {
      const b = Number(vals.pop().label);
      const a = Number(vals.pop().label);
      t.count("pops", 2);
      const r = applyOp(tok, a, b);
      const it = vals.push(r);
      t.count("pushes");
      yield t.step("eval-op", `"${tok}": pop b = ${b} and a = ${a}, push ${a} ${tok} ${b} = ${r}.`, snap(at, [...hl("current", ai(k, 1)), ...hl("found", qid(0, it.id))]));
    }
  }
  const ans = Number(vals.top!.label);
  yield t.step("done", `${s.trim()} = ${ans}.`, snap([], hl("found", qid(0, vals.top!.id)), ans));
}

function randomExpr(rng: Rng, size: number): string {
  const ops = Math.max(1, Math.min(5, Math.floor(size / 2)));
  const build = (n: number): string => {
    if (n === 0) return String(randInt(rng, 1, 9));
    const left = randInt(rng, 0, n - 1);
    const e = `${build(left)} ${pick(rng, ["+", "-", "*", "/"])} ${build(n - 1 - left)}`;
    return rng() < 0.35 ? `(${e})` : e;
  };
  for (let tries = 0; tries < 20; tries++) {
    const e = build(ops);
    try {
      parseEval(e);
      if (tokenize(e).length <= 15) return e;
    } catch {
      /* division by zero: try again */
    }
  }
  return "1 + 2";
}

const algorithm: AlgorithmModule<Input, SQState> = {
  ...meta,
  renderer: "stackqueue",
  inputSchema: {
    fields: [{ key: "s", label: "expression", kind: "text", minLength: 1, maxLength: 40, pattern: /^[0-9+\-*/() ]*$/, patternHint: "may only contain digits, + - * / ( ) and spaces" }],
    validate: ({ s }) => {
      if (tokenize(s).length > 15) return "Use at most 15 tokens.";
      if (tokenize(s).some((tok) => isNum(tok) && Number(tok) > 999)) return "Numbers must be at most 999.";
      try {
        parseEval(s);
        return null;
      } catch (e) {
        return (e as Error).message;
      }
    },
  },
  presets: [
    { name: "Precedence: 3 + 4 * 2 - 1", input: { s: "3 + 4 * 2 - 1" } },
    { name: "Parentheses: (1 + 2) * (3 + 4)", input: { s: "(1 + 2) * (3 + 4)" } },
    { name: "Left to right: 8 - 3 - 2", input: { s: "8 - 3 - 2" } },
    { name: "Edge case: a single number", input: { s: "42" } },
    { name: "Nested: 2 * (3 + (14 - 4) / 5)", input: { s: "2 * (3 + (14 - 4) / 5)" } },
  ],
  randomInput: (size, rng = Math.random) => ({ s: randomExpr(rng, size) }),
  code: { python, javascript },
  generate,
  reference: ({ s }) => parseEval(s),
  outputOf: (st) => st.result,
  info,
  legendLabels: { current: "Current token", active: "Pushed", removed: "Discarded \"(\"", found: "Output / result" },
};

export default algorithm;
