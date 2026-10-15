import type { AlgorithmModule, Highlight } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { ai, range } from "../../_shared/array";
import { heapView, minFirst, siftDownEvents, siftUpEvents, tn, type HeapItem, type TreeState } from "../../_shared/tree";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  intervals: number[][];
}

/** A busy room: v = the time it frees up; `room` is its number (shown under the node). */
interface Busy extends HeapItem {
  room: number;
}

function* generate({ intervals }: Input) {
  const t = new Tracer<TreeState>();
  const order = range(intervals.length).sort((a, b) => intervals[a][0] - intervals[b][0] || intervals[a][1] - intervals[b][1]);
  const m = order.map((k) => intervals[k]);
  const roomOf: (number | null)[] = m.map(() => null);
  const h: Busy[] = [];
  let rooms = 0;
  let nextId = 0;

  const snap = (at: number | null, extra: Highlight[] = [], result?: number) => ({
    state: {
      trees: [heapView(h, "min-heap of end times (one per busy room)", { note: `rooms opened: ${rooms}`, showIndex: false })],
      array: {
        rows: [
          { label: "start", values: m.length ? m.map((x) => x[0]) : [""] },
          { label: "end", values: m.length ? m.map((x) => x[1]) : [""], hideIndex: true },
          { label: "room", values: roomOf.length ? roomOf.map((r) => (r === null ? "" : `R${r}`)) : [""], hideIndex: true },
        ],
        pointers: at === null ? [] : [{ name: "meeting", index: at, row: 2 }],
      },
      caption: "Meetings sorted by start time",
      result,
    },
    vars: { meeting: at === null ? "—" : `[${m[at][0]}, ${m[at][1]})`, "ends[0]": h.length ? h[0].v : "—", rooms },
    highlights: extra,
  });

  yield t.step("sort", `Sort the ${m.length} meeting${m.length === 1 ? "" : "s"} by start time.`, snap(null));
  yield t.step("init", "No room is busy yet: the heap of end times is empty.", snap(null));

  for (let i = 0; i < m.length; i++) {
    const [s, e] = m[i];
    const cur = hl("current", ai(i, 0), ai(i, 1));
    yield t.step("loop", `Meeting ${i}: from ${s} to ${e}.`, snap(i, cur));
    t.count("comparisons");
    let room: number;
    if (h.length && h[0].v <= s) {
      const free = h[0];
      yield t.step("check", `The earliest-ending room R${free.room} frees up at ${free.v} ≤ ${s}: it is free when this meeting starts.`, snap(i, [...cur, ...hl("match", tn(free.id))]));
      const last = h.pop()!;
      t.count("pops");
      if (h.length) {
        h[0] = last;
        for (const ev of siftDownEvents(h, 0, minFirst)) if (ev.type === "swap") t.count("swaps");
      }
      room = free.room;
      yield t.step("free", `Pop ${free.v}: room R${room} will be reused.`, snap(i, cur));
    } else {
      yield t.step(
        "check",
        h.length ? `Even the earliest-ending room R${h[0].room} is busy until ${h[0].v} > ${s}, so every room is busy: open a new one.` : "No rooms exist yet: open the first one.",
        snap(i, [...cur, ...(h.length ? hl("mismatch", tn(h[0].id)) : [])]),
      );
      room = ++rooms;
    }
    const it: Busy = { id: nextId++, v: e, room, sub: `R${room}` };
    h.push(it);
    roomOf[i] = room;
    t.count("pushes");
    for (const ev of siftUpEvents(h, h.length - 1, minFirst)) if (ev.type === "swap") t.count("swaps");
    yield t.step("book", `Push end time ${e}: room R${room} is busy until ${e}. ${h.length} room${h.length === 1 ? "" : "s"} in use.`, snap(i, [...hl("found", ai(i, 2)), ...hl("active", tn(it.id))]));
  }

  yield t.step("done", `The heap holds ${h.length} end time${h.length === 1 ? "" : "s"}: ${h.length} room${h.length === 1 ? " is" : "s are"} enough.`, snap(null, [], h.length));
}

const algorithm: AlgorithmModule<Input, TreeState> = {
  ...meta,
  renderer: "tree",
  inputSchema: {
    fields: [{ key: "intervals", label: "meetings (start end)", kind: "matrix", maxRows: 10, maxCols: 2, min: 0, max: 99, help: "One meeting per line: start end." }],
    validate: ({ intervals }) => {
      if (intervals.some((r) => r.length !== 2)) return "Each meeting needs exactly two numbers: start and end.";
      if (intervals.some(([s, e]) => !Number.isInteger(s) || !Number.isInteger(e))) return "Use whole numbers.";
      if (intervals.some(([s, e]) => s >= e)) return "Every meeting must end after it starts.";
      return null;
    },
  },
  presets: [
    { name: "LeetCode example: 2 rooms", input: { intervals: [[0, 30], [5, 10], [15, 20]] } },
    { name: "Back to back: rooms are reused", input: { intervals: [[1, 3], [3, 5], [5, 7], [7, 9]] } },
    { name: "Worst case: all overlap", input: { intervals: [[1, 10], [2, 9], [3, 8], [4, 7], [5, 6]] } },
    { name: "Mixed day", input: { intervals: [[9, 12], [9, 10], [10, 11], [11, 14], [12, 13], [13, 15], [14, 16]] } },
    { name: "Edge case: one meeting", input: { intervals: [[2, 4]] } },
  ],
  randomInput: (size, rng = Math.random) => ({
    intervals: Array.from({ length: Math.max(1, Math.min(10, size)) }, () => {
      const s = randInt(rng, 0, 20);
      return [s, s + randInt(rng, 1, 8)];
    }),
  }),
  code: { python, javascript },
  generate,
  reference: ({ intervals }) => {
    // Most meetings in progress at once: check every start time (half-open intervals).
    let best = 0;
    for (const [s] of intervals) best = Math.max(best, intervals.filter(([a, b]) => a <= s && s < b).length);
    return best;
  },
  outputOf: (s) => s.result,
  info,
  legendLabels: { current: "Current meeting", match: "Earliest room is free", mismatch: "Earliest room still busy", active: "Room booked", found: "Room assigned" },
};

export default algorithm;
