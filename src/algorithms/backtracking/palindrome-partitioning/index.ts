import type { AlgorithmModule, Frame, Highlight, Step } from "../../../engine/types";
import { Tracer } from "../../../engine/trace";
import { randInt, randString } from "../../../engine/random";
import { ai } from "../../_shared/array";
import { DecisionTree, type DecisionState } from "../../_shared/decision";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  s: string;
}

const isPal = (t: string) => t === [...t].reverse().join("");
const fmt = (xs: string[]) => `[${xs.map((x) => `"${x}"`).join(", ")}]`;

function* generate({ s }: Input) {
  const t = new Tracer<DecisionState>();
  const n = s.length;
  const dt = new DecisionTree("∅", `"${s}"`, 80);
  const res: string[][] = [];
  const path: string[] = [];
  const frames: Frame[] = [];

  const state = (start: number | null, end: number | null, done = false): DecisionState => ({
    tree: dt.view(),
    array: {
      rows: [{ label: "s", values: n ? s.split("") : ["–"] }],
      ranges: [
        ...path.reduce<{ at: number; r: { from: number; to: number; kind: "sorted"; label: string }[] }>(
          (acc, p) => ({ at: acc.at + p.length, r: [...acc.r, { from: acc.at, to: acc.at + p.length - 1, kind: "sorted", label: p }] }),
          { at: 0, r: [] },
        ).r,
        ...(start !== null && end !== null ? [{ from: start, to: end - 1, kind: "window" as const, label: "piece" }] : []),
      ],
    },
    caption: `path ${fmt(path)}`,
    result: done ? res : undefined,
  });
  const aux = (hi?: number) => [{ label: `partitions (${res.length})`, kind: "list" as const, items: res.map((p) => p.join(" | ")), highlight: hi === undefined ? [] : [hi] }];

  function* backtrack(start: number): Generator<Step<DecisionState>, void> {
    frames.push({ call: `backtrack(start=${start})`, locals: { path: fmt(path) } });
    t.count("calls");
    if (start === n) {
      res.push(path.slice());
      dt.found();
      yield t.step("record", `start reached the end: ${fmt(path)} covers the whole string. Record it (#${res.length}).`, {
        state: state(null, null),
        vars: { start, path: fmt(path) },
        callStack: frames,
        aux: aux(res.length - 1),
        highlights: dt.marks(),
      });
      frames.pop();
      return;
    }
    for (let end = start + 1; end <= n; end++) {
      const piece = s.slice(start, end);
      t.count("comparisons");
      const range: Highlight[] = Array.from({ length: end - start }, (_, k) => ({ id: ai(start + k), kind: "compare" as const }));
      if (!isPal(piece)) {
        dt.prune(piece, `"${piece}" is not a palindrome`);
        yield t.step("check", `s[${start}:${end}] = "${piece}" reads "${[...piece].reverse().join("")}" backwards: not a palindrome. Skip this cut.`, {
          state: state(start, end),
          vars: { start, end, piece },
          callStack: frames,
          aux: aux(),
          highlights: [...dt.marks(), ...range.map((h) => ({ ...h, kind: "mismatch" as const }))],
        });
        continue;
      }
      path.push(piece);
      dt.enter(dt.child(piece, fmt(path)));
      yield t.step("choose", `s[${start}:${end}] = "${piece}" is a palindrome: take it as the next piece → ${fmt(path)}; continue from ${end}.`, {
        state: state(start, end),
        vars: { start, end, piece },
        callStack: frames,
        aux: aux(),
        highlights: [...dt.marks(), ...range.map((h) => ({ ...h, kind: "match" as const }))],
      });
      yield* backtrack(end);
      path.pop();
      dt.finish("done");
      yield t.step("unchoose", `Back: remove "${piece}" → ${fmt(path)} and try a longer piece from ${start}.`, {
        state: state(null, null),
        vars: { start, end },
        callStack: frames,
        aux: aux(),
        highlights: dt.marks(),
      });
    }
    frames.pop();
  }

  yield* backtrack(0);
  yield t.step("done", `Done: ${res.length} palindrome partition${res.length === 1 ? "" : "s"} of "${s}".`, { state: state(null, null, true), vars: { count: res.length }, callStack: [], aux: aux(), highlights: dt.marks() });
}

function reference({ s }: Input): string[][] {
  // Every set of cut positions (bitmask), kept when all pieces are palindromes, ordered like the recursion.
  const n = s.length;
  if (!n) return [[]];
  const out: string[][] = [];
  for (let m = 0; m < 1 << (n - 1); m++) {
    const pieces: string[] = [];
    let from = 0;
    for (let i = 1; i <= n; i++)
      if (i === n || (m >> (i - 1)) & 1) {
        pieces.push(s.slice(from, i));
        from = i;
      }
    if (pieces.every(isPal)) out.push(pieces);
  }
  // Recursion order: shorter first piece first, then recursively the same for the rest.
  return out.sort((a, b) => {
    for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i].length !== b[i].length) return a[i].length - b[i].length;
    return 0;
  });
}

const algorithm: AlgorithmModule<Input, DecisionState> = {
  ...meta,
  renderer: "decisiontree",
  inputSchema: { fields: [{ key: "s", label: "s", kind: "text", minLength: 0, maxLength: 7, pattern: /^[a-z]*$/, patternHint: "must be lowercase letters." }] },
  presets: [
    { name: "LeetCode example: aab", input: { s: "aab" } },
    { name: "Nested palindromes: abba", input: { s: "abba" } },
    { name: "Worst case: aaaa (every cut works)", input: { s: "aaaa" } },
    { name: "Edge case: no long palindromes (abc)", input: { s: "abc" } },
    { name: "Mixed: racecar", input: { s: "racecar" } },
  ],
  randomInput: (size, rng = Math.random) => ({ s: randString(rng, randInt(rng, 1, Math.max(1, Math.min(6, size))), "ab") }),
  code: { python, javascript },
  generate,
  reference,
  outputOf: (state) => state.result,
  info,
  legendLabels: { found: "Complete partition", visited: "Finished branch", active: "Current path", current: "Current call", pruned: "Not a palindrome", sorted: "Pieces so far", window: "Candidate piece", match: "Palindrome", mismatch: "Not a palindrome" },
};

export default algorithm;
