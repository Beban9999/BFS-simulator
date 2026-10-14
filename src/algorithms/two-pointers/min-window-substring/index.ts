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
  t: string;
}

function* generate({ s, t: target }: Input) {
  const t = new Tracer<ArrayState>();
  const need = new Map<string, number>();
  for (const ch of target) need.set(ch, (need.get(ch) ?? 0) + 1);
  const have = new Map<string, number>();
  let formed = 0;
  const required = need.size;
  let best: [number, number, number] = [Infinity, 0, 0];
  let left = 0;

  const state = (right: number, result?: string): ArrayState => ({
    rows: [{ values: [...s] }],
    pointers: right >= 0 && right < s.length ? [{ name: "left", index: left }, { name: "right", index: right }] : [],
    ranges: [
      ...(best[0] < Infinity ? [{ from: best[1], to: best[2], kind: "found" as const, label: `best = ${best[0]}` }] : []),
      ...(right >= left && right < s.length ? [{ from: left, to: right, kind: "window" as const }] : []),
    ],
    caption: `t = "${target}" · formed ${formed} / ${required}`,
    result,
  });
  const aux = () => [
    { label: "need", kind: "map" as const, items: [...need.entries()].sort(([a], [b]) => a.localeCompare(b)) },
    { label: "have (letters of t only)", kind: "map" as const, items: [...have.entries()].filter(([c]) => need.has(c)).sort(([a], [b]) => a.localeCompare(b)) },
  ];
  const win = (right: number) => hl("window", ...range(Math.max(0, right - left + 1)).map((d) => ai(left + d)));
  const vars = (right: number) => ({ left, right, formed, required, best: best[0] === Infinity ? "∞" : best[0] });

  yield t.step("init", `Need ${[...need.entries()].map(([c, n]) => `${c}×${n}`).join(", ")} — ${required} distinct letter${required === 1 ? "" : "s"} to satisfy.`, {
    state: state(-1),
    vars: vars(-1),
    aux: aux(),
  });

  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    have.set(ch, (have.get(ch) ?? 0) + 1);
    const justMet = need.has(ch) && have.get(ch) === need.get(ch);
    if (justMet) formed++;
    yield t.step(justMet ? "formed" : "expand", justMet ? `Add '${ch}': its requirement (${need.get(ch)}) is now met. formed = ${formed}/${required}.` : `Add '${ch}'.${need.has(ch) ? ` have['${ch}'] = ${have.get(ch)} of ${need.get(ch)} needed.` : " Not in t."}`, {
      state: state(right),
      vars: vars(right),
      aux: aux(),
      highlights: [...win(right), ...hl("current", ai(right))],
    });

    while (formed === required) {
      t.count("comparisons");
      const len = right - left + 1;
      if (len < best[0]) {
        best = [len, left, right];
        yield t.step("update", `The window "${s.slice(left, right + 1)}" covers t. Length ${len} is the new best. Try shrinking.`, {
          state: state(right),
          vars: vars(right),
          aux: aux(),
          highlights: hl("found", ...range(len).map((d) => ai(left + d))),
        });
      } else {
        yield t.step("covered", `The window "${s.slice(left, right + 1)}" still covers t (length ${len}, not better). Keep shrinking.`, {
          state: state(right),
          vars: vars(right),
          aux: aux(),
          highlights: win(right),
        });
      }
      const out = s[left];
      have.set(out, have.get(out)! - 1);
      const lost = need.has(out) && have.get(out)! < need.get(out)!;
      if (lost) formed--;
      left++;
      yield t.step(lost ? "lost" : "shrink", lost ? `Drop '${out}': now short of '${out}', so formed = ${formed}. Expand again.` : `Drop '${out}' — still covering t without it.`, {
        state: state(right),
        vars: vars(right),
        aux: aux(),
        highlights: [...win(right), ...hl("removed", ai(left - 1))],
      });
    }
  }

  const answer = best[0] === Infinity ? "" : s.slice(best[1], best[2] + 1);
  yield t.step("done", answer ? `Minimum window: "${answer}" (length ${best[0]}).` : `No window of s contains all of "${target}".`, {
    state: state(-1, answer),
    vars: vars(-1),
    aux: aux(),
    highlights: answer ? hl("found", ...range(best[0]).map((d) => ai(best[1] + d))) : [],
  });
}

function reference({ s, t }: Input): string {
  const need = new Map<string, number>();
  for (const ch of t) need.set(ch, (need.get(ch) ?? 0) + 1);
  let best = "";
  for (let i = 0; i < s.length; i++) {
    const have = new Map<string, number>();
    for (let j = i; j < s.length; j++) {
      have.set(s[j], (have.get(s[j]) ?? 0) + 1);
      if ([...need].every(([c, n]) => (have.get(c) ?? 0) >= n)) {
        if (!best || j - i + 1 < best.length) best = s.slice(i, j + 1);
        break;
      }
    }
  }
  return best;
}

const field = (key: string, max: number) => ({ key, label: key, kind: "text" as const, minLength: 1, maxLength: max, pattern: /^[A-Za-z]*$/, patternHint: "must use letters only." });

const algorithm: AlgorithmModule<Input, ArrayState> = {
  ...meta,
  renderer: "array",
  inputSchema: { fields: [field("s", 24), field("t", 6)] },
  presets: [
    { name: "LeetCode example", input: { s: "ADOBECODEBANC", t: "ABC" } },
    { name: "Repeated letters in t", input: { s: "aaflslflsldkalskaaa", t: "aaa" } },
    { name: "Edge case: impossible", input: { s: "a", t: "aa" } },
    { name: "Edge case: whole string", input: { s: "abc", t: "cba" } },
  ],
  randomInput: (size, rng = Math.random) => ({ s: randString(rng, Math.max(1, Math.min(20, size + 4)), "abcd"), t: randString(rng, randInt(rng, 1, 3), "abc") }),
  code: { python, javascript },
  generate,
  reference,
  outputOf: (st) => st.result,
  info,
  legendLabels: { window: "Window", removed: "Dropped", current: "Added", found: "Best window" },
};

export default algorithm;
