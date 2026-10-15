import type { AlgorithmModule } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { Box, qid, type SQItem, type SQState } from "../../_shared/stackqueue";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

type Version = "rec" | "tail" | "loop";

interface Input {
  n: number;
  limit: number;
  version: Version;
}

const OVERFLOW = "RecursionError";

/** Product 2·3·…·n with integers only (n ≤ 18 keeps it below 2^53). */
function factorial(n: number): number {
  let acc = 1;
  for (let k = 2; k <= n; k++) acc *= k;
  return acc;
}

function* generate({ n, limit, version }: Input) {
  Box.resetIds();
  const t = new Tracer<SQState>();
  const stack = new Box("call stack", "stack");

  const state = (result?: number | string): SQState => ({
    containers: [{ ...stack.view(`depth ${stack.size} / limit ${limit}`), itemWidth: 170 }],
    caption: version === "loop" ? `fact_loop(${n}) — one frame, a loop instead of recursion` : `${version === "rec" ? "fact" : "fact_tail"}(${n}) with a recursion limit of ${limit} frames`,
    result,
  });
  const top = (): SQItem => stack.top!;

  if (version === "loop") {
    let acc = 1;
    const frame = stack.push(`fact_loop(${n})`, "acc = 1");
    t.count("calls");
    yield t.step("loop-init", `One call, one frame: acc = 1. The loop will multiply in 2 … ${n} without calling anything.`, {
      state: state(),
      vars: { n, acc, depth: 1 },
      highlights: hl("current", qid(0, frame.id)),
    });
    for (let k = 2; k <= n; k++) {
      acc *= k;
      t.count("writes");
      frame.sub = `k = ${k}, acc = ${acc}`;
      yield t.step("loop-mul", `k = ${k}: acc = ${acc / k} × ${k} = ${acc}. Still a single frame — the stack never grows.`, {
        state: state(),
        vars: { n, k, acc, depth: 1 },
        highlights: hl("current", qid(0, frame.id)),
      });
    }
    frame.sub = `returns ${acc}`;
    yield t.step("loop-done", `Return ${acc} = ${n}!. Depth stayed at 1 frame: O(1) stack space, so no input can overflow it.`, {
      state: state(acc),
      vars: { n, result: acc, depth: 1 },
      highlights: hl("found", qid(0, frame.id)),
    });
    return;
  }

  const name = version === "rec" ? "fact" : "fact_tail";
  const p = version === "rec" ? "rec" : "tail";
  // Calls go down from n to the base case at 1 (or 0 when n = 0).
  let acc = 1;
  for (let k = n; ; k--) {
    if (stack.size === limit) {
      const err = stack.push(`${name}(${k}${version === "tail" ? `, ${acc}` : ""})`, "✗ no room");
      yield t.step(`${p}-call`, `Calling ${name}(${k}) would need frame ${stack.size}, but the limit is ${limit}: RecursionError (Python) / RangeError: Maximum call stack size exceeded (JavaScript).`, {
        state: state(),
        vars: { n, k, depth: stack.size, limit },
        highlights: [...hl("visited", ...stack.items.slice(0, -1).map((f) => qid(0, f.id))), ...hl("mismatch", qid(0, err.id))],
      });
      stack.items.length = 0;
      yield t.step(`${p}-call`, version === "rec"
          ? `The error unwinds every waiting frame: none of them gets to finish its multiplication. Use a loop (or a bigger limit) for deep inputs.`
          : `The error unwinds every frame. None of them had work left — each had already passed its factor down in acc — but without tail-call optimisation each call still costs a frame. Rewrite it as a loop.`, {
        state: state(OVERFLOW),
        vars: { n, result: OVERFLOW },
      });
      return;
    }
    const frame = stack.push(`${name}(${k}${version === "tail" ? `, ${acc}` : ""})`, `n = ${k}${version === "tail" ? `, acc = ${acc}` : ""}`);
    t.count("calls");
    if (k <= 1) {
      frame.sub = `base → ${version === "rec" ? 1 : acc}`;
      yield t.step(`${p}-base`, `${name}(${k}${version === "tail" ? `, ${acc}` : ""}) hits the base case at depth ${stack.size}: return ${version === "rec" ? 1 : acc}. Now the frames above it start returning.`, {
        state: state(),
        vars: { n: k, ...(version === "tail" ? { acc } : {}), depth: stack.size },
        highlights: [...hl("visited", ...stack.items.slice(0, -1).map((f) => qid(0, f.id))), ...hl("found", qid(0, frame.id))],
      });
      break;
    }
    if (version === "rec") {
      frame.sub = `n = ${k}, waits: ${k} × ?`;
      yield t.step("rec-call", `${name}(${k}) needs ${name}(${k - 1}) before it can multiply by ${k}, so it waits and a new frame goes on top (depth ${stack.size}).`, {
        state: state(),
        vars: { n: k, depth: stack.size },
        highlights: [...hl("visited", ...stack.items.slice(0, -1).map((f) => qid(0, f.id))), ...hl("current", qid(0, frame.id))],
      });
    } else {
      frame.sub = `n = ${k}, acc = ${acc} → call`;
      yield t.step("tail-call", `${name}(${k}, ${acc}) has nothing left to do after the call: it passes acc × n = ${acc * k} down. Python and JS still keep this frame (depth ${stack.size}) — no tail-call optimisation.`, {
        state: state(),
        vars: { n: k, acc, depth: stack.size },
        highlights: [...hl("visited", ...stack.items.slice(0, -1).map((f) => qid(0, f.id))), ...hl("current", qid(0, frame.id))],
      });
      acc *= k;
    }
  }

  // Unwind: pop frames, combining on the way back up.
  let value = version === "rec" ? 1 : acc;
  stack.pop();
  while (stack.size) {
    const frame = top();
    const k = n - stack.size + 1;
    if (version === "rec") {
      const prev = value;
      value = k * prev;
      t.count("writes");
      frame.sub = `${k} × ${prev} = ${value}`;
      yield t.step("rec-call", `Back in ${frame.label}: ${name}(${k - 1}) returned ${prev}, so return ${k} × ${prev} = ${value}. The work happens on the way back up.`, {
        state: state(),
        vars: { n: k, returned: prev, value, depth: stack.size },
        highlights: [...hl("visited", ...stack.items.slice(0, -1).map((f) => qid(0, f.id))), ...hl("current", qid(0, frame.id))],
      });
    } else {
      frame.sub = `passes ${value} up`;
      yield t.step("tail-call", `Back in ${frame.label}: it just hands ${value} to its caller — the frame did nothing but wait.`, {
        state: state(),
        vars: { n: k, value, depth: stack.size },
        highlights: [...hl("visited", ...stack.items.slice(0, -1).map((f) => qid(0, f.id))), ...hl("current", qid(0, frame.id))],
      });
    }
    stack.pop();
  }
  const depth = Math.max(n, 1);
  yield t.step(`${p}-call`, `${name}(${n}) = ${value}. The stack peaked at ${depth} frame${depth === 1 ? "" : "s"}: O(n) extra space, even though only one frame runs at a time.`, {
    state: state(value),
    vars: { n, result: value, "max depth": depth },
  });
}

function reference({ n, limit, version }: Input): number | string {
  if (version !== "loop" && Math.max(n, 1) > limit) return OVERFLOW;
  return factorial(n);
}

const algorithm: AlgorithmModule<Input, SQState> = {
  ...meta,
  renderer: "stackqueue",
  inputSchema: {
    fields: [
      { key: "n", label: "n", kind: "number", integer: true, min: 0, max: 18 },
      { key: "limit", label: "max depth", kind: "number", integer: true, min: 1, max: 20, help: "Simulated recursion limit (Python's default is 1000)." },
      {
        key: "version",
        label: "version",
        kind: "select",
        options: [
          { value: "rec", label: "recursive" },
          { value: "tail", label: "tail-recursive (acc)" },
          { value: "loop", label: "loop" },
        ],
      },
    ],
  },
  presets: [
    { name: "fact(5), recursive", input: { n: 5, limit: 10, version: "rec" } },
    { name: "Edge case: fact(0)", input: { n: 0, limit: 10, version: "rec" } },
    { name: "Stack overflow: fact(12), limit 8", input: { n: 12, limit: 8, version: "rec" } },
    { name: "Tail call still overflows", input: { n: 12, limit: 8, version: "tail" } },
    { name: "Loop: fact(12) in one frame", input: { n: 12, limit: 8, version: "loop" } },
  ],
  randomInput: (size, rng = Math.random) => ({
    n: randInt(rng, 0, Math.min(18, size + 2)),
    limit: randInt(rng, 2, 14),
    version: (["rec", "tail", "loop"] as const)[randInt(rng, 0, 2)],
  }),
  code: { python, javascript },
  generate,
  reference,
  outputOf: (s) => s.result,
  info,
  legendLabels: { current: "Running frame", visited: "Waiting frames", found: "Returning value", mismatch: "Frame that doesn't fit" },
};

export default algorithm;
