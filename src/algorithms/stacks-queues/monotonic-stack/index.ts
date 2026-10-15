import type { AlgorithmModule, Highlight } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { ai, numbersField, randomNumbers } from "../../_shared/array";
import { Box, qid, type SQState } from "../../_shared/stackqueue";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  temps: number[];
}

function* generate({ temps }: Input) {
  const t = new Tracer<SQState>();
  Box.resetIds();
  const n = temps.length;
  const answer: (number | null)[] = Array(n).fill(null);
  const stack = new Box("stack (index)");
  const idx = new Map<number, number>(); // item id -> index

  const snap = (i: number | null, extra: Highlight[] = [], result?: number[]) => ({
    state: {
      array: {
        rows: [
          { label: "temps", values: temps },
          { label: "answer", values: answer.map((a) => (a === null ? "" : a)), hideIndex: true },
        ],
        pointers: i === null || i >= n ? [] : [{ name: "i", index: i }],
      },
      containers: [stack.view(stack.size ? `waiting: ${stack.items.map((it) => idx.get(it.id)).join(", ")}` : "nobody waiting")],
      result,
    },
    vars: { i: i ?? "—", "temps[i]": i === null || i >= n ? "—" : temps[i], "top index": stack.top ? idx.get(stack.top.id)! : "—" },
    highlights: [...hl("sorted", ...answer.map((a, k) => (a !== null ? ai(k, 1) : null))), ...hl("window", ...stack.items.map((it) => ai(idx.get(it.id)!))), ...extra],
  });

  yield t.step("init", "Every answer starts unknown; the stack of days still waiting for a warmer day is empty.", snap(null));

  for (let i = 0; i < n; i++) {
    yield t.step("loop", `Day ${i}: ${temps[i]}°.`, snap(i, hl("current", ai(i))));
    while (true) {
      const top = stack.top;
      if (!top) {
        yield t.step("compare", "The stack is empty — nobody is waiting.", snap(i, hl("current", ai(i))));
        break;
      }
      const j = idx.get(top.id)!;
      t.count("comparisons");
      if (temps[j] >= temps[i]) {
        yield t.step(
          "compare",
          `Top is day ${j} at ${temps[j]}° — not colder than ${temps[i]}°, so it keeps waiting (and so does everyone below it, they are at least as warm).`,
          snap(i, [...hl("current", ai(i)), ...hl("compare", ai(j), qid(0, top.id))]),
        );
        break;
      }
      yield t.step("compare", `Top is day ${j} at ${temps[j]}° < ${temps[i]}°: day ${i} is the warmer day it was waiting for.`, snap(i, [...hl("current", ai(i)), ...hl("match", ai(j), qid(0, top.id))]));
      stack.pop();
      t.count("pops");
      answer[j] = i - j;
      t.count("writes");
      yield t.step("resolve", `Pop day ${j}: answer[${j}] = ${i} − ${j} = ${i - j}.`, snap(i, [...hl("current", ai(i)), ...hl("found", ai(j, 1))]));
    }
    const it = stack.push(temps[i], `i=${i}`);
    idx.set(it.id, i);
    t.count("pushes");
    yield t.step("push", `Push day ${i}: it waits for a day warmer than ${temps[i]}°.`, snap(i, [...hl("current", ai(i)), ...hl("active", qid(0, it.id))]));
  }

  const rest = stack.items.map((it) => idx.get(it.id)!);
  const final = answer.map((a) => a ?? 0);
  for (let k = 0; k < n; k++) answer[k] = final[k];
  yield t.step(
    "done",
    rest.length ? `${rest.length === 1 ? `Day ${rest[0]} never sees a warmer day, so it keeps` : `Days ${rest.join(", ")} never see a warmer day, so they keep`} 0. Answer: [${final.join(", ")}].` : `Every day found a warmer one. Answer: [${final.join(", ")}].`,
    snap(null, hl("pruned", ...rest.map((k) => ai(k, 1))), final),
  );
}

const algorithm: AlgorithmModule<Input, SQState> = {
  ...meta,
  renderer: "stackqueue",
  inputSchema: { fields: [numbersField("temps", "temperatures", { min: 30, max: 100, minLength: 1, maxLength: 12 })] },
  presets: [
    { name: "LeetCode example", input: { temps: [73, 74, 75, 71, 69, 72, 76, 73] } },
    { name: "Edge case: strictly increasing", input: { temps: [30, 40, 50, 60] } },
    { name: "Worst stack size: strictly decreasing", input: { temps: [90, 80, 70, 60, 50] } },
    { name: "Equal temperatures are not warmer", input: { temps: [50, 50, 50, 55] } },
    { name: "Many pops at once", input: { temps: [70, 65, 60, 55, 50, 45, 80] } },
  ],
  randomInput: (size, rng = Math.random) => ({ temps: randomNumbers(rng, size, 30, 45, 12) }),
  code: { python, javascript },
  generate,
  reference: ({ temps }) => temps.map((x, i) => {
    for (let j = i + 1; j < temps.length; j++) if (temps[j] > x) return j - i;
    return 0;
  }),
  outputOf: (s) => s.result,
  info,
  legendLabels: { current: "Today (i)", window: "Still waiting (on the stack)", compare: "Top is not colder", match: "Top is colder: resolved", found: "Answer just written", sorted: "Answer known", pruned: "Never warmer: 0", active: "Just pushed" },
};

export default algorithm;
