import type { AlgorithmModule } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt, randString } from "../../../engine/random";
import { tc, type DPState } from "../../_shared/dp";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  a: string;
  b: string;
}

const FORMULA = "a[i−1] == b[j−1] ? dp[i−1][j−1] + 1 : max(dp[i−1][j], dp[i][j−1])";

function* generate({ a, b }: Input) {
  const t = new Tracer<DPState>();
  const m = a.length;
  const n = b.length;
  const dp: (number | null)[][] = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => (i === 0 || j === 0 ? 0 : null)));
  const state = (arrows: DPState["arrows"] = [], result?: number, caption?: string): DPState => ({
    formula: FORMULA,
    table: { rows: dp, rowLabels: ["∅", ...a.split("").map((ch, i) => `${i + 1} ${ch}`)], colLabels: ["∅", ...b.split("").map((ch) => ch)] },
    arrows,
    caption,
    result,
  });

  yield t.step("init", `Row 0 and column 0 compare against an empty prefix: LCS length 0. Fill the rest row by row.`, { state: state(), vars: { m, n } });
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++) {
      t.count("comparisons");
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]! + 1;
        yield t.step("match", `a[${i - 1}] = '${a[i - 1]}' equals b[${j - 1}] = '${b[j - 1]}': extend the diagonal, ${dp[i - 1][j - 1]} + 1 = ${dp[i][j]}.`, {
          state: state([{ from: [i - 1, j - 1], to: [i, j] }]),
          vars: { i, j, "dp[i][j]": dp[i][j] },
          highlights: [...hl("found", tc(i - 1, j - 1)), ...hl("current", tc(i, j))],
        });
      } else {
        const up = dp[i - 1][j]!;
        const left = dp[i][j - 1]!;
        dp[i][j] = Math.max(up, left);
        yield t.step("skip", `'${a[i - 1]}' ≠ '${b[j - 1]}': best of dropping one — above ${up}, left ${left} → ${dp[i][j]}.`, {
          state: state([
            { from: [i - 1, j], to: [i, j] },
            { from: [i, j - 1], to: [i, j] },
          ]),
          vars: { i, j, up, left, "dp[i][j]": dp[i][j] },
          highlights: [...hl("compare", up >= left ? tc(i, j - 1) : tc(i - 1, j)), ...hl("found", up >= left ? tc(i - 1, j) : tc(i, j - 1)), ...hl("current", tc(i, j))],
        });
      }
    }

  let i = m;
  let j = n;
  const path: [number, number][] = [[i, j]];
  const taken: string[] = [];
  const pathHl = () => hl("path", ...path.map(([x, y]) => tc(x, y)));
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      taken.unshift(a[i - 1]);
      yield t.step("take", `Walk back: '${a[i - 1]}' matches here, so it is part of the LCS. Go diagonally.`, { state: state([], undefined, `LCS so far (from the end): "${taken.join("")}"`), vars: { i, j }, highlights: [...pathHl(), ...hl("match", tc(i, j))] });
      i--;
      j--;
    } else if (dp[i - 1][j]! >= dp[i][j - 1]!) {
      yield t.step("up", `Walk back: no match; the value came from above (${dp[i - 1][j]}). Drop '${a[i - 1]}'.`, { state: state([], undefined, `LCS so far (from the end): "${taken.join("")}"`), vars: { i, j }, highlights: pathHl() });
      i--;
    } else {
      yield t.step("left", `Walk back: no match; the value came from the left (${dp[i][j - 1]}). Drop '${b[j - 1]}'.`, { state: state([], undefined, `LCS so far (from the end): "${taken.join("")}"`), vars: { i, j }, highlights: pathHl() });
      j--;
    }
    path.push([i, j]);
  }
  yield t.step("done", `LCS length dp[${m}][${n}] = ${dp[m][n]}${dp[m][n] ? `: "${taken.join("")}"` : " — no common characters"}.`, {
    state: state([], dp[m][n]!, `LCS = "${taken.join("")}"`),
    vars: { length: dp[m][n] },
    highlights: [...pathHl(), ...hl("found", tc(m, n))],
  });
}

function reference({ a, b }: Input): number {
  // Brute force: the longest subsequence of the shorter string that is also a subsequence of the other.
  const [s, l] = a.length <= b.length ? [a, b] : [b, a];
  const isSub = (x: string) => {
    let k = 0;
    for (const ch of l) if (k < x.length && x[k] === ch) k++;
    return k === x.length;
  };
  let best = 0;
  for (let mask = 0; mask < 1 << s.length; mask++) {
    const sub = s.split("").filter((_, i) => (mask >> i) & 1).join("");
    if (sub.length > best && isSub(sub)) best = sub.length;
  }
  return best;
}

const text = (key: string) => ({ key, label: key, kind: "text" as const, minLength: 0, maxLength: 8, pattern: /^[a-z]*$/, patternHint: "must be lowercase letters." });

const algorithm: AlgorithmModule<Input, DPState> = {
  ...meta,
  renderer: "dptable",
  inputSchema: { fields: [text("a"), text("b")] },
  presets: [
    { name: "LeetCode example: abcde / ace", input: { a: "abcde", b: "ace" } },
    { name: "Classic: abcbdab / bdcaba", input: { a: "abcbdab", b: "bdcaba" } },
    { name: "Edge case: nothing in common", input: { a: "abc", b: "def" } },
    { name: "Edge case: empty string", input: { a: "", b: "abc" } },
  ],
  randomInput: (size, rng = Math.random) => ({ a: randString(rng, randInt(rng, 0, Math.min(7, size)), "abcd"), b: randString(rng, randInt(rng, 0, 7), "abcd") }),
  code: { python, javascript },
  generate,
  reference,
  outputOf: (state) => state.result,
  info,
  legendLabels: { current: "Cell being filled", found: "Value used", compare: "Smaller option", path: "Walk back", match: "Character in the LCS" },
};

export default algorithm;
