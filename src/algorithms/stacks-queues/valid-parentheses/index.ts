import type { AlgorithmModule, Highlight, Rng } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { pick, randInt } from "../../../engine/random";
import { ai } from "../../_shared/array";
import { Box, qid, type SQState } from "../../_shared/stackqueue";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  s: string;
}

const PAIRS: Record<string, string> = { ")": "(", "]": "[", "}": "{" };

function* generate({ s }: Input) {
  const t = new Tracer<SQState>();
  Box.resetIds();
  const stack = new Box("stack");
  const chars = [...s];
  const matched: number[] = [];
  const openAt = new Map<number, number>(); // stack item id -> index in s

  const snap = (i: number | null, extra: Highlight[] = [], result?: boolean) => ({
    state: {
      array: {
        rows: [{ values: chars.length ? chars : [""] }],
        pointers: i === null ? [] : [{ name: "ch", index: i }],
      },
      containers: [stack.view(`size ${stack.size}`)],
      result,
    },
    vars: { ch: i === null || i >= chars.length ? "—" : chars[i], "stack top": stack.top?.label ?? "empty" },
    highlights: [...hl("match", ...matched.map((k) => ai(k))), ...extra],
  });

  yield t.step("init", s.length === 0 ? "The string is empty — nothing to check." : `Scan "${s}" left to right with an empty stack of still-open brackets.`, snap(null));

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    yield t.step("loop", `Character ${i}: "${ch}" — ${ch in PAIRS ? "a closer" : "an opener"}.`, snap(i, hl("current", ai(i))));
    if (!(ch in PAIRS)) {
      const it = stack.push(ch, `i=${i}`);
      openAt.set(it.id, i);
      t.count("pushes");
      yield t.step("push", `Push "${ch}": it stays open until a matching "${Object.keys(PAIRS).find((k) => PAIRS[k] === ch)}" arrives.`, snap(i, [...hl("current", ai(i)), ...hl("active", qid(0, it.id))]));
      continue;
    }
    t.count("comparisons");
    const top = stack.top;
    if (!top || top.label !== PAIRS[ch]) {
      yield t.step(
        "check",
        top ? `"${ch}" needs "${PAIRS[ch]}" on top, but the top is "${top.label}".` : `"${ch}" needs a "${PAIRS[ch]}" to close, but the stack is empty.`,
        snap(i, [...hl("mismatch", ai(i)), ...(top ? [...hl("mismatch", qid(0, top.id), ai(openAt.get(top.id)!))] : [])]),
      );
      yield t.step("mismatch", `Return False — "${ch}" at index ${i} has no matching opener.`, snap(i, hl("mismatch", ai(i)), false));
      return;
    }
    yield t.step("check", `"${ch}" matches the "${top.label}" on top (opened at index ${openAt.get(top.id)}).`, snap(i, [...hl("current", ai(i)), ...hl("match", qid(0, top.id))]));
    stack.pop();
    t.count("pops");
    matched.push(openAt.get(top.id)!, i);
    yield t.step("pop", `Pop "${top.label}": the pair at indexes ${openAt.get(top.id)} and ${i} is closed.`, snap(i, hl("match", ai(i))));
  }

  const ok = stack.size === 0;
  yield t.step(
    "done",
    ok ? "End of string and the stack is empty: every bracket was closed in the right order. Return True." : `End of string but ${stack.size} opener${stack.size === 1 ? " is" : "s are"} still open: ${stack.labels().join(" ")}. Return False.`,
    snap(null, ok ? [] : stack.items.map((it) => ({ id: qid(0, it.id), kind: "mismatch" as const })), ok),
  );
}

function randomBrackets(rng: Rng, size: number): string {
  const n = Math.max(1, Math.min(8, Math.ceil(size / 2)));
  if (rng() < 0.5) {
    // A valid string built by nesting / concatenating pairs.
    let s = "";
    for (let i = 0; i < n; i++) {
      const [o, c] = pick(rng, ["()", "[]", "{}"]);
      const at = randInt(rng, 0, s.length);
      s = s.slice(0, at) + o + c + s.slice(at);
    }
    return s;
  }
  return Array.from({ length: randInt(rng, 1, 2 * n) }, () => pick(rng, [..."()[]{}"])).join("");
}

const algorithm: AlgorithmModule<Input, SQState> = {
  ...meta,
  renderer: "stackqueue",
  inputSchema: {
    fields: [{ key: "s", label: "s", kind: "text", maxLength: 16, pattern: /^[()[\]{}]*$/, patternHint: "may only contain ()[]{}" }],
  },
  presets: [
    { name: "Nested and valid: {[()]}()", input: { s: "{[()]}()" } },
    { name: "Wrong closer: ([)]", input: { s: "([)]" } },
    { name: "Edge case: unclosed openers ((", input: { s: "((" } },
    { name: "Edge case: starts with a closer", input: { s: ")(" } },
    { name: "Deepest stack (8 openers)", input: { s: "([{(([{}]))}])" } },
  ],
  randomInput: (size, rng = Math.random) => ({ s: randomBrackets(rng, size) }),
  code: { python, javascript },
  generate,
  reference: ({ s }) => {
    let prev = "";
    let cur = s;
    while (cur !== prev) {
      prev = cur;
      cur = cur.replace(/\(\)|\[\]|\{\}/g, "");
    }
    return cur === "";
  },
  outputOf: (st) => st.result,
  info,
  legendLabels: { current: "Current character", active: "Just pushed", match: "Matched pair", mismatch: "Mismatch / unclosed" },
};

export default algorithm;
