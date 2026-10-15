import type { AlgorithmModule } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { pick, randInt } from "../../../engine/random";
import { tc, type DPState } from "../../_shared/dp";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  s: string;
  words: string[];
}

const FORMULA = "dp[i] = any( dp[j] and s[j:i] ∈ words  for j < i ),   dp[0] = True";

function* generate({ s, words }: Input) {
  const t = new Tracer<DPState>();
  const n = s.length;
  const dict = new Set(words);
  const dp: boolean[] = [true, ...Array(n).fill(false)];
  const via: (number | null)[] = Array(n + 1).fill(null);
  const T = (b: boolean) => (b ? "T" : "F");

  // Row 0: letters, placed in the column where their prefix ends (column i holds s[i-1]); row 1: dp.
  const state = (filled: number, arrows: DPState["arrows"] = [], result?: boolean): DPState => ({
    formula: FORMULA,
    table: {
      rows: [["", ...s.split("")], dp.map((b, i) => (i <= filled ? T(b) : null))],
      rowLabels: ["s", "dp"],
      colLabels: dp.map((_, i) => String(i)),
    },
    arrows,
    caption: `words: ${words.join(", ")}`,
    result,
  });
  const letters = (j: number, i: number) => Array.from({ length: i - j }, (_, k) => tc(0, j + k + 1));

  yield t.step("init", `dp[0] = True: the empty prefix needs no words. Now decide each prefix length 1…${n}.`, { state: state(0), vars: { n }, highlights: hl("found", tc(1, 0)) });

  for (let i = 1; i <= n; i++) {
    let hit = false;
    for (let j = 0; j < i; j++) {
      if (!dp[j]) continue;
      const piece = s.slice(j, i);
      t.count("comparisons");
      t.count("hashes");
      if (dict.has(piece)) {
        dp[i] = true;
        via[i] = j;
        hit = true;
        t.count("writes");
        yield t.step("set", `Prefix length ${i}: dp[${j}] is True and "${piece}" is a word, so s[:${i}] = "${s.slice(0, i)}" splits. dp[${i}] = True (stop trying other j).`, {
          state: state(i, [{ from: [1, j], to: [1, i] }]),
          vars: { i, j, piece },
          highlights: [...hl("match", ...letters(j, i)), ...hl("found", tc(1, j)), ...hl("current", tc(1, i))],
        });
        break;
      }
      yield t.step("check", `Prefix length ${i}: dp[${j}] is True but "${piece}" isn't a word.`, {
        state: state(i - 1, [{ from: [1, j], to: [1, i] }]),
        vars: { i, j, piece },
        highlights: [...hl("mismatch", ...letters(j, i)), ...hl("compare", tc(1, j)), ...hl("current", tc(1, i))],
      });
    }
    if (!hit)
      yield t.step("check", `No split point works for "${s.slice(0, i)}": dp[${i}] = False.`, { state: state(i), vars: { i }, highlights: hl("mismatch", tc(1, i)) });
  }

  const path: number[] = [];
  if (dp[n]) for (let i: number | null = n; i !== null && i > 0; i = via[i]) path.push(i);
  const pieces: string[] = [];
  for (let k = path.length - 1, from = 0; k >= 0; k--) {
    pieces.push(s.slice(from, path[k]));
    from = path[k];
  }
  yield t.step(
    "done",
    dp[n] ? `dp[${n}] = True: "${s}" = ${pieces.map((p) => `"${p}"`).join(" + ")}.` : `dp[${n}] = False: "${s}" can't be split into these words.`,
    { state: state(n, [], dp[n]), vars: { result: dp[n] }, highlights: dp[n] ? hl("path", tc(1, 0), ...path.map((i) => tc(1, i))) : hl("mismatch", tc(1, n)) },
  );
}

function reference({ s, words }: Input): boolean {
  // Plain recursion with memo on the start index.
  const memo = new Map<number, boolean>();
  const go = (start: number): boolean => {
    if (start === s.length) return true;
    if (memo.has(start)) return memo.get(start)!;
    const ok = words.some((w) => s.startsWith(w, start) && go(start + w.length));
    memo.set(start, ok);
    return ok;
  };
  return go(0);
}

const algorithm: AlgorithmModule<Input, DPState> = {
  ...meta,
  renderer: "dptable",
  inputSchema: {
    fields: [
      { key: "s", label: "s", kind: "text", minLength: 0, maxLength: 12, pattern: /^[a-z]*$/, patternHint: "must be lowercase letters." },
      { key: "words", label: "dictionary", kind: "words", maxLength: 8, pattern: /^[a-z]{1,8}$/, patternHint: "words must be 1–8 lowercase letters." },
    ],
  },
  presets: [
    { name: "LeetCode example: leetcode", input: { s: "leetcode", words: ["leet", "code"] } },
    { name: "Several words: applepenapp", input: { s: "applepenapp", words: ["apple", "pen", "app"] } },
    { name: "No split: catsandog", input: { s: "catsandog", words: ["cats", "dog", "sand", "and", "cat"] } },
    { name: "Greedy trap: aaaaaaa", input: { s: "aaaaaaa", words: ["aaaa", "aaa"] } },
    { name: "Edge case: empty string", input: { s: "", words: ["a"] } },
  ],
  randomInput: (size, rng = Math.random) => {
    const words = [...new Set(Array.from({ length: randInt(rng, 1, 4) }, () => Array.from({ length: randInt(rng, 1, 3) }, () => pick(rng, ["a", "b"])).join("")))];
    let s = "";
    while (s.length < Math.min(10, size + 2)) s += rng() < 0.85 ? pick(rng, words) : pick(rng, ["a", "b"]);
    return { s: s.slice(0, 12), words };
  },
  code: { python, javascript },
  generate,
  reference,
  outputOf: (state) => state.result,
  info,
  legendLabels: { current: "dp[i] being decided", found: "Working split point", compare: "Split point tried", match: "Dictionary word", mismatch: "Not a word / False", path: "Chosen split points" },
};

export default algorithm;
