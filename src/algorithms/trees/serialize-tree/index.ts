import type { AlgorithmModule, Frame, Highlight, Step } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { ai, range } from "../../_shared/array";
import { BTree, randomTree, treeField, type Level } from "../../_shared/bintree";
import { tn, type TreeState, type TreeView } from "../../_shared/tree";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  root: Level;
}

const OFFSET = 1000; // ids of the rebuilt tree, so they never clash with the original's

/** Shift every id in a view (the rebuilt tree is drawn next to the original). */
function shifted(view: TreeView): TreeView {
  const s = (id: number | null) => (id === null ? null : id + OFFSET);
  return {
    ...view,
    root: s(view.root),
    nodes: view.nodes.map((n) => ({ ...n, id: n.id + OFFSET })),
    children: Object.fromEntries(Object.entries(view.children).map(([k, kids]) => [Number(k) + OFFSET, kids.map(s)])),
    pointers: view.pointers?.map((p) => ({ ...p, node: s(p.node) })),
  };
}

function* generate({ root }: Input) {
  const t = new Tracer<TreeState>();
  const tree = BTree.fromLevel(root);
  const rebuilt = new BTree();
  const tokens: string[] = [];
  const frames: Frame[] = [];
  const written = new Set<number>();
  let read = 0;
  let phase: "ser" | "de" = "ser";

  const snap = (extra: Highlight[] = [], cur: number | null = null, result?: unknown) => ({
    state: {
      trees: [
        tree.view({ name: "original", pointers: phase === "ser" ? [{ name: "node", node: cur }] : [] }),
        shifted(rebuilt.view({ name: "rebuilt from the string", pointers: phase === "de" && cur !== null ? [{ name: "node", node: cur }] : [] })),
      ],
      array: { rows: [{ label: "tokens", values: tokens.length ? tokens.slice() : [""] }], pointers: phase === "de" && read < tokens.length ? [{ name: "next", index: read }] : [] },
      caption: phase === "ser" ? "Phase 1 — serialize (preorder, # = missing child)" : "Phase 2 — deserialize (read the tokens back in preorder)",
      result,
    },
    vars: phase === "ser" ? { string: tokens.join(",") } : { "next token": read < tokens.length ? tokens[read] : "—" },
    callStack: frames.map((f) => ({ ...f })),
    highlights: [...hl("sorted", ...[...written].map(tn)), ...(phase === "de" ? hl("visited", ...range(read).map((k) => ai(k))) : []), ...extra],
  });

  function* walk(id: number | null): Generator<Step<TreeState>, void, unknown> {
    frames.push({ call: id === null ? "walk(None)" : `walk(${tree.val(id)})` });
    t.count("calls");
    if (id === null) {
      tokens.push("#");
      t.count("writes");
      yield t.step("s-null", `A missing child: write "#" so the shape is preserved.`, snap(hl("found", ai(tokens.length - 1))));
      frames.pop();
      return;
    }
    const n = tree.get(id);
    tokens.push(String(n.val));
    written.add(id);
    t.count("writes");
    yield t.step("s-val", `Write ${n.val}, then its left subtree, then its right subtree.`, snap([...hl("current", tn(id)), ...hl("found", ai(tokens.length - 1))], id));
    yield* walk(n.left);
    yield* walk(n.right);
    frames.pop();
  }

  function* build(parent: number | null, side: "left" | "right" | null): Generator<Step<TreeState>, number | null, unknown> {
    frames.push({ call: "build()" });
    t.count("calls");
    const tok = tokens[read];
    yield t.step("d-read", `Read token ${read}: "${tok}".`, snap(hl("current", ai(read)), parent));
    read++;
    if (tok === "#") {
      yield t.step("d-null", `"#": no ${side ?? ""} child here — return None.`, snap(hl("mismatch", ai(read - 1)), parent));
      frames.pop();
      return null;
    }
    const id = rebuilt.add(Number(tok));
    if (parent === null) rebuilt.root = id;
    else rebuilt.get(parent)[side!] = id;
    t.count("writes");
    frames[frames.length - 1].call = `build() → ${tok}`;
    yield t.step("d-node", `"${tok}": create node ${tok}${parent === null ? " as the root" : ` as the ${side} child of ${rebuilt.val(parent)}`}.`, snap(hl("found", tn(id + OFFSET)), id));
    yield t.step("d-left", `Its left subtree comes next in the tokens.`, snap([], id));
    yield* build(id, "left");
    yield t.step("d-right", `Left of ${tok} is done; the next tokens describe its right subtree.`, snap([], id));
    yield* build(id, "right");
    frames.pop();
    return id;
  }

  yield* walk(tree.root);
  const data = tokens.join(",");
  yield t.step("s-done", `Serialized: "${data}" — ${tree.size()} values and ${tree.size() + 1} "#" markers.`, snap());
  phase = "de";
  written.clear();
  yield t.step("d-init", "Now rebuild a fresh tree by reading the same tokens in preorder.", snap());
  yield* build(null, null);
  yield t.step("d-done", `All ${tokens.length} token${tokens.length === 1 ? "" : "s"} consumed; the rebuilt tree matches the original.`, snap([], null, { data, tree: rebuilt.toLevel() }));
}

const algorithm: AlgorithmModule<Input, TreeState> = {
  ...meta,
  renderer: "tree",
  inputSchema: { fields: [treeField("root", "tree", { maxNodes: 9 })] },
  presets: [
    { name: "LeetCode example", input: { root: [1, 2, 3, null, null, 4, 5] } },
    { name: "Same values, different shapes need the markers", input: { root: [1, null, 2] } },
    { name: "Edge case: empty tree", input: { root: [] } },
    { name: "Negative and multi-digit values", input: { root: [-10, 25, -3, 99] } },
  ],
  randomInput: (size, rng = Math.random) => ({ root: randomTree(rng, size, -20, 40, 8) }),
  code: { python, javascript },
  generate,
  reference: ({ root }) => {
    const t = BTree.fromLevel(root);
    const out: string[] = [];
    const go = (id: number | null) => {
      if (id === null) return void out.push("#");
      out.push(String(t.get(id).val));
      go(t.get(id).left);
      go(t.get(id).right);
    };
    go(t.root);
    return { data: out.join(","), tree: t.toLevel() };
  },
  outputOf: (s) => s.result,
  info,
  legendLabels: { current: "Current node / token", found: "Just written / created", sorted: "Already written", visited: "Tokens consumed", mismatch: "\"#\" = no child" },
};

export default algorithm;
