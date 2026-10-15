import type { AlgorithmModule, Frame } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { capFrames, cellId, charGridField, fmt, randomCharGrid, setCell, type Cell, type GridState } from "../../_shared/grid";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  grid: string[];
}

function* generate({ grid: input }: Input) {
  const t = new Tracer<GridState>();
  let board = input.slice();
  const rows = board.length;
  const cols = board[0].length;
  const frames: Frame[] = [];
  const state = (): GridState => ({ grid: board });

  function* markSafe(r: number, c: number): Generator<ReturnType<typeof t.step>> {
    if (r < 0 || r >= rows || c < 0 || c >= cols || board[r][c] !== "O") return;
    board = setCell(board, r, c, "S");
    frames.push({ call: `mark_safe(${r}, ${c})` });
    t.count("calls");
    yield t.step("safe", `${fmt([r, c])} is an 'O' connected to the border → mark it safe ('S').`, {
      state: state(),
      vars: { r, c, depth: frames.length },
      callStack: capFrames(frames),
      highlights: hl("current", cellId(r, c)),
    });
    for (const [dr, dc] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ])
      yield* markSafe(r + dr, c + dc);
    frames.pop();
  }

  yield t.step("border", "Phase 1: walk the border cells; any 'O' there starts a DFS that marks its whole region safe.", {
    state: state(),
    vars: { rows, cols },
    callStack: [],
  });
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const onBorder = r === 0 || r === rows - 1 || c === 0 || c === cols - 1;
      if (!onBorder || board[r][c] !== "O") continue;
      yield t.step("border", `Border cell ${fmt([r, c])} is an unmarked 'O': its region reaches the edge.`, {
        state: state(),
        vars: { r, c },
        callStack: [],
        highlights: hl("current", cellId(r, c)),
      });
      yield* markSafe(r, c);
    }

  let captured = 0;
  yield t.step("capture", "Phase 2: sweep the board. Every 'O' still left was never reached from the border, so it is surrounded.", {
    state: state(),
    vars: { captured },
    callStack: [],
  });
  for (let r = 0; r < rows; r++) {
    const restored: Cell[] = [];
    for (let c = 0; c < cols; c++) {
      if (board[r][c] === "O") {
        board = setCell(board, r, c, "X");
        captured++;
        t.count("writes");
        yield t.step("capture", `${fmt([r, c])} is a surrounded 'O' → capture it (flip to 'X').`, {
          state: state(),
          vars: { r, c, captured },
          callStack: [],
          highlights: hl("removed", cellId(r, c)),
        });
      } else if (board[r][c] === "S") {
        board = setCell(board, r, c, "O");
        restored.push([r, c]);
        t.count("writes");
      }
    }
    if (restored.length)
      yield t.step("restore", `Row ${r}: turn the safe cell${restored.length === 1 ? "" : "s"} ${restored.map(fmt).join(", ")} back into 'O'.`, {
        state: state(),
        vars: { r, captured },
        callStack: [],
        highlights: hl("match", ...restored.map(([a, b]) => cellId(a, b))),
      });
  }
  yield t.step("restore", captured ? `Done: ${captured} surrounded cell${captured === 1 ? "" : "s"} captured.` : "Done: every 'O' region touches the border, nothing is captured.", {
    state: state(),
    vars: { captured },
    callStack: [],
  });
}

function reference({ grid }: Input): string[] {
  const rows = grid.length;
  const cols = grid[0].length;
  const safe = new Set<number>();
  const stack: Cell[] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if ((r === 0 || c === 0 || r === rows - 1 || c === cols - 1) && grid[r][c] === "O") {
        safe.add(r * cols + c);
        stack.push([r, c]);
      }
  while (stack.length) {
    const [r, c] = stack.pop()!;
    for (const [nr, nc] of [
      [r + 1, c],
      [r - 1, c],
      [r, c + 1],
      [r, c - 1],
    ])
      if (grid[nr]?.[nc] === "O" && !safe.has(nr * cols + nc)) {
        safe.add(nr * cols + nc);
        stack.push([nr, nc]);
      }
  }
  return grid.map((row, r) => Array.from(row, (ch, c) => (ch === "O" && safe.has(r * cols + c) ? "O" : "X")).join(""));
}

const algorithm: AlgorithmModule<Input, GridState> = {
  ...meta,
  renderer: "grid",
  inputSchema: {
    fields: [
      charGridField({
        label: "Board",
        alphabet: "XO",
        empty: "X",
        tools: [{ char: "O", label: "O" }],
        help: "Click or drag to toggle 'O' cells. Text form: rows of 'X' and 'O'.",
        max: 10,
      }),
    ],
  },
  presets: [
    { name: "LeetCode example", input: { grid: ["XXXX", "XOOX", "XXOX", "XOXX"] } },
    { name: "Safe region snakes in from the edge", input: { grid: ["XXXXXX", "XOOXOX", "XXOXOX", "XOXXOO", "XOOXXX", "XXXXXX"] } },
    { name: "Edge case: everything touches the border", input: { grid: ["OO", "OO"] } },
    { name: "Ring inside a ring", input: { grid: ["XXXXXXX", "XOOOOOX", "XOXXXOX", "XOXOXOX", "XOXXXOX", "XOOOOOX", "XXXXXXX"] } },
  ],
  randomInput: (size, rng = Math.random) => {
    const n = Math.max(1, Math.min(8, size));
    return { grid: randomCharGrid(rng, n, randInt(rng, 1, n + 1), [["O", 45], ["X", 55]]) };
  },
  code: { python, javascript },
  generate,
  reference,
  outputOf: (state) => state.grid,
  info,
  rendererOptions: { charKinds: { X: "wall", S: "found" }, showChars: "OS" },
  legendLabels: { wall: "X", found: "Safe 'O' (marked S)", current: "DFS cell", removed: "Captured", match: "Restored to 'O'" },
  legendExtra: ["wall", "found"],
};

export default algorithm;
