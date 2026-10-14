import type { AlgorithmModule } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { ai, numbersField, randomNumbers, range, type ArrayState } from "../../_shared/array";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  height: number[];
}

function* generate({ height }: Input) {
  const t = new Tracer<ArrayState>();
  let left = 0;
  let right = height.length - 1;
  let best = 0;
  let bestPair: [number, number] | null = null;
  const discarded = () => hl("pruned", ...range(height.length).filter((k) => k < left || k > right).map((k) => ai(k)));
  const state = (result?: number): ArrayState => ({
    rows: [{ values: height, bars: true }],
    pointers: height.length ? [{ name: "left", index: left }, { name: "right", index: right }] : [],
    ranges: [
      ...(bestPair ? [{ from: bestPair[0], to: bestPair[1], kind: "found" as const, label: `best = ${best}` }] : []),
      ...(left < right ? [{ from: left, to: right, kind: "window" as const, label: `width ${right - left}` }] : []),
    ],
    result,
  });

  yield t.step("init", "Start with the widest container: the first and last lines.", { state: state(), vars: { left, right, best } });

  while (left < right) {
    const h = Math.min(height[left], height[right]);
    const area = (right - left) * h;
    t.count("comparisons");
    yield t.step("area", `Width ${right - left} × height min(${height[left]}, ${height[right]}) = ${h} → area ${area}.`, {
      state: state(),
      vars: { left, right, area, best },
      highlights: [...discarded(), ...hl("compare", ai(left), ai(right))],
    });
    if (area > best) {
      best = area;
      bestPair = [left, right];
      yield t.step("update", `New best area: ${best}.`, {
        state: state(),
        vars: { left, right, area, best },
        highlights: [...discarded(), ...hl("found", ai(left), ai(right))],
      });
    }
    if (height[left] < height[right]) {
      left++;
      yield t.step("move-left", `The left wall (${height[left - 1]}) is shorter, so it can't do better with any narrower partner. Move left → ${left}.`, {
        state: state(),
        vars: { left, right, best },
        highlights: discarded(),
      });
    } else {
      right--;
      yield t.step("move-right", `The right wall (${height[right + 1]}) is not taller, so discard it. Move right → ${right}.`, {
        state: state(),
        vars: { left, right, best },
        highlights: discarded(),
      });
    }
  }

  yield t.step("done", `The pointers met. Maximum area = ${best}${bestPair ? ` between lines ${bestPair[0]} and ${bestPair[1]}` : ""}.`, {
    state: state(best),
    vars: { best },
    highlights: bestPair ? hl("found", ai(bestPair[0]), ai(bestPair[1])) : [],
  });
}

function reference({ height }: Input): number {
  let best = 0;
  for (let i = 0; i < height.length; i++)
    for (let j = i + 1; j < height.length; j++) best = Math.max(best, (j - i) * Math.min(height[i], height[j]));
  return best;
}

const algorithm: AlgorithmModule<Input, ArrayState> = {
  ...meta,
  renderer: "bars",
  inputSchema: { fields: [numbersField("height", "height", { min: 0, max: 50, maxLength: 20 })] },
  presets: [
    { name: "LeetCode example", input: { height: [1, 8, 6, 2, 5, 4, 8, 3, 7] } },
    { name: "Tall walls in the middle", input: { height: [2, 3, 10, 5, 7, 8, 9, 1] } },
    { name: "Edge case: two lines", input: { height: [1, 1] } },
    { name: "Increasing heights", input: { height: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } },
  ],
  randomInput: (size, rng = Math.random) => ({ height: randomNumbers(rng, Math.max(2, size), 0, 12, 20) }),
  code: { python, javascript },
  generate,
  reference,
  outputOf: (s) => s.result,
  info,
  legendLabels: { pruned: "Discarded wall", compare: "Current walls", found: "Best container", window: "Current container" },
};

export default algorithm;
