import type { AlgorithmModule, Frame, Highlight, Step } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { Box, qid, type SQState } from "../../_shared/stackqueue";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  n: number;
}

function* generate({ n }: Input) {
  const t = new Tracer<SQState>();
  Box.resetIds();
  const path = new Box("path");
  const res: string[] = [];
  const frames: Frame[] = [];
  const str = () => path.labels().join("");

  const snap = (opened: number, closed: number, extra: Highlight[] = [], justAdded?: number, result?: string[]) => ({
    state: {
      containers: [path.view(`"${str()}" · ${path.size} / ${2 * n}`)],
      caption: `n = ${n}: build every balanced string of ${2 * n} characters`,
      result,
    },
    vars: { opened, closed, path: `"${str()}"`, found: res.length },
    callStack: frames.map((f) => ({ ...f })),
    aux: [{ label: "results", kind: "list" as const, items: res.slice(), highlight: justAdded === undefined ? [] : [justAdded] }],
    highlights: extra,
  });
  const topHl = () => (path.top ? hl("active", qid(0, path.top.id)) : []);

  function* backtrack(opened: number, closed: number): Generator<Step<SQState>, void, unknown> {
    frames.push({ call: `backtrack(${opened}, ${closed})`, locals: { path: str() } });
    t.count("calls");
    yield t.step("call", `backtrack(opened=${opened}, closed=${closed}) with path "${str()}".`, snap(opened, closed));
    t.count("comparisons");
    if (path.size === 2 * n) {
      yield t.step("full", `path has all ${2 * n} characters.`, snap(opened, closed, hl("found", ...path.items.map((it) => qid(0, it.id)))));
      res.push(str());
      yield t.step("record", `Record "${str()}" — result #${res.length}. No check needed: the rules kept it valid. Return.`, snap(opened, closed, hl("found", ...path.items.map((it) => qid(0, it.id))), res.length - 1));
      frames.pop();
      return;
    }
    yield t.step("full", `Only ${path.size} of ${2 * n} characters so far — keep building.`, snap(opened, closed));

    t.count("comparisons");
    if (opened < n) {
      const it = path.push("(");
      t.count("pushes");
      yield t.step("try-open", `opened = ${opened} < ${n}: choose "(" → "${str()}" and explore.`, snap(opened, closed, hl("active", qid(0, it.id))));
      yield* backtrack(opened + 1, closed);
      yield t.step("undo-open", `Back from that branch: pop "(" to undo the choice → "${str().slice(0, -1)}".`, snap(opened, closed, hl("removed", qid(0, it.id))));
      path.pop();
      t.count("pops");
    } else {
      yield t.step("try-open", `opened = ${opened} = n: no more "(" allowed — that branch is pruned.`, snap(opened, closed, topHl()));
    }

    t.count("comparisons");
    if (closed < opened) {
      const it = path.push(")");
      t.count("pushes");
      yield t.step("try-close", `closed = ${closed} < opened = ${opened}: choose ")" → "${str()}" and explore.`, snap(opened, closed, hl("active", qid(0, it.id))));
      yield* backtrack(opened, closed + 1);
      yield t.step("undo-close", `Back again: pop ")" → "${str().slice(0, -1)}". Both options from here are done; return.`, snap(opened, closed, hl("removed", qid(0, it.id))));
      path.pop();
      t.count("pops");
    } else {
      yield t.step("try-close", `closed = ${closed} = opened: a ")" would close nothing — pruned. Return.`, snap(opened, closed, topHl()));
    }
    frames.pop();
  }

  yield* backtrack(0, 0);
  yield t.step("done", `All branches explored: ${res.length} balanced string${res.length === 1 ? "" : "s"} for n = ${n}.`, snap(0, 0, [], undefined, res.slice()));
}

const algorithm: AlgorithmModule<Input, SQState> = {
  ...meta,
  renderer: "stackqueue",
  inputSchema: { fields: [{ key: "n", label: "n (pairs)", kind: "number", integer: true, min: 1, max: 4 }] },
  presets: [
    { name: "LeetCode example: n = 3", input: { n: 3 } },
    { name: "Edge case: n = 1", input: { n: 1 } },
    { name: "n = 2", input: { n: 2 } },
    { name: "Largest: n = 4 (14 strings)", input: { n: 4 } },
  ],
  randomInput: (size, rng = Math.random) => ({ n: randInt(rng, 1, Math.max(1, Math.min(4, size))) }),
  code: { python, javascript },
  generate,
  reference: ({ n }) => {
    // Brute force: every string of ( and ) of length 2n, in lexicographic order "(" < ")", kept if balanced.
    const out: string[] = [];
    for (let mask = 0; mask < 1 << (2 * n); mask++) {
      let s = "";
      let depth = 0;
      let ok = true;
      for (let b = 2 * n - 1; b >= 0; b--) {
        const open = ((mask >> b) & 1) === 0;
        s += open ? "(" : ")";
        depth += open ? 1 : -1;
        if (depth < 0) ok = false;
      }
      if (ok && depth === 0) out.push(s);
    }
    return out;
  },
  outputOf: (s) => s.result,
  info,
  legendLabels: { active: "Just chosen / top", removed: "Undone (popped)", found: "Complete string" },
};

export default algorithm;
