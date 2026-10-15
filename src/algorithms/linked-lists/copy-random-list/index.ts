import type { AlgorithmModule, AuxStructure, Highlight } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { ListModel, eid, nid, randomList, rid, type ListPointer, type ListState, type NodeId } from "../../_shared/list";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  vals: number[];
  random: number[];
  approach: "map" | "weave";
}

type Copied = { copy: [number, number | null][]; sharesNodes: boolean; originalIntact: boolean };

function* generate({ vals, random, approach }: Input) {
  const t = new Tracer<ListState>();
  const n = vals.length;
  const m = new ListModel(2, ["original", "copy"]);
  m.random = {};
  const head = m.chain(vals, 0); // originals have ids 0..n-1
  random.forEach((r, i) => (m.random![i] = r < 0 ? null : r));
  const copyOf = new Map<NodeId, NodeId>();
  const name = (id: NodeId | null) => (id === null ? "null" : id < n ? `${m.val(id)}#${id}` : `${m.val(id)}'#${id - n}`);

  const mapAux = (hi?: number): AuxStructure[] =>
    approach === "map"
      ? [{ label: "old_to_new", kind: "map", items: [["None", "None"], ...[...copyOf].map(([o, c]) => [name(o), name(c)])], highlight: hi === undefined ? [] : [hi + 1] }]
      : [];
  const snap = (ptrs: ListPointer[], extra: Highlight[] = [], hi?: number, result?: Copied) => ({
    state: m.state({ pointers: ptrs, result, caption: "solid = next · dashed = random · X' = copy of X (#i = position)" }),
    vars: Object.fromEntries(ptrs.map((p) => [p.name, name(p.node)])),
    aux: mapAux(hi),
    highlights: [...hl("visited", ...[...copyOf.values()].map(nid)), ...extra],
  });
  const clone = (orig: NodeId) => {
    // Placed by the caller; woven copies sit between originals, so they get a label.
    const c = m.add(m.val(orig), null, approach === "weave" ? { label: "copy" } : {});
    copyOf.set(orig, c);
    t.count("writes");
    return c;
  };

  let newHead: NodeId | null = null;
  if (approach === "map") {
    yield t.step("map-init", `Start a map old_to_new with None → None, so looking up a null pointer just gives null.`, snap([]));
    for (let c = head; c !== null; c = m.next[c]) {
      const cp = clone(c);
      m.place(cp, 1, c);
      yield t.step("clone", `Pass 1: create a copy of ${name(c)} (no links yet) and record ${name(c)} → ${name(cp)}.`, snap([{ name: "curr", node: c }], hl("current", nid(c), nid(cp)), copyOf.size - 1));
    }
    if (n === 0) yield t.step("clone", "The list is empty — nothing to clone.", snap([]));
    for (let c = head; c !== null; c = m.next[c]) {
      const cp = copyOf.get(c)!;
      const nx = m.next[c];
      m.next[cp] = nx === null ? null : copyOf.get(nx)!;
      t.count("accesses");
      yield t.step(
        "wire-next",
        `Pass 2: ${name(cp)}.next = old_to_new[${name(nx)}] = ${name(m.next[cp])}.`,
        snap([{ name: "curr", node: c }, { name: "copy", node: cp }], [...hl("current", nid(c)), ...(m.next[cp] !== null ? hl("swap", eid(cp, m.next[cp]!)) : [])], [...copyOf.keys()].indexOf(c)),
      );
      const r = m.random![c];
      m.random![cp] = r === null ? null : copyOf.get(r)!;
      t.count("accesses");
      yield t.step(
        "wire-random",
        r === null
          ? `${name(c)}.random is null, so ${name(cp)}.random = old_to_new[None] = null.`
          : `${name(c)}.random → ${name(r)}, so ${name(cp)}.random = old_to_new[${name(r)}] = ${name(m.random![cp])} — the copy, never the original.`,
        snap([{ name: "curr", node: c }, { name: "copy", node: cp }], [...hl("current", nid(c)), ...(r !== null ? hl("frontier", rid(c, r)) : []), ...(r !== null ? hl("swap", rid(cp, m.random![cp]!)) : [])], r === null ? undefined : [...copyOf.keys()].indexOf(r)),
      );
    }
    newHead = head === null ? null : copyOf.get(head)!;
  } else {
    // 1) weave
    for (let c = head; c !== null; c = m.next[m.next[c]!]) {
      const cp = clone(c);
      m.next[cp] = m.next[c];
      m.next[c] = cp;
      m.layout(0, head);
      yield t.step(
        "weave",
        `Insert a copy right after ${name(c)}: ${name(c)} → ${name(cp)} → ${name(m.next[cp])}.`,
        snap([{ name: "curr", node: c }], [...hl("current", nid(c), nid(cp)), ...hl("swap", eid(c, cp))]),
      );
    }
    if (n === 0) yield t.step("weave", "The list is empty — nothing to weave.", snap([]));
    // 2) random
    for (let c = head; c !== null; c = m.next[m.next[c]!]) {
      const cp = m.next[c]!;
      const r = m.random![c];
      if (r !== null) {
        m.random![cp] = m.next[r];
        t.count("accesses");
      }
      yield t.step(
        "weave-random",
        r === null
          ? `${name(c)}.random is null — its copy keeps random = null.`
          : `${name(c)}.random = ${name(r)}, and the copy of ${name(r)} sits right after it, so ${name(cp)}.random = ${name(r)}.next = ${name(m.random![cp])}.`,
        snap([{ name: "curr", node: c }], [...hl("current", nid(c)), ...(r !== null ? [...hl("frontier", rid(c, r), nid(r)), ...hl("swap", rid(cp, m.random![cp]!))] : [])]),
      );
    }
    // 3) split
    newHead = head === null ? null : m.next[head];
    yield t.step("split-init", newHead === null ? "new_head = None (empty list)." : `new_head = ${name(newHead)}, the copy of the head. Now un-weave.`, snap([{ name: "new_head", node: newHead }]));
    let col = 0;
    for (let c = head; c !== null; c = m.next[c]) {
      const cp = m.next[c]!;
      m.next[c] = m.next[cp];
      t.count("writes");
      yield t.step(
        "split-orig",
        `${name(c)}.next = ${name(m.next[c])}: the original skips over its copy again.`,
        snap([{ name: "curr", node: c }, { name: "copy", node: cp }], [...hl("current", nid(c)), ...(m.next[c] !== null ? hl("swap", eid(c, m.next[c]!)) : [])]),
      );
      m.next[cp] = m.next[cp] === null ? null : m.next[m.next[cp]!];
      t.count("writes");
      m.place(cp, 1, col++);
      yield t.step(
        "split-copy",
        m.next[cp] === null ? `${name(cp)}.next = null: it is the last copy.` : `${name(cp)}.next = ${name(m.next[cp])}: copies link to copies.`,
        snap([{ name: "curr", node: c }, { name: "copy", node: cp }], [...hl("current", nid(cp)), ...(m.next[cp] !== null ? hl("swap", eid(cp, m.next[cp]!)) : [])]),
      );
    }
    m.layout(0, head);
    m.layout(1, newHead);
  }

  // Read the copy back by position, and check it is a true deep copy.
  const copyIds = m.ids(newHead);
  const origIds = m.ids(head);
  const result: Copied = {
    copy: copyIds.map((id) => [m.val(id) as number, m.random![id] === null ? null : copyIds.indexOf(m.random![id]!)]),
    sharesNodes: copyIds.some((id) => id < n) || copyIds.some((id) => m.random![id] !== null && m.random![id]! < n),
    originalIntact: origIds.length === n && origIds.every((id, i) => id === i && m.random![id] === (random[i] < 0 ? null : random[i])),
  };
  yield t.step(
    approach === "map" ? "map-done" : "weave-done",
    newHead === null ? "Return null — the copy of an empty list is empty." : `Return ${name(newHead)}. The copy has ${copyIds.length} brand-new nodes with the same next/random shape, and the original is unchanged.`,
    snap([{ name: "new_head", node: newHead }], hl("found", ...copyIds.map(nid)), undefined, result),
  );
}

const algorithm: AlgorithmModule<Input, ListState> = {
  ...meta,
  renderer: "linkedlist",
  inputSchema: {
    fields: [
      { key: "vals", label: "values", kind: "numbers", integer: true, min: -99, max: 99, minLength: 0, maxLength: 6, help: "Node values, head first." },
      { key: "random", label: "random", kind: "numbers", integer: true, min: -1, max: 5, minLength: 0, maxLength: 6, help: "For each node, the index its random pointer targets (-1 = null)." },
      {
        key: "approach",
        label: "approach",
        kind: "select",
        options: [
          { value: "map", label: "Hash map old → new" },
          { value: "weave", label: "Weave copies (O(1) space)" },
        ],
      },
    ],
    validate: ({ vals, random }) =>
      vals.length !== random.length
        ? "values and random must have the same length."
        : random.some((r) => r >= vals.length)
          ? `random indexes must be -1 or below ${vals.length}.`
          : null,
  },
  presets: [
    { name: "LeetCode example (hash map)", input: { vals: [7, 13, 11, 10, 1], random: [-1, 0, 4, 2, 0], approach: "map" } },
    { name: "LeetCode example (weave)", input: { vals: [7, 13, 11, 10, 1], random: [-1, 0, 4, 2, 0], approach: "weave" } },
    { name: "Random points to itself", input: { vals: [1, 2], random: [1, 1], approach: "weave" } },
    { name: "Edge case: empty list", input: { vals: [], random: [], approach: "map" } },
    { name: "All random pointers null", input: { vals: [3, 3, 3], random: [-1, -1, -1], approach: "map" } },
  ],
  randomInput: (size, rng = Math.random) => {
    const vals = randomList(rng, size, 0, 20, 6);
    return { vals, random: vals.map(() => randInt(rng, -1, vals.length - 1)), approach: rng() < 0.5 ? "map" : "weave" };
  },
  code: { python, javascript },
  generate,
  reference: ({ vals, random }) => ({ copy: vals.map((v, i) => [v, random[i] < 0 ? null : random[i]]), sharesNodes: false, originalIntact: true }),
  outputOf: (s) => s.result,
  info,
  legendLabels: { visited: "Copy node", current: "curr / copy", frontier: "Original random", swap: "Link just set", found: "Finished copy" },
};

export default algorithm;
