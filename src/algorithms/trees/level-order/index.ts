import type { AlgorithmModule, Highlight } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { pick } from "../../../engine/random";
import { ai, type ArrayRow } from "../../_shared/array";
import { BTree, plainTree, randomTree, treeField, type Level, type PlainNode } from "../../_shared/bintree";
import { tn, type TreeState } from "../../_shared/tree";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  root: Level;
  mode: "normal" | "zigzag";
}

function* generate({ root, mode }: Input) {
  const t = new Tracer<TreeState>();
  const tree = BTree.fromLevel(root);
  const zig = mode === "zigzag";
  const res: number[][] = [];
  let level: number[] = [];
  let queue: number[] = tree.root === null ? [] : [tree.root];
  const done = new Set<number>();
  const depth = new Map<number, number>();
  if (tree.root !== null) depth.set(tree.root, 0);
  const v = (id: number) => tree.get(id).val;

  const snap = (extra: Highlight[] = [], result?: number[][]) => {
    const rows: ArrayRow[] = res.map((lv, d) => ({ label: `level ${d}`, values: lv, hideIndex: true }));
    if (level.length || !rows.length) rows.push({ label: `level ${res.length}`, values: level.length ? level.slice() : [""], hideIndex: true });
    return {
      state: { trees: [tree.view({ name: zig ? "Zigzag level order" : "Level order", sub: (n) => `L${depth.get(n.id) ?? "?"}` })], array: { rows }, result },
      vars: { level: res.length, "len(queue)": queue.length },
      aux: [{ label: "queue", kind: "queue" as const, items: queue.map(v) }],
      highlights: [...hl("sorted", ...[...done].map(tn)), ...hl("frontier", ...queue.map(tn)), ...extra],
    };
  };

  yield t.step("init", tree.root === null ? "Empty tree: the result is []." : `Put the root ${v(tree.root)} in the queue.`, snap());
  while (queue.length) {
    const size = queue.length;
    const thisLevel = queue.slice();
    yield t.step("level", `Level ${res.length}: the queue holds ${size} node${size === 1 ? "" : "s"} — exactly this level.`, snap(hl("window", ...thisLevel.map(tn))));
    level = [];
    for (let k = 0; k < size; k++) {
      const id = queue.shift()!;
      t.count("pops");
      level.push(v(id));
      done.add(id);
      yield t.step("pop", `Pop ${v(id)} (${k + 1} of ${size}) and add it to this level: [${level.join(", ")}].`, snap([...hl("current", tn(id)), ...hl("found", ai(level.length - 1, res.length))]));
      const n = tree.get(id);
      const kids = [n.left, n.right].filter((c): c is number => c !== null);
      for (const c of kids) {
        queue.push(c);
        depth.set(c, res.length + 1);
        t.count("pushes");
      }
      if (kids.length) yield t.step("push", `Enqueue its child${kids.length > 1 ? "ren" : ""} ${kids.map(v).join(", ")} for level ${res.length + 1}.`, snap([...hl("current", tn(id)), ...hl("active", ...kids.map(tn))]));
    }
    if (zig && res.length % 2 === 1) {
      level.reverse();
      yield t.step("zigzag", `Level ${res.length} is odd: reverse it so it reads right to left → [${level.join(", ")}].`, snap(hl("window", ...thisLevel.map(tn))));
    }
    res.push(level);
    level = [];
    yield t.step("add-level", `Level ${res.length - 1} done: [${res[res.length - 1].join(", ")}].`, snap());
  }
  yield t.step("done", `Result: ${JSON.stringify(res)}.`, snap([], res.map((r) => r.slice())));
}

function reference({ root, mode }: Input): number[][] {
  const res: number[][] = [];
  const go = (n: PlainNode | null, d: number) => {
    if (!n) return;
    (res[d] ??= []).push(n.val);
    go(n.left, d + 1);
    go(n.right, d + 1);
  };
  go(plainTree(root), 0);
  return mode === "zigzag" ? res.map((lv, d) => (d % 2 ? lv.slice().reverse() : lv)) : res;
}

const algorithm: AlgorithmModule<Input, TreeState> = {
  ...meta,
  renderer: "tree",
  inputSchema: {
    fields: [
      treeField("root", "tree", { maxNodes: 13 }),
      {
        key: "mode",
        label: "mode",
        kind: "select",
        options: [
          { value: "normal", label: "Level order" },
          { value: "zigzag", label: "Zigzag" },
        ],
      },
    ],
  },
  presets: [
    { name: "LeetCode example", input: { root: [3, 9, 20, null, null, 15, 7], mode: "normal" } },
    { name: "Zigzag on a full tree", input: { root: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], mode: "zigzag" } },
    { name: "Edge case: single node", input: { root: [1], mode: "normal" } },
    { name: "Edge case: empty tree", input: { root: [], mode: "normal" } },
    { name: "Unbalanced", input: { root: [1, 2, null, 3, 4, null, null, 5], mode: "zigzag" } },
  ],
  randomInput: (size, rng = Math.random) => ({ root: randomTree(rng, size, 0, 9, 11), mode: pick(rng, ["normal", "zigzag"] as const) }),
  code: { python, javascript },
  generate,
  reference,
  outputOf: (s) => s.result,
  info,
  legendLabels: { window: "Current level", frontier: "In the queue", current: "Popped", active: "Enqueued children", sorted: "Visited", found: "Added to level" },
};

export default algorithm;
