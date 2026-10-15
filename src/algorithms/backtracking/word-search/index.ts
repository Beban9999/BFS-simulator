import type { AlgorithmModule, Frame, GridField, Highlight, Step } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { mi } from "../../_shared/matrix";
import { DecisionTree, type DecisionState } from "../../_shared/decision";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  grid: string[];
  word: string;
}

// Same order as the code: down, up, right, left.
const DIRS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
] as const;

function* generate({ grid, word }: Input) {
  const t = new Tracer<DecisionState>();
  const rows = grid.length;
  const cols = grid[0].length;
  const b = grid.map((row) => row.split(""));
  const dt = new DecisionTree("∅", `find "${word}"`, 80);
  const path: [number, number][] = [];
  const frames: Frame[] = [];
  let found = false;

  const state = (done = false): DecisionState => ({
    tree: dt.view(),
    matrix: { matrix: b.map((row, r) => row.map((ch, c) => (ch === "#" ? grid[r][c] : ch))), caption: `word "${word}" · matched so far: "${word.slice(0, path.length)}"` },
    result: done ? found : undefined,
  });
  const marks = (): Highlight[] => [...dt.marks(), ...hl("active", ...path.map(([r, c]) => mi(r, c)))];

  function* dfs(r: number, c: number, i: number): Generator<Step<DecisionState>, boolean> {
    frames.push({ call: `dfs(${r}, ${c}, i=${i})` });
    t.count("calls");
    b[r][c] = "#";
    path.push([r, c]);
    yield t.step("mark", `(${r}, ${c}) = '${grid[r][c]}' matches word[${i}]. Mark it as used and look for '${word[i + 1]}' next to it.`, {
      state: state(),
      vars: { r, c, i, want: word[i + 1] },
      callStack: frames,
      highlights: [...marks(), ...hl("current", mi(r, c))],
    });
    for (const [dr, dc] of DIRS) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      t.count("comparisons");
      if (b[nr][nc] !== word[i + 1]) {
        const used = b[nr][nc] === "#";
        dt.prune(used ? "·" : b[nr][nc], `(${nr}, ${nc}) ${used ? "already on the path" : `is '${b[nr][nc]}'`}`);
        yield t.step("mismatch", used ? `(${nr}, ${nc}) is already on the path — can't reuse it.` : `(${nr}, ${nc}) is '${b[nr][nc]}', not '${word[i + 1]}'. Dead branch.`, {
          state: state(),
          vars: { r: nr, c: nc, i: i + 1, want: word[i + 1] },
          callStack: frames,
          highlights: [...marks(), ...hl("mismatch", mi(nr, nc))],
        });
        continue;
      }
      dt.enter(dt.child(word[i + 1], `(${nr}, ${nc}) = '${word[i + 1]}'`));
      if (i + 1 === word.length - 1) {
        path.push([nr, nc]);
        dt.found();
        found = true;
        yield t.step("complete", `(${nr}, ${nc}) = '${word[i + 1]}' is the last letter: "${word}" is spelled by ${path.map(([a, b2]) => `(${a},${b2})`).join(" → ")}. Return True.`, {
          state: state(),
          vars: { r: nr, c: nc, i: i + 1 },
          callStack: frames,
          highlights: [...marks(), ...hl("found", ...path.map(([a, b2]) => mi(a, b2)))],
        });
        return true;
      }
      if (yield* dfs(nr, nc, i + 1)) return true;
      dt.finish("done");
    }
    b[r][c] = grid[r][c];
    path.pop();
    frames.pop();
    yield t.step("restore", `No neighbour of (${r}, ${c}) continues the word. Restore '${grid[r][c]}' so other paths may use it, and back up.`, {
      state: state(),
      vars: { r, c, i },
      callStack: frames,
      highlights: [...marks(), ...hl("removed", mi(r, c))],
    });
    return false;
  }

  let starts = 0;
  for (let r = 0; r < rows && !found; r++)
    for (let c = 0; c < cols && !found; c++) {
      t.count("comparisons");
      if (b[r][c] !== word[0]) continue;
      starts++;
      dt.enter(dt.child(word[0], `start (${r}, ${c})`, 0));
      if (word.length === 1) {
        dt.found();
        found = true;
        path.push([r, c]);
        yield t.step("complete", `(${r}, ${c}) = '${word}' — the one-letter word is found.`, { state: state(), vars: { r, c }, highlights: [...marks(), ...hl("found", mi(r, c))] });
        break;
      }
      yield t.step("start", `Start #${starts}: (${r}, ${c}) holds '${word[0]}', the first letter. Call dfs(${r}, ${c}, 0).`, { state: state(), vars: { r, c }, highlights: [...marks(), ...hl("current", mi(r, c))] });
      if (yield* dfs(r, c, 0)) break;
      dt.finish("done");
    }

  yield t.step(
    found ? "start" : "done",
    found ? `True: "${word}" is in the grid.` : starts ? `False: none of the ${starts} start cell${starts === 1 ? "" : "s"} with '${word[0]}' leads to "${word}".` : `False: no cell holds the first letter '${word[0]}'.`,
    { state: state(true), vars: { found }, callStack: [], highlights: found ? [...dt.marks(), ...hl("found", ...path.map(([r, c]) => mi(r, c)))] : dt.marks() },
  );
}

function reference({ grid, word }: Input): boolean {
  const rows = grid.length;
  const cols = grid[0].length;
  const used = new Set<number>();
  const go = (r: number, c: number, i: number): boolean => {
    if (r < 0 || r >= rows || c < 0 || c >= cols || used.has(r * cols + c) || grid[r][c] !== word[i]) return false;
    if (i === word.length - 1) return true;
    used.add(r * cols + c);
    const ok = DIRS.some(([dr, dc]) => go(r + dr, c + dc, i + 1));
    used.delete(r * cols + c);
    return ok;
  };
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (go(r, c, 0)) return true;
  return false;
}

const FIELD: GridField = {
  key: "grid",
  label: "Board",
  kind: "grid",
  maxRows: 5,
  maxCols: 5,
  alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  help: "Rows of capital letters, up to 5×5.",
};

const algorithm: AlgorithmModule<Input, DecisionState> = {
  ...meta,
  renderer: "decisiontree",
  inputSchema: { fields: [FIELD, { key: "word", label: "word", kind: "text", minLength: 1, maxLength: 7, pattern: /^[A-Z]+$/, patternHint: "must be capital letters." }] },
  presets: [
    { name: "LeetCode example: ABCCED (found)", input: { grid: ["ABCE", "SFCS", "ADEE"], word: "ABCCED" } },
    { name: "LeetCode example: ABCB (would reuse a cell)", input: { grid: ["ABCE", "SFCS", "ADEE"], word: "ABCB" } },
    { name: "Wrong turn first, then found", input: { grid: ["CAT", "AXS", "TSE"], word: "CASE" } },
    { name: "Edge case: first letter missing", input: { grid: ["AB", "CD"], word: "XY" } },
    { name: "Worst case: all A, last letter missing", input: { grid: ["AAA", "AAA", "AAA"], word: "AAAAB" } },
  ],
  randomInput: (size, rng = Math.random) => {
    const rows = randInt(rng, 2, Math.max(2, Math.min(4, size)));
    const cols = randInt(rng, 2, 4);
    const letters = "ABCD";
    const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => letters[randInt(rng, 0, 3)]).join(""));
    // Half the time take the word from a random walk (often present), otherwise random letters.
    let word = "";
    if (rng() < 0.5) {
      let r = randInt(rng, 0, rows - 1);
      let c = randInt(rng, 0, cols - 1);
      for (let k = 0; k < randInt(rng, 1, 5); k++) {
        word += grid[r][c];
        const [dr, dc] = DIRS[randInt(rng, 0, 3)];
        r = Math.max(0, Math.min(rows - 1, r + dr));
        c = Math.max(0, Math.min(cols - 1, c + dc));
      }
    } else word = Array.from({ length: randInt(rng, 1, 5) }, () => letters[randInt(rng, 0, 3)]).join("");
    return { grid, word };
  },
  code: { python, javascript },
  generate,
  reference,
  outputOf: (state) => state.result,
  info,
  legendLabels: { active: "On the current path (marked)", current: "Cell being matched", mismatch: "Wrong letter / reused", removed: "Unmarked on backtrack", found: "Word found", pruned: "Dead branch", visited: "Failed branch" },
};

export default algorithm;
