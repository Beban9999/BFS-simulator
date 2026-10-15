import type { AlgorithmModule, Highlight, Rng } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { pick, randInt } from "../../../engine/random";
import { ai } from "../../_shared/array";
import { Box, applyOp, qid, type SQState } from "../../_shared/stackqueue";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  tokens: string[];
}

const isOp = (tok: string) => tok === "+" || tok === "-" || tok === "*" || tok === "/";

function* generate({ tokens }: Input) {
  const t = new Tracer<SQState>();
  Box.resetIds();
  const stack = new Box("operand stack");
  const done: number[] = [];

  const snap = (i: number | null, extra: Highlight[] = [], result?: number) => ({
    state: {
      array: { rows: [{ values: tokens }], pointers: i === null ? [] : [{ name: "tok", index: i }] },
      containers: [stack.view(`size ${stack.size}`)],
      result,
    },
    vars: { tok: i === null ? "—" : tokens[i], stack: `[${stack.labels().join(", ")}]` },
    highlights: [...hl("visited", ...done.map((k) => ai(k))), ...extra],
  });

  yield t.step("init", `Read the ${tokens.length} tokens left to right with an empty operand stack.`, snap(null));

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    yield t.step("loop", `Token ${i}: "${tok}" is ${isOp(tok) ? "an operator" : "a number"}.`, snap(i, hl("current", ai(i))));
    if (!isOp(tok)) {
      const it = stack.push(tok);
      t.count("pushes");
      done.push(i);
      yield t.step("push", `Push ${tok}; it waits for an operator.`, snap(i, [...hl("current", ai(i)), ...hl("active", qid(0, it.id))]));
      continue;
    }
    const bItem = stack.top!;
    const aItem = stack.items[stack.size - 2];
    yield t.step(
      "pop2",
      `"${tok}" needs two operands: pop b = ${bItem.label} (the top, so the RIGHT operand), then a = ${aItem.label}.`,
      snap(i, [...hl("current", ai(i)), ...hl("compare", qid(0, aItem.id), qid(0, bItem.id))]),
    );
    stack.pop();
    stack.pop();
    t.count("pops", 2);
    const a = Number(aItem.label);
    const b = Number(bItem.label);
    const r = applyOp(tok, a, b);
    const it = stack.push(r);
    t.count("pushes");
    done.push(i);
    yield t.step(
      "apply",
      `${a} ${tok} ${b} = ${r}${tok === "/" && a % b !== 0 ? " (truncated toward zero)" : ""}. Push ${r}: it is an operand for what follows.`,
      snap(i, [...hl("current", ai(i)), ...hl("found", qid(0, it.id))]),
    );
  }

  const ans = Number(stack.top!.label);
  yield t.step("done", `All tokens used; exactly one value is left: the answer ${ans}.`, snap(null, hl("found", qid(0, stack.top!.id)), ans));
}

/** Null when the tokens form a valid postfix expression without division by zero. */
function check(tokens: string[]): string | null {
  const st: number[] = [];
  for (const tok of tokens) {
    if (!isOp(tok)) st.push(Number(tok));
    else {
      if (st.length < 2) return `"${tok}" does not have two operands before it.`;
      const b = st.pop()!;
      const a = st.pop()!;
      if (tok === "/" && b === 0) return "The expression divides by zero.";
      st.push(applyOp(tok, a, b));
    }
  }
  if (st.length !== 1) return st.length === 0 ? "Enter at least one number." : `${st.length} values are left over — add operators.`;
  return null;
}

function randomRpn(rng: Rng, size: number): string[] {
  // Build a random expression tree with `ops` operators and emit it in postfix.
  const ops = Math.max(0, Math.min(6, Math.floor(size / 2)));
  const emit = (n: number): string[] => {
    if (n === 0) return [String(randInt(rng, 0, 12))];
    const left = randInt(rng, 0, n - 1);
    return [...emit(left), ...emit(n - 1 - left), pick(rng, ["+", "-", "*", "/"])];
  };
  for (let tries = 0; ; tries++) {
    const toks = emit(ops);
    if (check(toks) === null || tries > 20) return check(toks) === null ? toks : ["1"];
  }
}

const algorithm: AlgorithmModule<Input, SQState> = {
  ...meta,
  renderer: "stackqueue",
  inputSchema: {
    fields: [{ key: "tokens", label: "tokens", kind: "words", maxLength: 15, pattern: /^(-?\d{1,2}|[-+*/])$/, patternHint: "must be integers (-99…99) or + - * /" }],
    validate: ({ tokens }) => check(tokens),
  },
  presets: [
    { name: "LeetCode example: 2 1 + 3 *", input: { tokens: ["2", "1", "+", "3", "*"] } },
    { name: "Order matters: 4 13 5 / +", input: { tokens: ["4", "13", "5", "/", "+"] } },
    { name: "Negative division truncates: 7 -2 /", input: { tokens: ["7", "-2", "/"] } },
    { name: "Edge case: a single number", input: { tokens: ["42"] } },
    { name: "Deep stack: 1 2 3 4 5 + + + +", input: { tokens: ["1", "2", "3", "4", "5", "+", "+", "+", "+"] } },
  ],
  randomInput: (size, rng = Math.random) => ({ tokens: randomRpn(rng, size) }),
  code: { python, javascript },
  generate,
  reference: ({ tokens }) => {
    // Recursive evaluation from the end: the last token is the root of the expression.
    let pos = tokens.length - 1;
    const evalFrom = (): number => {
      const tok = tokens[pos--];
      if (!isOp(tok)) return Number(tok);
      const b = evalFrom();
      const a = evalFrom();
      return applyOp(tok, a, b);
    };
    return evalFrom();
  },
  outputOf: (s) => s.result,
  info,
  legendLabels: { current: "Current token", visited: "Used", active: "Pushed number", compare: "Operands a, b", found: "Result" },
};

export default algorithm;
