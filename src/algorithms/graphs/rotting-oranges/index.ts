import type { AlgorithmModule } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { Marks, cellId, charGridField, fmt, randomCharGrid, setCell, type Cell, type GridState } from "../../_shared/grid";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  grid: string[];
}

const ORDER: Cell[] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

function* generate({ grid: input }: Input) {
  const t = new Tracer<GridState>();
  const rows = input.length;
  const cols = input[0].length;
  let grid = input.slice();
  const labels: Record<string, string> = {};
  let queue: Cell[] = [];
  let fresh = 0;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === "2") {
        queue.push([r, c]);
        labels[`${r},${c}`] = "0";
      } else if (grid[r][c] === "1") fresh++;
    }
  const marks = new Marks(rows, cols);
  const markQueue = (q: Cell[], ch: string) => q.forEach((cell) => marks.set(cell, ch));
  markQueue(queue, "f");
  const state = (): GridState => ({ grid, marks: marks.snapshot(), labels });
  const aux = (q: Cell[]) => [{ label: "queue (this minute's layer)", kind: "queue" as const, items: q.map(fmt) }];

  yield t.step(
    "seed",
    queue.length
      ? `Put all ${queue.length} rotten orange${queue.length === 1 ? "" : "s"} in the queue at minute 0. Fresh oranges: ${fresh}.`
      : `No rotten oranges to start from. Fresh oranges: ${fresh}.`,
    { state: state(), vars: { minutes: 0, fresh, "queue size": queue.length }, aux: aux(queue) },
  );

  let minutes = 0;
  while (queue.length && fresh > 0) {
    minutes++;
    yield t.step("minute", `Minute ${minutes}: the ${queue.length} orange${queue.length === 1 ? "" : "s"} in the queue rot their fresh neighbours.`, {
      state: state(),
      vars: { minutes, fresh, "layer size": queue.length },
      aux: aux(queue),
    });
    const next: Cell[] = [];
    for (let qi = 0; qi < queue.length; qi++) {
      const [r, c] = queue[qi];
      marks.set([r, c], " ");
      t.count("pops");
      const rotted: Cell[] = [];
      for (const [dr, dc] of ORDER) {
        const nr = r + dr;
        const nc = c + dc;
        t.count("comparisons");
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === "1") {
          grid = setCell(grid, nr, nc, "2");
          labels[`${nr},${nc}`] = String(minutes);
          fresh--;
          next.push([nr, nc]);
          marks.set([nr, nc], "a");
          rotted.push([nr, nc]);
        }
      }
      const rest = queue.slice(qi + 1);
      yield t.step(
        rotted.length ? "rot" : "pop",
        rotted.length
          ? `${fmt([r, c])} rots ${rotted.map(fmt).join(", ")} at minute ${minutes}. Fresh left: ${fresh}.`
          : `${fmt([r, c])} has no fresh neighbours.`,
        {
          state: state(),
          vars: { minutes, r, c, fresh },
          aux: [...aux(rest), { label: "next layer", kind: "list" as const, items: next.map(fmt) }],
          highlights: [...hl("current", cellId(r, c)), ...hl("path", ...rotted.map(([a, b]) => cellId(a, b)))],
        },
      );
    }
    markQueue(next, "f");
    queue = next;
  }

  const answer = fresh === 0 ? minutes : -1;
  const stuck: Cell[] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (grid[r][c] === "1") stuck.push([r, c]);
  yield t.step(
    "done",
    answer === -1
      ? `The rot can't spread any further, but ${fresh} fresh orange${fresh === 1 ? " is" : "s are"} unreachable: return -1.`
      : minutes === 0
        ? "There were no fresh oranges to begin with: 0 minutes."
        : `Every orange is rotten after ${minutes} minute${minutes === 1 ? "" : "s"}.`,
    {
      state: state(),
      vars: { minutes, fresh, answer },
      aux: aux([]),
      highlights: hl("mismatch", ...stuck.map(([r, c]) => cellId(r, c))),
    },
  );
}

function reference({ grid }: Input): number {
  const g = grid.map((row) => row.split(""));
  let queue: Cell[] = [];
  let fresh = 0;
  g.forEach((row, r) => row.forEach((ch, c) => (ch === "2" ? queue.push([r, c]) : ch === "1" ? fresh++ : 0)));
  let minutes = 0;
  while (queue.length && fresh > 0) {
    minutes++;
    const next: Cell[] = [];
    for (const [r, c] of queue)
      for (const [dr, dc] of ORDER) {
        const nr = r + dr;
        const nc = c + dc;
        if (g[nr]?.[nc] === "1") {
          g[nr][nc] = "2";
          fresh--;
          next.push([nr, nc]);
        }
      }
    queue = next;
  }
  return fresh === 0 ? minutes : -1;
}

const algorithm: AlgorithmModule<Input, GridState> = {
  ...meta,
  renderer: "grid",
  inputSchema: {
    fields: [
      charGridField({
        alphabet: "012",
        empty: "0",
        tools: [
          { char: "1", label: "Fresh" },
          { char: "2", label: "Rotten" },
        ],
        help: "Paint fresh or rotten oranges on the grid. Text form: '0' empty, '1' fresh, '2' rotten, one row per line.",
      }),
    ],
  },
  presets: [
    { name: "LeetCode example: 4 minutes", input: { grid: ["211", "110", "011"] } },
    { name: "Two sources race", input: { grid: ["2111110", "1101011", "1111112", "0011100"] } },
    { name: "Edge case: an unreachable orange (-1)", input: { grid: ["211", "011", "101"] } },
    { name: "Edge case: nothing fresh (0)", input: { grid: ["020", "000"] } },
    { name: "Worst case: one source, long snake", input: { grid: ["21111", "00001", "11111", "10000", "11111"] } },
  ],
  randomInput: (size, rng = Math.random) => {
    const n = Math.max(2, Math.min(9, size));
    return { grid: randomCharGrid(rng, n, randInt(rng, 2, n + 1), [["1", 60], ["0", 28], ["2", 12]]) };
  },
  code: { python, javascript },
  generate,
  reference,
  outputOf: (_s, step) => step.vars.answer,
  info,
  rendererOptions: { charKinds: { "1": "compare", "2": "removed" } },
  legendLabels: {
    compare: "Fresh orange",
    removed: "Rotten (label = minute)",
    frontier: "In the queue",
    active: "Rotted this minute",
    current: "Orange spreading rot",
    path: "Just rotted",
    mismatch: "Never reached",
  },
  legendExtra: ["compare", "removed"],
};

export default algorithm;
