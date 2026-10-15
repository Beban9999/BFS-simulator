import type { AlgorithmModule, Highlight } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { ai, numbersField, randomNumbers, range, type Range } from "../../_shared/array";
import { Box, qid, type SQState } from "../../_shared/stackqueue";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  heights: number[];
}

function* generate({ heights }: Input) {
  const t = new Tracer<SQState>();
  Box.resetIds();
  const n = heights.length;
  const stack = new Box("stack (index)");
  const idx = new Map<number, number>();
  let best = 0;
  let bestRange: Range | null = null;

  const snap = (i: number | null, extra: Highlight[] = [], ranges: Range[] = [], result?: number) => ({
    state: {
      array: {
        rows: [{ values: heights, bars: true }],
        pointers: i === null ? [] : [{ name: i === n ? "i (sentinel 0)" : "i", index: i }],
        ranges: [...(bestRange ? [bestRange] : []), ...ranges],
      },
      containers: [stack.view(stack.size ? `heights ${stack.labels().join(" < ")}` : "empty")],
      caption: `best = ${best}`,
      result,
    },
    vars: { i: i ?? "—", h: i === null ? "—" : i < n ? heights[i] : 0, best },
    highlights: [...hl("frontier", ...stack.items.map((it) => ai(idx.get(it.id)!))), ...extra],
  });

  yield t.step("init", "Scan the bars left to right, keeping a stack of indexes whose heights increase upward.", snap(null));

  for (let i = 0; i <= n; i++) {
    const h = i < n ? heights[i] : 0;
    yield t.step(
      "loop",
      i < n ? `Bar ${i} has height ${h}.` : `i = ${n} is past the last bar: treat it as height 0 so every bar left on the stack gets popped.`,
      snap(i, i < n ? hl("current", ai(i)) : []),
    );
    while (true) {
      const top = stack.top;
      if (!top) break;
      const ti = idx.get(top.id)!;
      t.count("comparisons");
      if (heights[ti] < h) {
        yield t.step("compare", `Top bar ${ti} (height ${heights[ti]}) is lower than ${h}, so it can still extend to the right. Stop popping.`, snap(i, [...(i < n ? hl("current", ai(i)) : []), ...hl("compare", ai(ti), qid(0, top.id))]));
        break;
      }
      yield t.step(
        "compare",
        `Top bar ${ti} (height ${heights[ti]}) ≥ ${h}: its rectangle can't reach bar ${i}, so ${i} is its right limit. Pop it.`,
        snap(i, [...(i < n ? hl("current", ai(i)) : []), ...hl("removed", qid(0, top.id)), ...hl("pivot", ai(ti))]),
      );
      stack.pop();
      t.count("pops");
      const left = stack.top ? idx.get(stack.top.id)! : -1;
      const width = i - left - 1;
      const area = heights[ti] * width;
      const rect: Range = { from: left + 1, to: i - 1, kind: "active", label: `${heights[ti]}×${width} = ${area}` };
      const better = area > best;
      yield t.step(
        "area",
        `Left limit: ${left === -1 ? "nothing lower on the left (−1)" : `bar ${left}, the new top`}. Width = ${i} − (${left}) − 1 = ${width}, area = ${heights[ti]} × ${width} = ${area}${better ? ` — new best (was ${best})` : ` (best stays ${best})`}.`,
        snap(i, [...hl("pivot", ai(ti)), ...hl("active", ...range(width).map((k) => ai(left + 1 + k)))], [rect]),
      );
      if (better) {
        best = area;
        bestRange = { from: left + 1, to: i - 1, kind: "found", label: `best ${area}` };
      }
    }
    if (i < n) {
      const it = stack.push(heights[i], `i=${i}`);
      idx.set(it.id, i);
      t.count("pushes");
      yield t.step("push", `Push bar ${i}; the stack's heights still increase upward.`, snap(i, [...hl("current", ai(i)), ...hl("active", qid(0, it.id))]));
    }
  }

  yield t.step("done", `Every bar has been evaluated. The largest rectangle has area ${best}.`, snap(null, bestRange ? range(bestRange.to - bestRange.from + 1).flatMap((k) => hl("found", ai(bestRange!.from + k))) : [], [], best));
}

const algorithm: AlgorithmModule<Input, SQState> = {
  ...meta,
  renderer: "stackqueue",
  inputSchema: { fields: [numbersField("heights", "heights", { min: 0, max: 20, minLength: 1, maxLength: 12 })] },
  presets: [
    { name: "LeetCode example", input: { heights: [2, 1, 5, 6, 2, 3] } },
    { name: "Edge case: single bar", input: { heights: [4] } },
    { name: "Increasing (everything pops at the sentinel)", input: { heights: [1, 2, 3, 4, 5] } },
    { name: "Equal heights", input: { heights: [3, 3, 3, 3] } },
    { name: "Valley in the middle", input: { heights: [6, 2, 5, 4, 5, 1, 6] } },
  ],
  randomInput: (size, rng = Math.random) => ({ heights: randomNumbers(rng, size, 0, 9, 12) }),
  code: { python, javascript },
  generate,
  reference: ({ heights }) => {
    let best = 0;
    for (let a = 0; a < heights.length; a++) {
      let low = Infinity;
      for (let b = a; b < heights.length; b++) {
        low = Math.min(low, heights[b]);
        best = Math.max(best, low * (b - a + 1));
      }
    }
    return best;
  },
  outputOf: (s) => s.result,
  info,
  legendLabels: { current: "Bar i", frontier: "On the stack", compare: "Top is lower: stop", removed: "Popped", pivot: "Bar being measured", active: "Its widest rectangle", found: "Best rectangle" },
};

export default algorithm;
