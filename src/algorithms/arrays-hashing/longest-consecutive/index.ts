import type { AlgorithmModule } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { ai, numbersField, randomNumbers, type ArrayState } from "../../_shared/array";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  nums: number[];
}

function* generate({ nums }: Input) {
  const t = new Tracer<ArrayState>();
  const set = [...new Set(nums)];
  const has = new Set(set);
  const pos = new Map(set.map((v, i) => [v, i]));
  let best = 0;
  let bestRun: number[] = [];
  const state = (x: number, result?: number): ArrayState => ({
    rows: [{ label: "num_set", values: set }],
    pointers: x >= 0 ? [{ name: "x", index: x }] : [],
    caption: bestRun.length ? `best = ${best}: ${bestRun.join(" → ")}` : `best = ${best}`,
    result,
  });
  const runHl = (run: number[]) => hl("window", ...run.map((v) => ai(pos.get(v)!)));
  const aux = () => [{ label: "num_set", kind: "set" as const, items: set }];

  yield t.step("init", `Put all ${nums.length} numbers into a set (${set.length} distinct). Membership checks are now O(1).`, {
    state: state(-1),
    vars: { best },
    aux: aux(),
  });

  for (let i = 0; i < set.length; i++) {
    const x = set[i];
    t.count("hashes");
    if (has.has(x - 1)) {
      yield t.step("is-start", `${x} − 1 = ${x - 1} is in the set, so ${x} is inside a run. Skip it — the run will be counted from its start.`, {
        state: state(i),
        vars: { x, best },
        aux: aux(),
        highlights: [...hl("pruned", ai(i)), ...hl("compare", ai(pos.get(x - 1)!))],
      });
      continue;
    }
    const run = [x];
    yield t.step("start", `${x} − 1 is missing, so ${x} starts a run. length = 1.`, {
      state: state(i),
      vars: { x, length: 1, best },
      aux: aux(),
      highlights: [...runHl(run), ...hl("current", ai(i))],
    });
    let length = 1;
    while (has.has(x + length)) {
      t.count("hashes");
      run.push(x + length);
      length++;
      yield t.step("extend", `${x + length - 1} is in the set: extend the run to length ${length}.`, {
        state: state(i),
        vars: { x, length, best },
        aux: aux(),
        highlights: [...runHl(run), ...hl("current", ai(pos.get(x + length - 1)!))],
      });
    }
    t.count("hashes");
    const improved = length > best;
    if (improved) {
      best = length;
      bestRun = run.slice();
    }
    yield t.step("update", `${x + length} is not in the set, so the run ${run.join(" → ")} has length ${length}.${improved ? ` New best = ${best}.` : ` Best stays ${best}.`}`, {
      state: state(i),
      vars: { x, length, best },
      aux: aux(),
      highlights: improved ? hl("found", ...run.map((v) => ai(pos.get(v)!))) : runHl(run),
    });
  }

  yield t.step("done", `The longest consecutive sequence has length ${best}${bestRun.length ? `: ${bestRun.join(", ")}` : ""}.`, {
    state: state(-1, best),
    vars: { best },
    aux: aux(),
    highlights: hl("found", ...bestRun.map((v) => ai(pos.get(v)!))),
  });
}

function reference({ nums }: Input): number {
  const s = [...new Set(nums)].sort((a, b) => a - b);
  let best = 0;
  let cur = 0;
  for (let i = 0; i < s.length; i++) {
    cur = i > 0 && s[i] === s[i - 1] + 1 ? cur + 1 : 1;
    best = Math.max(best, cur);
  }
  return best;
}

const algorithm: AlgorithmModule<Input, ArrayState> = {
  ...meta,
  renderer: "array",
  inputSchema: { fields: [numbersField("nums", "nums", { min: -999, max: 999 })] },
  presets: [
    { name: "LeetCode example", input: { nums: [100, 4, 200, 1, 3, 2] } },
    { name: "Two runs and duplicates", input: { nums: [0, 3, 7, 2, 5, 8, 4, 6, 0, 1] } },
    { name: "Edge case: empty", input: { nums: [] } },
    { name: "Worst case without the start check", input: { nums: [6, 5, 4, 3, 2, 1] } },
  ],
  randomInput: (size, rng = Math.random) => ({ nums: randomNumbers(rng, size, 0, 15) }),
  code: { python, javascript },
  generate,
  reference,
  outputOf: (s) => s.result,
  info,
  legendLabels: { window: "Current run", found: "Best run", pruned: "Not a run start", compare: "Its predecessor" },
};

export default algorithm;
