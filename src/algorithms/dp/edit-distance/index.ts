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

const FORMULA = "equal ? dp[i−1][j−1] : 1 + min( replace dp[i−1][j−1], delete dp[i−1][j], insert dp[i][j−1] )";

function* generate({ a, b }: Input) {
  const t = new Tracer<DPState>();
  const m = a.length;
  const n = b.length;
  const dp: (number | null)[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(null));
  const ops: [string, string, string][] = [];
  const state = (arrows: DPState["arrows"] = [], result?: number): DPState => ({
    formula: FORMULA,
    table: { rows: dp, rowLabels: ["∅", ...a.split("").map((ch, i) => `${i + 1} ${ch}`)], colLabels: ["∅", ...b.split("")] },
    arrows,
    array: ops.length
      ? {
          rows: [
            { label: a ? `"${a}"` : "a", values: ops.map((o) => o[1]), hideIndex: true },
            { label: "op", values: ops.map((o) => o[0]), hideIndex: true },
            { label: b ? `"${b}"` : "b", values: ops.map((o) => o[2]), hideIndex: true },
          ],
          caption: "alignment: = keep · R replace · D delete · I insert",
        }
      : undefined,
    result,
  });

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  yield t.step("base-col", `Column 0: turning "${a.slice(0, m) || ""}"'s prefixes into "" takes i deletions.`, { state: state(), vars: { m }, highlights: hl("found", ...Array.from({ length: m + 1 }, (_, i) => tc(i, 0))) });
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  yield t.step("base-row", `Row 0: building b's prefixes from "" takes j insertions.`, { state: state(), vars: { n }, highlights: hl("found", ...Array.from({ length: n + 1 }, (_, j) => tc(0, j))) });

  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++) {
      t.count("comparisons");
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
        yield t.step("same", `'${a[i - 1]}' = '${b[j - 1]}': nothing to edit, copy the diagonal → ${dp[i][j]}.`, {
          state: state([{ from: [i - 1, j - 1], to: [i, j] }]),
          vars: { i, j, "dp[i][j]": dp[i][j] },
          highlights: [...hl("found", tc(i - 1, j - 1)), ...hl("current", tc(i, j))],
        });
        continue;
      }
      const rep = dp[i - 1][j - 1]!;
      const del = dp[i - 1][j]!;
      const ins = dp[i][j - 1]!;
      const best = Math.min(rep, del, ins);
      dp[i][j] = 1 + best;
      const win = rep === best ? tc(i - 1, j - 1) : del === best ? tc(i - 1, j) : tc(i, j - 1);
      yield t.step("edit", `'${a[i - 1]}' ≠ '${b[j - 1]}': replace ${rep}, delete ${del}, insert ${ins} → 1 + ${best} = ${dp[i][j]}.`, {
        state: state([
          { from: [i - 1, j - 1], to: [i, j] },
          { from: [i - 1, j], to: [i, j] },
          { from: [i, j - 1], to: [i, j] },
        ]),
        vars: { i, j, replace: rep, delete: del, insert: ins, "dp[i][j]": dp[i][j] },
        highlights: [...hl("compare", tc(i - 1, j - 1), tc(i - 1, j), tc(i, j - 1)), ...hl("found", win), ...hl("current", tc(i, j))],
      });
    }

  let i = m;
  let j = n;
  const path: [number, number][] = [[i, j]];
  const pathHl = () => hl("path", ...path.map(([x, y]) => tc(x, y)));
  while (i > 0 || j > 0) {
    let op: [string, string, string];
    let msg: string;
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1] && dp[i][j] === dp[i - 1][j - 1]) {
      op = ["=", a[i - 1], b[j - 1]];
      msg = `'${a[i - 1]}' stays as it is`;
      i--;
      j--;
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1]! + 1) {
      op = ["R", a[i - 1], b[j - 1]];
      msg = `replace '${a[i - 1]}' with '${b[j - 1]}'`;
      i--;
      j--;
    } else if (i > 0 && dp[i][j] === dp[i - 1][j]! + 1) {
      op = ["D", a[i - 1], "-"];
      msg = `delete '${a[i - 1]}'`;
      i--;
    } else {
      op = ["I", "-", b[j - 1]];
      msg = `insert '${b[j - 1]}'`;
      j--;
    }
    ops.unshift(op);
    path.push([i, j]);
    yield t.step("align", `Walk back: ${msg}. Now at dp[${i}][${j}] = ${dp[i][j]}.`, { state: state(), vars: { i, j, op: op[0] }, highlights: [...pathHl(), ...hl("current", tc(i, j))] });
  }
  const edits = ops.filter((o) => o[0] !== "=").length;
  yield t.step("done", `Edit distance dp[${m}][${n}] = ${dp[m][n]} (${edits} edit${edits === 1 ? "" : "s"} in the alignment).`, {
    state: state([], dp[m][n]!),
    vars: { distance: dp[m][n] },
    highlights: [...pathHl(), ...hl("found", tc(m, n))],
  });
}

function reference({ a, b }: Input): number {
  // Memoised recursion from the front of both strings.
  const memo = new Map<string, number>();
  const go = (i: number, j: number): number => {
    if (i === a.length) return b.length - j;
    if (j === b.length) return a.length - i;
    const k = `${i},${j}`;
    if (memo.has(k)) return memo.get(k)!;
    const v = a[i] === b[j] ? go(i + 1, j + 1) : 1 + Math.min(go(i + 1, j + 1), go(i + 1, j), go(i, j + 1));
    memo.set(k, v);
    return v;
  };
  return go(0, 0);
}

const text = (key: string) => ({ key, label: key, kind: "text" as const, minLength: 0, maxLength: 9, pattern: /^[a-z]*$/, patternHint: "must be lowercase letters." });

const algorithm: AlgorithmModule<Input, DPState> = {
  ...meta,
  renderer: "dptable",
  inputSchema: { fields: [text("a"), text("b")] },
  presets: [
    { name: "LeetCode example: horse → ros", input: { a: "horse", b: "ros" } },
    { name: "LeetCode example: intention → execution", input: { a: "intention", b: "execution" } },
    { name: "Classic: kitten → sitting", input: { a: "kitten", b: "sitting" } },
    { name: "Edge case: from empty", input: { a: "", b: "abc" } },
    { name: "Edge case: identical", input: { a: "same", b: "same" } },
  ],
  randomInput: (size, rng = Math.random) => ({ a: randString(rng, randInt(rng, 0, Math.min(6, size)), "abc"), b: randString(rng, randInt(rng, 0, 6), "abc") }),
  code: { python, javascript },
  generate,
  reference,
  outputOf: (state) => state.result,
  info,
  legendLabels: { current: "Cell being filled", found: "Cheapest option / base case", compare: "Options", path: "Walk back (alignment)" },
};

export default algorithm;
