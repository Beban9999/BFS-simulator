import type { AlgorithmModule, Highlight } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt, shuffle } from "../../../engine/random";
import { ai, range } from "../../_shared/array";
import { Box, qid, type SQState } from "../../_shared/stackqueue";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  target: number;
  position: number[];
  speed: number[];
}

/** Arrival time as an exact fraction [distance, speed]; decimals are for display only. */
type Time = [number, number];
const le = (a: Time, b: Time) => a[0] * b[1] <= b[0] * a[1];
const fmt = ([d, s]: Time) => {
  const whole = d % s === 0;
  return whole ? String(d / s) : (Math.round((d / s) * 100) / 100).toFixed(2);
};

function* generate({ target, position, speed }: Input) {
  const t = new Tracer<SQState>();
  Box.resetIds();
  const n = position.length;
  const order = range(n).sort((a, b) => position[b] - position[a]);
  const times: Time[] = order.map((k) => [target - position[k], speed[k]]);
  const shown: string[] = Array(n).fill("");
  const fleetOf: (number | null)[] = Array(n).fill(null);
  const stack = new Box("fleets (arrival time)");
  const stackTimes: Time[] = [];

  const snap = (c: number | null, extra: Highlight[] = [], result?: number) => ({
    state: {
      array: {
        rows: [
          { label: "position", values: order.map((k) => position[k]) },
          { label: "speed", values: order.map((k) => speed[k]), hideIndex: true },
          { label: "time", values: shown.slice(), hideIndex: true },
          { label: "fleet", values: fleetOf.map((f) => (f === null ? "" : `#${f}`)), hideIndex: true },
        ],
        pointers: c === null ? [] : [{ name: "car", index: c, row: 3 }],
      },
      containers: [stack.view(`${stack.size} fleet${stack.size === 1 ? "" : "s"}`)],
      caption: `target = ${target} · cars sorted from the target backwards`,
      result,
    },
    vars: { car: c === null ? "—" : `pos ${position[order[c]]}, speed ${speed[order[c]]}`, "t": c === null || !shown[c] ? "—" : shown[c], "stack top": stack.top?.label ?? "—" },
    highlights: extra,
  });

  yield t.step("sort", `Sort the ${n} car${n === 1 ? "" : "s"} by position, closest to the target (${target}) first: ${order.map((k) => position[k]).join(", ")}.`, snap(null));
  yield t.step("init", "No fleets yet. Each fleet will be represented by the time it reaches the target.", snap(null));

  for (let c = 0; c < n; c++) {
    const k = order[c];
    shown[c] = fmt(times[c]);
    t.count("accesses");
    yield t.step(
      "time",
      `Car at ${position[k]} with speed ${speed[k]} needs (${target} − ${position[k]}) / ${speed[k]} = ${shown[c]} time units alone.`,
      snap(c, hl("current", ai(c, 0), ai(c, 1), ai(c, 2))),
    );
    const top = stack.top;
    t.count("comparisons");
    if (top && le(times[c], stackTimes[stackTimes.length - 1])) {
      fleetOf[c] = stack.size;
      yield t.step(
        "merge",
        `${shown[c]} ≤ ${top.label}: it would arrive no later than the fleet ahead, so it catches up and joins fleet #${stack.size} (which still arrives at ${top.label}).`,
        snap(c, [...hl("match", ai(c, 2), ai(c, 3), qid(0, top.id))]),
      );
      continue;
    }
    yield t.step(
      "merge",
      top ? `${shown[c]} > ${top.label}: slower than the fleet ahead — it never catches up.` : "The stack is empty: this car leads the first fleet.",
      snap(c, [...hl("current", ai(c, 2)), ...(top ? hl("compare", qid(0, top.id)) : [])]),
    );
    const it = stack.push(shown[c], `pos ${position[k]}`);
    stackTimes.push(times[c]);
    fleetOf[c] = stack.size;
    t.count("pushes");
    yield t.step("push", `Push ${shown[c]}: fleet #${stack.size} starts with this car.`, snap(c, [...hl("active", qid(0, it.id)), ...hl("found", ai(c, 3))]));
  }

  yield t.step("done", `${stack.size} fleet${stack.size === 1 ? "" : "s"} arrive${stack.size === 1 ? "s" : ""} at the target.`, snap(null, [], stack.size));
}

const algorithm: AlgorithmModule<Input, SQState> = {
  ...meta,
  renderer: "stackqueue",
  inputSchema: {
    fields: [
      { key: "target", label: "target", kind: "number", integer: true, min: 1, max: 30 },
      { key: "position", label: "position", kind: "numbers", integer: true, min: 0, max: 29, minLength: 1, maxLength: 8 },
      { key: "speed", label: "speed", kind: "numbers", integer: true, min: 1, max: 9, minLength: 1, maxLength: 8 },
    ],
    validate: ({ target, position, speed }) => {
      if (position.length !== speed.length) return "position and speed must have the same length.";
      if (position.some((p) => p >= target)) return "Every position must be smaller than target.";
      if (new Set(position).size !== position.length) return "Positions must be distinct.";
      return null;
    },
  },
  presets: [
    { name: "LeetCode example (3 fleets)", input: { target: 12, position: [10, 8, 0, 5, 3], speed: [2, 4, 1, 1, 3] } },
    { name: "Edge case: one car", input: { target: 10, position: [3], speed: [3] } },
    { name: "Everyone catches the leader", input: { target: 20, position: [0, 4, 8, 12], speed: [5, 4, 3, 2] } },
    { name: "Nobody catches anyone (back cars slower)", input: { target: 20, position: [0, 4, 8, 12], speed: [1, 2, 3, 4] } },
    { name: "Arriving exactly together merges", input: { target: 10, position: [0, 5], speed: [2, 1] } },
  ],
  randomInput: (size, rng = Math.random) => {
    const target = randInt(rng, 6, 30);
    const n = Math.max(1, Math.min(8, size, target));
    const position = shuffle(rng, range(target)).slice(0, n);
    return { target, position, speed: position.map(() => randInt(rng, 1, 5)) };
  },
  code: { python, javascript },
  generate,
  reference: ({ target, position, speed }) => {
    // Simulate in exact arithmetic: a car's effective arrival is the max of its own time and the effective time of the car ahead.
    const cars = position.map((p, i) => [p, speed[i]]).sort((a, b) => b[0] - a[0]);
    let fleets = 0;
    let slow: Time | null = null;
    for (const [p, s] of cars) {
      const tm: Time = [target - p, s];
      if (slow === null || !le(tm, slow)) {
        fleets++;
        slow = tm;
      }
    }
    return fleets;
  },
  outputOf: (s) => s.result,
  info,
  legendLabels: { current: "Current car", match: "Catches up: joins the fleet", compare: "Fleet ahead (too fast to catch)", active: "New fleet", found: "Fleet number" },
};

export default algorithm;
