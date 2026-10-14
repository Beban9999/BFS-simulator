import type { AlgorithmModule } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randString } from "../../../engine/random";
import { ai, range, type ArrayState } from "../../_shared/array";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  s: string;
}

function* generate({ s }: Input) {
  const t = new Tracer<ArrayState>();
  const window = new Set<string>();
  let left = 0;
  let best = 0;
  let bestL = 0;
  const state = (right: number, result?: number): ArrayState => ({
    rows: [{ values: [...s].map((c) => (c === " " ? "␣" : c)) }],
    pointers: right >= 0 && right < s.length ? [{ name: "left", index: left }, { name: "right", index: right }] : [],
    ranges: [
      ...(best ? [{ from: bestL, to: bestL + best - 1, kind: "found" as const, label: `best = ${best}` }] : []),
      ...(right >= left && right < s.length ? [{ from: left, to: right, kind: "window" as const }] : []),
    ],
    result,
  });
  const aux = () => [{ label: "window (set)", kind: "set" as const, items: [...window] }];
  const win = (right: number) => hl("window", ...range(Math.max(0, right - left + 1)).map((d) => ai(left + d)));

  yield t.step("init", "Empty window: left = 0, best = 0.", { state: state(-1), vars: { left, best }, aux: aux() });

  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    while (window.has(ch)) {
      yield t.step("check", `'${ch}' is already in the window — adding it would create a repeat. Shrink from the left.`, {
        state: state(right),
        vars: { left, right, ch, best },
        aux: aux(),
        highlights: [...win(right - 1), ...hl("mismatch", ai(right), ai(s.indexOf(ch, left)))],
      });
      window.delete(s[left]);
      left++;
      yield t.step("shrink", `Remove '${s[left - 1]}' and move left to ${left}.`, {
        state: state(right),
        vars: { left, right, ch, best },
        aux: aux(),
        highlights: [...win(right - 1), ...hl("removed", ai(left - 1))],
      });
    }
    window.add(ch);
    t.count("comparisons");
    const len = right - left + 1;
    const improved = len > best;
    if (improved) {
      best = len;
      bestL = left;
    }
    yield t.step("update", `Add '${ch}'. Window "${s.slice(left, right + 1)}" has length ${len}${improved ? ` — new best.` : `; best stays ${best}.`}`, {
      state: state(right),
      vars: { left, right, ch, length: len, best },
      aux: aux(),
      highlights: [...win(right), ...hl("current", ai(right))],
    });
  }

  yield t.step("done", `Longest substring without repeating characters: "${s.slice(bestL, bestL + best)}" (length ${best}).`, {
    state: state(-1, best),
    vars: { best },
    aux: aux(),
    highlights: hl("found", ...range(best).map((d) => ai(bestL + d))),
  });
}

function reference({ s }: Input): number {
  let best = 0;
  for (let i = 0; i < s.length; i++) {
    const seen = new Set<string>();
    for (let j = i; j < s.length && !seen.has(s[j]); j++) {
      seen.add(s[j]);
      best = Math.max(best, j - i + 1);
    }
  }
  return best;
}

const algorithm: AlgorithmModule<Input, ArrayState> = {
  ...meta,
  renderer: "array",
  inputSchema: { fields: [{ key: "s", label: "s", kind: "text", maxLength: 24, pattern: /^[ -~]*$/, patternHint: "must use printable ASCII characters." }] },
  presets: [
    { name: "LeetCode example", input: { s: "abcabcbb" } },
    { name: "Repeat far back", input: { s: "pwwkew" } },
    { name: "Edge case: all the same", input: { s: "bbbbb" } },
    { name: "Edge case: empty string", input: { s: "" } },
    { name: "Long unique run", input: { s: "abcdeafghijb" } },
  ],
  randomInput: (size, rng = Math.random) => ({ s: randString(rng, Math.max(1, Math.min(20, size + 3)), "abcdef") }),
  code: { python, javascript },
  generate,
  reference,
  outputOf: (st) => st.result,
  info,
  legendLabels: { window: "Window", mismatch: "Repeated character", removed: "Removed", current: "Added", found: "Best window" },
};

export default algorithm;
