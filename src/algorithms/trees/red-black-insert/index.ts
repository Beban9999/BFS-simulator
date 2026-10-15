import type { AlgorithmModule, Highlight } from "../../../engine/types";
import { hl } from "../../../engine/trace";
import { shuffle } from "../../../engine/random";
import { BTree } from "../../_shared/bintree";
import { TreeTrace } from "../../_shared/treetrace";
import { tn, type TreeState } from "../../_shared/tree";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  keys: number[];
}

interface Output {
  level: (number | null)[];
  colors: string;
}

function* generate({ keys }: Input) {
  const tree = new BTree();
  const tt = new TreeTrace(tree, "red-black tree (red nodes drawn red)");
  const parent = new Map<number, number | null>();
  const red = new Set<number>();
  const v = (id: number | null) => tree.val(id);
  const P = (id: number) => parent.get(id) ?? null;

  const paint = () => {
    tt.mark.clear();
    for (const id of tree.nodes.keys()) if (red.has(id)) tt.mark.set(id, "mismatch");
    for (const id of tree.nodes.keys()) tt.sub.set(id, red.has(id) ? "red" : "black");
  };
  const step = (line: string, msg: string, extra: Highlight[] = [], result?: Output) => {
    paint();
    return tt.step(line, msg, extra, { red: [...red].map(v).join(", ") || "none" }, result, []);
  };
  const colors = (): Output => {
    const level = tree.toLevel();
    const order: number[] = [];
    const q: (number | null)[] = [tree.root];
    while (q.length) {
      const id = q.shift()!;
      if (id === null) continue;
      order.push(id);
      q.push(tree.get(id).left, tree.get(id).right);
    }
    return { level, colors: order.map((id) => (red.has(id) ? "R" : "B")).join("") };
  };

  function rotateLeft(x: number) {
    const y = tree.get(x).right!;
    const yl = tree.get(y).left;
    tree.get(x).right = yl;
    if (yl !== null) parent.set(yl, x);
    const px = P(x);
    parent.set(y, px);
    if (px === null) tree.root = y;
    else if (tree.get(px).left === x) tree.get(px).left = y;
    else tree.get(px).right = y;
    tree.get(y).left = x;
    parent.set(x, y);
    tt.t.count("swaps");
  }
  function rotateRight(x: number) {
    const y = tree.get(x).left!;
    const yr = tree.get(y).right;
    tree.get(x).left = yr;
    if (yr !== null) parent.set(yr, x);
    const px = P(x);
    parent.set(y, px);
    if (px === null) tree.root = y;
    else if (tree.get(px).right === x) tree.get(px).right = y;
    else tree.get(px).left = y;
    tree.get(y).right = x;
    parent.set(x, y);
    tt.t.count("swaps");
  }

  for (const key of keys) {
    let node = tree.add(key);
    red.add(node);
    yield step("new", `Insert ${key}: create it as a RED node (a red node never changes any path's black count).`);
    // BST insert
    let cur = tree.root;
    let par: number | null = null;
    while (cur !== null) {
      par = cur;
      tt.t.count("comparisons");
      cur = key < tree.get(cur).val ? tree.get(cur).left : tree.get(cur).right;
    }
    parent.set(node, par);
    if (par === null) tree.root = node;
    else if (key < tree.get(par).val) tree.get(par).left = node;
    else tree.get(par).right = node;
    yield step("bst", par === null ? `The tree was empty: ${key} is the root.` : `BST insert: ${key} becomes the ${key < tree.get(par).val ? "left" : "right"} child of ${v(par)}.`, hl("current", tn(node)));

    while (P(node) !== null && red.has(P(node)!)) {
      const p = P(node)!;
      const g = P(p)!;
      yield step("loop", `${v(node)} and its parent ${v(p)} are both red — rule 2 is broken.`, hl("current", tn(node), tn(p)));
      const pIsLeft = tree.get(g).left === p;
      const u = pIsLeft ? tree.get(g).right : tree.get(g).left;
      const uRed = u !== null && red.has(u);
      yield step("uncle", `The uncle (grandparent ${v(g)}'s other child) is ${u === null ? "None — counts as black" : `${v(u)}, ${uRed ? "red" : "black"}`}.`, [...hl("current", tn(node)), ...(u !== null ? hl("compare", tn(u)) : []), ...hl("pivot", tn(g))]);
      if (uRed) {
        red.delete(p);
        red.delete(u!);
        red.add(g);
        yield step("case1", `Case 1: recolor — ${v(p)} and ${v(u)} become black, ${v(g)} becomes red. Black counts stay the same; continue from ${v(g)}.`, hl("current", tn(g)));
        node = g;
        continue;
      }
      if (pIsLeft) {
        if (tree.get(p).right === node) {
          yield step("case2-left", `Case 2: ${v(node)} is the right child of a left child — a triangle. Rotate left at ${v(p)} to make a straight line.`, hl("current", tn(node), tn(p)));
          node = p;
          rotateLeft(node);
          yield step("case2-left", `Now ${v(node)} hangs below ${v(P(node))} in a straight line.`, hl("current", tn(node)));
        }
        const np = P(node)!;
        red.delete(np);
        red.add(g);
        yield step("case3-left", `Case 3: color ${v(np)} black and ${v(g)} red, then rotate right at ${v(g)}.`, hl("pivot", tn(g), tn(np)));
        rotateRight(g);
        yield step("case3-left", `${v(np)} is now the black top of this part, with red children — rule 2 is fixed.`, hl("found", tn(np)));
      } else {
        if (tree.get(p).left === node) {
          yield step("case2-right", `Case 2 (mirror): ${v(node)} is the left child of a right child — a triangle. Rotate right at ${v(p)}.`, hl("current", tn(node), tn(p)));
          node = p;
          rotateRight(node);
          yield step("case2-right", `Now ${v(node)} hangs below ${v(P(node))} in a straight line.`, hl("current", tn(node)));
        }
        const np = P(node)!;
        red.delete(np);
        red.add(g);
        yield step("case3-right", `Case 3 (mirror): color ${v(np)} black and ${v(g)} red, then rotate left at ${v(g)}.`, hl("pivot", tn(g), tn(np)));
        rotateLeft(g);
        yield step("case3-right", `${v(np)} is now the black top of this part, with red children — rule 2 is fixed.`, hl("found", tn(np)));
      }
    }
    if (P(node) === null || !red.has(P(node)!)) {
      const wasRed = red.has(tree.root!);
      red.delete(tree.root!);
      yield step("root", wasRed ? `Paint the root ${v(tree.root)} black.` : `No red-red pair left; the root ${v(tree.root)} is black.`, hl("found", tn(tree.root!)));
    }
  }
  yield step("root", `All ${keys.length} key${keys.length === 1 ? "" : "s"} inserted; every rule holds. Height ${tree.height()}.`, [], colors());
}

/** Independent CLRS insert on plain objects (level order + colors in BFS order). */
function reference({ keys }: Input): Output {
  type N = { k: number; red: boolean; l: N | null; r: N | null; p: N | null };
  let root: N | null = null;
  const rotL = (x: N) => {
    const y = x.r!;
    x.r = y.l;
    if (y.l) y.l.p = x;
    y.p = x.p;
    if (!x.p) root = y;
    else if (x === x.p.l) x.p.l = y;
    else x.p.r = y;
    y.l = x;
    x.p = y;
  };
  const rotR = (x: N) => {
    const y = x.l!;
    x.l = y.r;
    if (y.r) y.r.p = x;
    y.p = x.p;
    if (!x.p) root = y;
    else if (x === x.p.r) x.p.r = y;
    else x.p.l = y;
    y.r = x;
    x.p = y;
  };
  for (const k of keys) {
    let z: N = { k, red: true, l: null, r: null, p: null };
    let y: N | null = null;
    let x: N | null = root;
    while (x) {
      y = x;
      x = k < x.k ? x.l : x.r;
    }
    z.p = y;
    if (!y) root = z;
    else if (k < y.k) y.l = z;
    else y.r = z;
    while (z.p && z.p.red) {
      const g: N = z.p.p!;
      if (z.p === g.l) {
        const u = g.r;
        if (u && u.red) {
          z.p.red = false;
          u.red = false;
          g.red = true;
          z = g;
        } else {
          if (z === z.p.r) {
            z = z.p;
            rotL(z);
          }
          z.p!.red = false;
          g.red = true;
          rotR(g);
        }
      } else {
        const u = g.l;
        if (u && u.red) {
          z.p.red = false;
          u.red = false;
          g.red = true;
          z = g;
        } else {
          if (z === z.p.l) {
            z = z.p;
            rotR(z);
          }
          z.p!.red = false;
          g.red = true;
          rotL(g);
        }
      }
    }
    root!.red = false;
  }
  const level: (number | null)[] = [];
  let colors = "";
  const q: (N | null)[] = [root];
  while (q.length) {
    const n = q.shift()!;
    level.push(n ? n.k : null);
    if (n) {
      colors += n.red ? "R" : "B";
      q.push(n.l, n.r);
    }
  }
  while (level.length && level[level.length - 1] === null) level.pop();
  return { level, colors };
}

const algorithm: AlgorithmModule<Input, TreeState> = {
  ...meta,
  renderer: "tree",
  inputSchema: {
    fields: [{ key: "keys", label: "keys to insert (in order)", kind: "numbers", integer: true, min: -99, max: 99, minLength: 1, maxLength: 12 }],
    validate: ({ keys }) => (new Set(keys).size === keys.length ? null : "Keys must be distinct."),
  },
  presets: [
    { name: "Sorted input", input: { keys: [1, 2, 3, 4, 5, 6, 7, 8] } },
    { name: "Cases 1, 2 and 3", input: { keys: [10, 20, 30, 15, 25, 5, 1, 12, 13] } },
    { name: "Triangle (case 2 → 3)", input: { keys: [30, 10, 20] } },
    { name: "Edge case: single key", input: { keys: [7] } },
  ],
  randomInput: (size, rng = Math.random) => ({ keys: shuffle(rng, Array.from({ length: 30 }, (_, i) => i + 1)).slice(0, Math.max(1, Math.min(10, size))) }),
  code: { python, javascript },
  generate,
  reference,
  outputOf: (s) => s.result,
  info,
  legendLabels: { mismatch: "Red node", current: "Red-red problem", compare: "Uncle", pivot: "Grandparent / rotation", found: "Fixed / root" },
  legendExtra: ["mismatch"],
};

export default algorithm;
