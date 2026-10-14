import type { AlgorithmModule } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { ai, numbersField, randomNumbers, range, type ArrayState, type CellValue } from "../../_shared/array";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  height: number[];
}

function* generate({ height }: Input) {
  const t = new Tracer<ArrayState>();
  const n = height.length;
  let left = 0;
  let right = n - 1;
  let leftMax = 0;
  let rightMax = 0;
  let water = 0;
  const trapped: CellValue[] = Array(n).fill(null);
  const settled = () => hl("visited", ...range(n).filter((k) => k < left || k > right).map((k) => ai(k)));
  const state = (result?: number): ArrayState => ({
    rows: [
      { label: "height", values: height, bars: true },
      { label: "water", values: trapped.slice(), hideIndex: true },
    ],
    pointers: n ? [{ name: "left", index: left }, { name: "right", index: right }] : [],
    caption: `left_max = ${leftMax}, right_max = ${rightMax}, water = ${water}`,
    result,
  });
  const vars = () => ({ left, right, left_max: leftMax, right_max: rightMax, water });

  yield t.step("init", "Pointers at both ends; both running maxima start at 0.", { state: state(), vars: vars() });

  while (left < right) {
    t.count("comparisons");
    if (height[left] < height[right]) {
      yield t.step("compare", `height[left] = ${height[left]} < height[right] = ${height[right]}: the right side is tall enough, so left_max alone decides the water at ${left}.`, {
        state: state(),
        vars: vars(),
        highlights: [...settled(), ...hl("current", ai(left)), ...hl("compare", ai(right))],
      });
      leftMax = Math.max(leftMax, height[left]);
      const w = leftMax - height[left];
      water += w;
      trapped[left] = w;
      yield t.step("left-water", w ? `left_max = ${leftMax}, so ${leftMax} − ${height[left]} = ${w} unit${w === 1 ? "" : "s"} of water sit on bar ${left}. Total ${water}.` : `Bar ${left} is the new left_max (${leftMax}); no water on top of it.`, {
        state: state(),
        vars: vars(),
        highlights: [...settled(), ...hl(w ? "found" : "current", ai(left), ai(left, 1))],
      });
      left++;
    } else {
      yield t.step("compare", `height[right] = ${height[right]} ≤ height[left] = ${height[left]}: settle the right side using right_max.`, {
        state: state(),
        vars: vars(),
        highlights: [...settled(), ...hl("current", ai(right)), ...hl("compare", ai(left))],
      });
      rightMax = Math.max(rightMax, height[right]);
      const w = rightMax - height[right];
      water += w;
      trapped[right] = w;
      yield t.step("right-water", w ? `right_max = ${rightMax}, so ${rightMax} − ${height[right]} = ${w} unit${w === 1 ? "" : "s"} of water on bar ${right}. Total ${water}.` : `Bar ${right} is the new right_max (${rightMax}); no water on top of it.`, {
        state: state(),
        vars: vars(),
        highlights: [...settled(), ...hl(w ? "found" : "current", ai(right), ai(right, 1))],
      });
      right--;
    }
  }

  yield t.step("done", `The pointers met. Total trapped water = ${water}.`, { state: state(water), vars: vars(), highlights: settled() });
}

function reference({ height }: Input): number {
  let w = 0;
  for (let i = 0; i < height.length; i++) {
    const l = Math.max(0, ...height.slice(0, i + 1));
    const r = Math.max(0, ...height.slice(i));
    w += Math.min(l, r) - height[i];
  }
  return w;
}

const algorithm: AlgorithmModule<Input, ArrayState> = {
  ...meta,
  renderer: "bars",
  inputSchema: { fields: [numbersField("height", "height", { min: 0, max: 20, maxLength: 20 })] },
  presets: [
    { name: "LeetCode example", input: { height: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1] } },
    { name: "Deep valley", input: { height: [4, 2, 0, 3, 2, 5] } },
    { name: "Edge case: increasing (no water)", input: { height: [1, 2, 3, 4, 5] } },
    { name: "Edge case: single bar", input: { height: [3] } },
  ],
  randomInput: (size, rng = Math.random) => ({ height: randomNumbers(rng, size, 0, 8, 20) }),
  code: { python, javascript },
  generate,
  reference,
  outputOf: (s) => s.result,
  info,
  legendLabels: { visited: "Settled", found: "Holds water", compare: "Taller side (not the bottleneck)" },
};

export default algorithm;
