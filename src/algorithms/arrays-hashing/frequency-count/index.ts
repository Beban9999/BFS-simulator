import type { AlgorithmModule } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt, randString, shuffle } from "../../../engine/random";
import { ai, type ArrayState } from "../../_shared/array";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  s: string;
  t: string;
}

function* generate({ s, t }: Input) {
  const tr = new Tracer<ArrayState>();
  const count = new Map<string, number>();
  const rows = [
    { label: "s", values: [...s] },
    { label: "t", values: [...t] },
  ];
  const state = (pointers: ArrayState["pointers"] = [], result?: boolean): ArrayState => ({ rows, pointers, result });
  const aux = (hot?: string) => {
    const items = [...count.entries()].sort(([a], [b]) => a.localeCompare(b));
    return [{ label: "count", kind: "map" as const, items, highlight: hot ? [items.findIndex(([k]) => k === hot)] : undefined }];
  };

  if (s.length !== t.length) {
    yield tr.step("length", `Lengths differ (${s.length} vs ${t.length}), so they cannot be anagrams.`, {
      state: state([], false),
      vars: { "len(s)": s.length, "len(t)": t.length },
    });
    return;
  }
  yield tr.step("init", `Both strings have length ${s.length}. Start with an empty count map.`, {
    state: state(),
    vars: { "len(s)": s.length, "len(t)": t.length },
    aux: aux(),
  });

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    count.set(ch, (count.get(ch) ?? 0) + 1);
    tr.count("hashes");
    yield tr.step("inc", `s[${i}] = '${ch}': count['${ch}'] becomes ${count.get(ch)}.`, {
      state: state([{ name: "i", index: i, row: 0 }]),
      vars: { i, ch, [`count['${ch}']`]: count.get(ch) },
      aux: aux(ch),
      highlights: [...hl("visited", ...Array.from({ length: i }, (_, k) => ai(k, 0))), ...hl("current", ai(i, 0))],
    });
  }

  const doneS = hl("visited", ...Array.from({ length: s.length }, (_, k) => ai(k, 0)));
  for (let j = 0; j < t.length; j++) {
    const ch = t[j];
    count.set(ch, (count.get(ch) ?? 0) - 1);
    tr.count("hashes");
    const c = count.get(ch)!;
    const used = hl("match", ...Array.from({ length: j }, (_, k) => ai(k, 1)));
    if (c < 0) {
      yield tr.step("fail", `t[${j}] = '${ch}': count['${ch}'] drops to ${c}. t uses more '${ch}' than s has — not an anagram.`, {
        state: state([{ name: "j", index: j, row: 1 }], false),
        vars: { j, ch, [`count['${ch}']`]: c },
        aux: aux(ch),
        highlights: [...doneS, ...used, ...hl("mismatch", ai(j, 1))],
      });
      return;
    }
    yield tr.step("dec", `t[${j}] = '${ch}': spend one, count['${ch}'] = ${c} (still ≥ 0).`, {
      state: state([{ name: "j", index: j, row: 1 }]),
      vars: { j, ch, [`count['${ch}']`]: c },
      aux: aux(ch),
      highlights: [...doneS, ...used, ...hl("current", ai(j, 1))],
    });
  }

  yield tr.step("done", `Every letter of t was covered and all counts are back to 0: "${s}" and "${t}" are anagrams.`, {
    state: state([], true),
    aux: aux(),
    highlights: [...doneS, ...hl("match", ...Array.from({ length: t.length }, (_, k) => ai(k, 1)))],
  });
}

function reference({ s, t }: Input): boolean {
  return s.length === t.length && [...s].sort().join("") === [...t].sort().join("");
}

const textField = (key: string) => ({
  key,
  label: key,
  kind: "text" as const,
  maxLength: 16,
  pattern: /^[a-z]*$/,
  patternHint: "must use lowercase letters a–z only.",
});

const algorithm: AlgorithmModule<Input, ArrayState> = {
  ...meta,
  renderer: "array",
  inputSchema: { fields: [textField("s"), textField("t")] },
  presets: [
    { name: "LeetCode example", input: { s: "anagram", t: "nagaram" } },
    { name: "Not an anagram", input: { s: "rat", t: "car" } },
    { name: "Edge case: different lengths", input: { s: "abc", t: "abcd" } },
    { name: "Edge case: empty strings", input: { s: "", t: "" } },
  ],
  randomInput: (size, rng = Math.random) => {
    const n = Math.max(1, Math.min(12, size));
    const s = randString(rng, n, "abcde");
    const t = rng() < 0.5 ? shuffle(rng, [...s]).join("") : randString(rng, randInt(rng, n - 1, n), "abcde");
    return { s, t };
  },
  code: { python, javascript },
  generate,
  reference,
  outputOf: (st) => st.result,
  info,
  legendLabels: { visited: "Counted", match: "Matched" },
};

export default algorithm;
