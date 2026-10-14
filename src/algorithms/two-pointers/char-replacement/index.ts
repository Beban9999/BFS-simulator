import type { AlgorithmModule } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt, randString } from "../../../engine/random";
import { ai, range, type ArrayState } from "../../_shared/array";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  s: string;
  k: number;
}

function* generate({ s, k }: Input) {
  const t = new Tracer<ArrayState>();
  const count = new Map<string, number>();
  let left = 0;
  let maxFreq = 0;
  let best = 0;
  let bestL = 0;
  const state = (right: number, result?: number): ArrayState => ({
    rows: [{ values: [...s] }],
    pointers: right >= 0 && right < s.length ? [{ name: "left", index: left }, { name: "right", index: right }] : [],
    ranges: [
      ...(best ? [{ from: bestL, to: bestL + best - 1, kind: "found" as const, label: `best = ${best}` }] : []),
      ...(right >= left && right < s.length ? [{ from: left, to: right, kind: "window" as const }] : []),
    ],
    caption: `k = ${k} changes allowed`,
    result,
  });
  const aux = () => [{ label: "count", kind: "map" as const, items: [...count.entries()].filter(([, c]) => c > 0).sort(([a], [b]) => a.localeCompare(b)) }];
  const win = (right: number) => hl("window", ...range(Math.max(0, right - left + 1)).map((d) => ai(left + d)));

  yield t.step("init", "Empty window, no counts yet.", { state: state(-1), vars: { left, max_freq: maxFreq, best }, aux: aux() });

  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    count.set(ch, (count.get(ch) ?? 0) + 1);
    maxFreq = Math.max(maxFreq, count.get(ch)!);
    const len = right - left + 1;
    yield t.step("expand", `Add '${ch}' (count ${count.get(ch)}). Window length ${len}, max_freq ${maxFreq} → ${len - maxFreq} change${len - maxFreq === 1 ? "" : "s"} needed.`, {
      state: state(right),
      vars: { left, right, length: len, max_freq: maxFreq, "changes needed": len - maxFreq, best },
      aux: aux(),
      highlights: [...win(right), ...hl("current", ai(right))],
    });
    t.count("comparisons");
    if (len - maxFreq > k) {
      const out = s[left];
      count.set(out, count.get(out)! - 1);
      left++;
      yield t.step("shrink", `${len - maxFreq} > k = ${k}: too many changes. Slide the window — drop '${out}' on the left (the length stays ${right - left + 1}).`, {
        state: state(right),
        vars: { left, right, max_freq: maxFreq, best },
        aux: aux(),
        highlights: [...win(right), ...hl("removed", ai(left - 1))],
      });
    }
    if (right - left + 1 > best) {
      best = right - left + 1;
      bestL = left;
      yield t.step("update", `The window grew to length ${best} without needing more than ${k} change${k === 1 ? "" : "s"}: best = ${best}.`, {
        state: state(right),
        vars: { left, right, best },
        aux: aux(),
        highlights: hl("found", ...range(best).map((d) => ai(bestL + d))),
      });
    }
  }

  yield t.step("done", `Longest window that can become one repeated letter with ≤ ${k} change${k === 1 ? "" : "s"}: ${best}.`, {
    state: state(-1, best),
    vars: { best },
    aux: aux(),
    highlights: hl("found", ...range(best).map((d) => ai(bestL + d))),
  });
}

function reference({ s, k }: Input): number {
  let best = 0;
  for (let i = 0; i < s.length; i++) {
    const c = new Map<string, number>();
    let mx = 0;
    for (let j = i; j < s.length; j++) {
      c.set(s[j], (c.get(s[j]) ?? 0) + 1);
      mx = Math.max(mx, c.get(s[j])!);
      if (j - i + 1 - mx <= k) best = Math.max(best, j - i + 1);
    }
  }
  return best;
}

const algorithm: AlgorithmModule<Input, ArrayState> = {
  ...meta,
  renderer: "array",
  inputSchema: {
    fields: [
      { key: "s", label: "s", kind: "text", maxLength: 24, pattern: /^[A-Z]*$/, patternHint: "must use uppercase letters A–Z only." },
      { key: "k", label: "k", kind: "number", integer: true, min: 0, max: 24 },
    ],
  },
  presets: [
    { name: "LeetCode example", input: { s: "AABABBA", k: 1 } },
    { name: "Two changes", input: { s: "ABAB", k: 2 } },
    { name: "Edge case: k = 0", input: { s: "AAABBBBCC", k: 0 } },
    { name: "Longer string", input: { s: "BAAACAABBABAAAC", k: 2 } },
  ],
  randomInput: (size, rng = Math.random) => ({ s: randString(rng, Math.max(1, Math.min(20, size + 3)), "ABC"), k: randInt(rng, 0, 3) }),
  code: { python, javascript },
  generate,
  reference,
  outputOf: (st) => st.result,
  info,
  legendLabels: { window: "Window", removed: "Dropped", current: "Added", found: "Best window" },
};

export default algorithm;
