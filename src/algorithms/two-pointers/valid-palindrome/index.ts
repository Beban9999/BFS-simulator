import type { AlgorithmModule, Highlight } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { pick, randInt, randString } from "../../../engine/random";
import { ai, type ArrayState } from "../../_shared/array";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  s: string;
}

const isAlnum = (ch: string) => /[a-z0-9]/i.test(ch);

function* generate({ s }: Input) {
  const t = new Tracer<ArrayState>();
  const chars = [...s].map((ch) => (ch === " " ? "␣" : ch));
  let left = 0;
  let right = s.length - 1;
  const matched: number[] = [];
  const skipped: number[] = [];
  const state = (result?: boolean): ArrayState => ({
    rows: [{ values: chars }],
    pointers: s.length ? [{ name: "left", index: left }, { name: "right", index: right }] : [],
    result,
  });
  const frame = (): Highlight[] => [...hl("pruned", ...skipped.map((k) => ai(k))), ...hl("match", ...matched.map((k) => ai(k)))];

  yield t.step("init", `left = 0, right = ${s.length - 1}.`, { state: state(), vars: { left, right } });

  while (left < right) {
    if (!isAlnum(s[left])) {
      skipped.push(left);
      left++;
      yield t.step("skip-left", `'${chars[left - 1]}' is not a letter or digit: skip it, left → ${left}.`, { state: state(), vars: { left, right }, highlights: frame() });
    } else if (!isAlnum(s[right])) {
      skipped.push(right);
      right--;
      yield t.step("skip-right", `'${chars[right + 1]}' is not a letter or digit: skip it, right → ${right}.`, { state: state(), vars: { left, right }, highlights: frame() });
    } else {
      t.count("comparisons");
      const a = s[left].toLowerCase();
      const b = s[right].toLowerCase();
      if (a !== b) {
        yield t.step("fail", `'${s[left]}' ≠ '${s[right]}' — mirrored characters differ, so this is not a palindrome.`, {
          state: state(false),
          vars: { left, right, "s[left]": s[left], "s[right]": s[right] },
          highlights: [...frame(), ...hl("mismatch", ai(left), ai(right))],
        });
        return;
      }
      matched.push(left, right);
      yield t.step("match", `'${s[left]}' and '${s[right]}' match (ignoring case). Move both pointers inward.`, {
        state: state(),
        vars: { left, right, "s[left]": s[left], "s[right]": s[right] },
        highlights: frame(),
      });
      left++;
      right--;
    }
  }

  yield t.step("done", "The pointers met without a mismatch: it is a palindrome.", { state: state(true), vars: { left, right }, highlights: frame() });
}

function reference({ s }: Input): boolean {
  const clean = [...s].filter(isAlnum).map((c) => c.toLowerCase());
  return clean.join("") === clean.slice().reverse().join("");
}

const PALS = ["racecar", "level", "noon", "abba", "madam"];

const algorithm: AlgorithmModule<Input, ArrayState> = {
  ...meta,
  renderer: "array",
  inputSchema: {
    fields: [{ key: "s", label: "s", kind: "text", maxLength: 30, pattern: /^[ -~]*$/, patternHint: "must use printable ASCII characters." }],
  },
  presets: [
    { name: "LeetCode example", input: { s: "A man, a plan, a canal: Panama" } },
    { name: "Not a palindrome", input: { s: "race a car" } },
    { name: "Edge case: only punctuation", input: { s: " ,.!" } },
    { name: "Digits count too", input: { s: "0P" } },
  ],
  randomInput: (size, rng = Math.random) => {
    if (rng() < 0.5) {
      const w = pick(rng, PALS);
      return { s: rng() < 0.5 ? w : `${w.slice(0, 2)}, ${w.slice(2).toUpperCase()}!` };
    }
    return { s: randString(rng, randInt(rng, 1, Math.max(1, Math.min(14, size))), "ab ,c") };
  },
  code: { python, javascript },
  generate,
  reference,
  outputOf: (st) => st.result,
  info,
  legendLabels: { pruned: "Skipped (not alphanumeric)", match: "Matched pair" },
};

export default algorithm;
