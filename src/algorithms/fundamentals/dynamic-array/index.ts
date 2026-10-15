import type { AlgorithmModule, AuxStructure } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { ai, numbersField, randomNumbers, range, type ArrayState } from "../../_shared/array";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

type Growth = "double" | "half" | "plus2";

interface Input {
  values: number[];
  growth: Growth;
}

interface Result {
  size: number;
  capacity: number;
  copies: number;
}

const GROW: Record<Growth, (cap: number) => number> = {
  double: (cap) => cap * 2,
  // Java's ArrayList rule (cap + cap/2), at least one more slot so capacity 1 can grow.
  half: (cap) => Math.max(cap + 1, cap + (cap >> 1)),
  plus2: (cap) => cap + 2,
};

const GROW_TEXT: Record<Growth, string> = {
  double: "× 2",
  half: "× 1.5",
  plus2: "+ 2",
};

function* generate({ values, growth }: Input) {
  const t = new Tracer<ArrayState>();
  let cap = 1;
  let size = 0;
  let data: (number | null)[] = [null];
  let copies = 0;
  let writes = 0;
  const resizes: string[] = [];

  const per = () => (size ? (writes + copies) / size : 0);
  const caption = () =>
    `growth ${GROW_TEXT[growth]} · ${size} append${size === 1 ? "" : "s"} · ${writes} writes + ${copies} copies = ${writes + copies} element moves` +
    (size ? ` → ${per().toFixed(2)} per append` : "");
  const aux = (): AuxStructure[] => [{ label: "resizes (old → new capacity, copies)", kind: "list", items: resizes.slice() }];
  const vars = (extra: Record<string, unknown> = {}) => ({ size, capacity: cap, copies, "moves per append": Number(per().toFixed(2)), ...extra });
  const state = (rows: ArrayState["rows"], result?: Result): ArrayState => ({
    rows,
    pointers: [{ name: "size", index: size }],
    ranges: size ? [{ from: 0, to: size - 1, kind: "window", label: `size ${size}` }] : [],
    caption: caption(),
    result,
  });

  yield t.step("loop", `Start with an empty array: capacity 1, size 0. Append ${values.length} value${values.length === 1 ? "" : "s"}, growing ${GROW_TEXT[growth]} when full.`, {
    state: state([{ label: `cap ${cap}`, values: data }]),
    vars: vars(),
    aux: aux(),
  });

  for (const x of values) {
    if (size === cap) {
      const newCap = GROW[growth](cap);
      yield t.step("full", `Appending ${x}: size ${size} = capacity ${cap}, no free slot. Allocate a bigger block of ${newCap} (${GROW_TEXT[growth]}).`, {
        state: state([{ label: `cap ${cap}`, values: data }]),
        vars: vars({ x }),
        aux: aux(),
        highlights: hl("compare", ...range(size).map((i) => ai(i))),
      });
      const next: (number | null)[] = Array(newCap).fill(null);
      yield t.step("alloc", `New empty block with ${newCap} slots. Every existing element must be copied into it — this is the expensive part.`, {
        state: state([
          { label: `old ${cap}`, values: data },
          { label: `new ${newCap}`, values: next.slice() },
        ]),
        vars: vars({ x, new_cap: newCap }),
        aux: aux(),
        highlights: hl("frontier", ...range(newCap).map((i) => ai(i, 1))),
      });
      for (let i = 0; i < size; i++) {
        next[i] = data[i];
        copies++;
        t.count("writes");
        yield t.step("copy", `Copy element ${i} (${data[i]}) into the new block: copy ${i + 1} of ${size} for this resize, ${copies} in total.`, {
          state: state([
            { label: `old ${cap}`, values: data },
            { label: `new ${newCap}`, values: next.slice() },
          ]),
          vars: vars({ x, i }),
          aux: aux(),
          highlights: [...hl("visited", ...range(i).map((k) => ai(k, 1))), ...hl("current", ai(i, 0), ai(i, 1))],
        });
      }
      resizes.push(`${cap} → ${newCap} (${size} cop${size === 1 ? "y" : "ies"})`);
      t.count("calls");
      data = next;
      const old = cap;
      cap = newCap;
      yield t.step("swap", `Switch to the new block and free the old one: capacity ${old} → ${cap}. The next ${cap - size} appends need no copying.`, {
        state: state([{ label: `cap ${cap}`, values: data }]),
        vars: vars({ x }),
        aux: aux(),
        highlights: hl("frontier", ...range(cap - size).map((k) => ai(size + k))),
      });
    }
    data[size] = x;
    size++;
    writes++;
    t.count("writes");
    yield t.step("write", `Write ${x} into slot ${size - 1}: one O(1) write. Size is now ${size} of ${cap}; so far ${per().toFixed(2)} element moves per append.`, {
      state: state([{ label: `cap ${cap}`, values: data }]),
      vars: vars({ x }),
      aux: aux(),
      highlights: hl("current", ai(size - 1)),
    });
  }

  const result: Result = { size, capacity: cap, copies };
  const verdict =
    growth === "plus2"
      ? "Growing by a constant re-copies almost everything every few appends: total work grows like n², so each append costs O(n) on average."
      : "Copies form a geometric series smaller than a constant times n, so each append is O(1) amortized.";
  const pl = (k: number, word: string, many = `${word}s`) => `${k} ${k === 1 ? word : many}`;
  yield t.step("loop", `Done: ${pl(size, "append")} cost ${pl(writes, "write")} + ${pl(copies, "copy", "copies")} = ${pl(writes + copies, "move")} (${per().toFixed(2)} per append) over ${pl(resizes.length, "resize")}. ${resizes.length ? verdict : "No resize was needed yet."}`, {
    state: state([{ label: `cap ${cap}`, values: data }], result),
    vars: vars(),
    aux: aux(),
    highlights: hl("found", ...range(size).map((i) => ai(i))),
  });
}

function reference({ values, growth }: Input): Result {
  let cap = 1;
  let copies = 0;
  for (let size = 0; size < values.length; size++) {
    if (size === cap) {
      copies += size;
      cap = GROW[growth](cap);
    }
  }
  return { size: values.length, capacity: cap, copies };
}

const algorithm: AlgorithmModule<Input, ArrayState> = {
  ...meta,
  renderer: "array",
  inputSchema: {
    fields: [
      numbersField("values", "values to append", { minLength: 1, maxLength: 24, min: 0, max: 99 }),
      {
        key: "growth",
        label: "growth",
        kind: "select",
        options: [
          { value: "double", label: "double (× 2)" },
          { value: "half", label: "× 1.5 (Java ArrayList)" },
          { value: "plus2", label: "+ 2 slots (bad)" },
        ],
      },
    ],
  },
  presets: [
    { name: "Doubling, 9 appends", input: { values: [5, 8, 2, 7, 1, 9, 4, 6, 3], growth: "double" } },
    { name: "Edge case: one append", input: { values: [42], growth: "double" } },
    { name: "Just past a power of two (17)", input: { values: [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9, 3, 2], growth: "double" } },
    { name: "Grow by 1.5", input: { values: [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9, 3, 2], growth: "half" } },
    { name: "Worst: grow by + 2", input: { values: [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9, 3, 2], growth: "plus2" } },
  ],
  randomInput: (size, rng = Math.random) => ({
    values: randomNumbers(rng, size * 2, 0, 99, 24),
    growth: (["double", "half", "plus2"] as const)[Math.floor(rng() * 3)],
  }),
  code: { python, javascript },
  generate,
  reference,
  outputOf: (s) => s.result,
  info,
  legendLabels: { window: "Used slots (size)", frontier: "Free capacity", current: "Element being written / copied", visited: "Already copied", compare: "Full block" },
};

export default algorithm;
