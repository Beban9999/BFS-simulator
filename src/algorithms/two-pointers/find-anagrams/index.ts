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
  p: string;
}

const sorted = (m: Map<string, number>) => [...m.entries()].filter(([, c]) => c > 0).sort(([a], [b]) => a.localeCompare(b));
const sameCounts = (a: Map<string, number>, b: Map<string, number>) => JSON.stringify(sorted(a)) === JSON.stringify(sorted(b));

function* generate({ s, p }: Input) {
  const t = new Tracer<ArrayState>();
  const k = p.length;
  const need = new Map<string, number>();
  for (const ch of p) need.set(ch, (need.get(ch) ?? 0) + 1);
  const window = new Map<string, number>();
  const result: number[] = [];
  const state = (right: number, res?: number[]): ArrayState => {
    const left = Math.max(0, right - k + 1);
    return {
      rows: [{ label: "s", values: [...s] }],
      pointers: right >= 0 && right < s.length ? [{ name: "right", index: right }] : [],
      ranges: [
        ...result.map((st) => ({ from: st, to: st + k - 1, kind: "found" as const, label: `@${st}` })),
        ...(right >= 0 && right < s.length ? [{ from: left, to: right, kind: "window" as const }] : []),
      ],
      caption: `p = "${p}" (k = ${k})`,
      result: res,
    };
  };
  const aux = () => [
    { label: "need (counts of p)", kind: "map" as const, items: sorted(need) },
    { label: "window counts", kind: "map" as const, items: sorted(window) },
  ];
  const win = (right: number) => hl("window", ...range(Math.min(k, right + 1)).map((d) => ai(right - d)));

  yield t.step("init", `Count p's letters: ${sorted(need).map(([c, n]) => `${c}×${n}`).join(", ") || "(empty)"}. The window starts empty.`, {
    state: state(-1),
    aux: aux(),
  });

  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    window.set(ch, (window.get(ch) ?? 0) + 1);
    yield t.step("add", `Add s[${right}] = '${ch}' to the window.`, {
      state: state(right),
      vars: { right, ch },
      aux: aux(),
      highlights: [...win(right), ...hl("current", ai(right))],
    });
    if (right >= k) {
      const out = s[right - k];
      window.set(out, window.get(out)! - 1);
      yield t.step("remove", `The window is longer than ${k}: drop s[${right - k}] = '${out}' from the left.`, {
        state: state(right),
        vars: { right, out },
        aux: aux(),
        highlights: [...win(right), ...hl("removed", ai(right - k))],
      });
    }
    if (right >= k - 1) {
      t.count("comparisons");
      if (sameCounts(window, need)) {
        result.push(right - k + 1);
        yield t.step("found", `Window "${s.slice(right - k + 1, right + 1)}" has exactly p's counts — anagram at index ${right - k + 1}.`, {
          state: state(right),
          vars: { right, start: right - k + 1, result: result.slice() },
          aux: aux(),
          highlights: hl("found", ...range(k).map((d) => ai(right - d))),
        });
      } else {
        yield t.step("compare", `Window "${s.slice(right - k + 1, right + 1)}" has different counts — not an anagram.`, {
          state: state(right),
          vars: { right, result: result.slice() },
          aux: aux(),
          highlights: win(right),
        });
      }
    }
  }

  yield t.step("done", result.length ? `Anagrams of "${p}" start at [${result.join(", ")}].` : `No anagram of "${p}" occurs in s.`, {
    state: state(-1, result.slice()),
    vars: { result },
    aux: aux(),
  });
}

function reference({ s, p }: Input): number[] {
  const key = (x: string) => [...x].sort().join("");
  const out: number[] = [];
  for (let i = 0; i + p.length <= s.length; i++) if (key(s.slice(i, i + p.length)) === key(p)) out.push(i);
  return out;
}

const field = (key: string, max: number, min = 0) => ({
  key,
  label: key,
  kind: "text" as const,
  minLength: min,
  maxLength: max,
  pattern: /^[a-z]*$/,
  patternHint: "must use lowercase letters a–z only.",
});

const algorithm: AlgorithmModule<Input, ArrayState> = {
  ...meta,
  renderer: "array",
  inputSchema: { fields: [field("s", 24), field("p", 6, 1)] },
  presets: [
    { name: "LeetCode example", input: { s: "cbaebabacd", p: "abc" } },
    { name: "Overlapping matches", input: { s: "abab", p: "ab" } },
    { name: "Edge case: p longer than s", input: { s: "ab", p: "abc" } },
    { name: "Repeated letters in p", input: { s: "aabaabaa", p: "aab" } },
  ],
  randomInput: (size, rng = Math.random) => ({ s: randString(rng, Math.max(1, Math.min(18, size + 4)), "abc"), p: randString(rng, randInt(rng, 1, 3), "abc") }),
  code: { python, javascript },
  generate,
  reference,
  outputOf: (st) => st.result,
  info,
  legendLabels: { window: "Window", removed: "Leaving", current: "Entering", found: "Anagram found" },
};

export default algorithm;
