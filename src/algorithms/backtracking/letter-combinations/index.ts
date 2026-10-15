import type { AlgorithmModule, Frame, Step } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt, randString } from "../../../engine/random";
import { ai } from "../../_shared/array";
import { DecisionTree, type DecisionState } from "../../_shared/decision";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  digits: string;
}

const KEYS: Record<string, string> = { "2": "abc", "3": "def", "4": "ghi", "5": "jkl", "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz" };

function* generate({ digits }: Input) {
  const t = new Tracer<DecisionState>();
  const n = digits.length;
  const dt = new DecisionTree("∅", `"${digits}"`, 90);
  const res: string[] = [];
  const path: string[] = [];
  const frames: Frame[] = [];

  const state = (i: number | null, done = false): DecisionState => ({
    tree: dt.view(),
    array: {
      rows: [
        { label: "digits", values: n ? digits.split("") : ["–"] },
        { label: "keys", values: n ? digits.split("").map((d) => KEYS[d]) : ["–"], hideIndex: true },
        { label: "path", values: path.length ? path : ["–"], hideIndex: true },
      ],
      pointers: i === null || i >= n ? [] : [{ name: "i", index: i }],
    },
    result: done ? res : undefined,
  });
  const aux = (hi?: number) => [{ label: `combinations (${res.length})`, kind: "list" as const, items: res.slice(), highlight: hi === undefined ? [] : [hi] }];
  const marks = () => [...dt.marks(), ...hl("active", ...path.map((_, k) => ai(k)))];

  if (!n) {
    yield t.step("empty", "No digits: return an empty list (not a list with one empty string).", { state: state(null, true), vars: {}, aux: aux(), highlights: [] });
    return;
  }

  function* backtrack(i: number): Generator<Step<DecisionState>, void> {
    frames.push({ call: `backtrack(${i})`, locals: { path: path.join("") } });
    t.count("calls");
    if (i === n) {
      res.push(path.join(""));
      dt.found();
      yield t.step("record", `One letter per digit: record "${path.join("")}" (#${res.length}).`, { state: state(i), vars: { i, path: path.join("") }, callStack: frames, aux: aux(res.length - 1), highlights: marks() });
      frames.pop();
      return;
    }
    yield t.step("loop", `Digit ${digits[i]} (position ${i}) offers "${KEYS[digits[i]]}": try each letter.`, {
      state: state(i),
      vars: { i, digit: digits[i] },
      callStack: frames,
      aux: aux(),
      highlights: [...marks(), ...hl("current", ai(i), ai(i, 1))],
    });
    for (const ch of KEYS[digits[i]]) {
      path.push(ch);
      dt.enter(dt.child(ch, path.join("")));
      yield t.step("choose", `Choose '${ch}' for digit ${digits[i]} → "${path.join("")}".`, { state: state(i), vars: { i, ch, path: path.join("") }, callStack: frames, aux: aux(), highlights: marks() });
      yield* backtrack(i + 1);
      path.pop();
      dt.finish("done");
      yield t.step("unchoose", `Back: remove '${ch}' → "${path.join("")}".`, { state: state(i), vars: { i, ch }, callStack: frames, aux: aux(), highlights: marks() });
    }
    frames.pop();
  }

  yield* backtrack(0);
  yield t.step("done", `Done: ${res.length} combination${res.length === 1 ? "" : "s"} (${digits.split("").map((d) => KEYS[d].length).join(" × ")}).`, {
    state: state(null, true),
    vars: { count: res.length },
    callStack: [],
    aux: aux(),
    highlights: dt.marks(),
  });
}

function reference({ digits }: Input): string[] {
  if (!digits) return [];
  return digits.split("").reduce<string[]>((acc, d) => acc.flatMap((p) => KEYS[d].split("").map((ch) => p + ch)), [""]);
}

const algorithm: AlgorithmModule<Input, DecisionState> = {
  ...meta,
  renderer: "decisiontree",
  inputSchema: { fields: [{ key: "digits", label: "digits", kind: "text", minLength: 0, maxLength: 3, pattern: /^[2-9]*$/, patternHint: "must use the digits 2–9." }] },
  presets: [
    { name: "LeetCode example: 23", input: { digits: "23" } },
    { name: "Single digit: 7 (four letters)", input: { digits: "7" } },
    { name: "Edge case: empty", input: { digits: "" } },
    { name: "Largest: 279 (36 combinations)", input: { digits: "279" } },
  ],
  randomInput: (size, rng = Math.random) => ({ digits: randString(rng, randInt(rng, 0, Math.min(3, size)), "23456789") }),
  code: { python, javascript },
  generate,
  reference,
  outputOf: (state) => state.result,
  info,
  legendLabels: { found: "Complete word", visited: "Finished branch", active: "Current path", current: "Current digit / call" },
};

export default algorithm;
