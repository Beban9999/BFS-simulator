import type { AlgorithmModule, Highlight, Step } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { pick, randInt } from "../../../engine/random";
import { ai } from "../../_shared/array";
import { te, tn, type TreeState, type TreeView } from "../../_shared/tree";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  ops: string[];
}

interface TNode {
  id: number;
  ch: string;
  end: boolean;
  kids: Map<string, number>;
}

const parseTrieOp = (tok: string) => {
  const [op, word] = tok.split(":");
  return { op, word };
};

function* generate({ ops }: Input) {
  const t = new Tracer<TreeState>();
  const nodes = new Map<number, TNode>();
  let nextId = 0;
  const make = (ch: string) => {
    const n: TNode = { id: nextId++, ch, end: false, kids: new Map() };
    nodes.set(n.id, n);
    return n;
  };
  const root = make("·");
  const out: string[] = [];
  let opIdx = -1;

  const view = (pointer: number | null): TreeView => {
    const children: TreeView["children"] = {};
    const list: TreeView["nodes"] = [];
    const walk = (n: TNode) => {
      list.push({ id: n.id, label: n.ch, sub: n.end ? "end" : undefined });
      const kids = [...n.kids.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, id]) => id);
      if (kids.length) children[n.id] = kids;
      for (const k of kids) walk(nodes.get(k)!);
    };
    walk(root);
    return { name: "trie", root: root.id, nodes: list, children, pointers: pointer === null ? [] : [{ name: "node", node: pointer }] };
  };
  const words = (): string[] => {
    const res: string[] = [];
    const walk = (n: TNode, s: string) => {
      if (n.end) res.push(s);
      for (const [ch, id] of [...n.kids.entries()].sort(([a], [b]) => a.localeCompare(b))) walk(nodes.get(id)!, s + ch);
    };
    walk(root, "");
    return res;
  };
  // Answers so far are the result; the class has no "done" line, so every step carries them.
  const snap = (line: string, msg: string, pointer: number | null, extra: Highlight[] = []): Step<TreeState> =>
    t.step(line, msg, {
      state: {
        trees: [view(pointer)],
        array: { rows: [{ label: "answers", values: out.length ? out.slice() : [""] }] },
        caption: `stored words: ${words().join(", ") || "none"}`,
        result: { answers: out.slice(), words: words() },
      },
      vars: { op: opIdx < 0 ? "—" : ops[opIdx] },
      aux: [{ label: "operations", kind: "list" as const, items: ops, highlight: opIdx < 0 ? [] : [opIdx] }],
      highlights: [...hl("found", ...[...nodes.values()].filter((n) => n.end).map((n) => tn(n.id))), ...extra],
    });

  yield snap("init", "An empty trie: just the root. Words will hang below it one character per edge.", null);

  for (const [k, tok] of ops.entries()) {
    opIdx = k;
    const { op, word } = parseTrieOp(tok);
    if (op === "insert") {
      let node = root;
      const path = [root.id];
      for (const ch of word) {
        let id = node.kids.get(ch);
        const created = id === undefined;
        if (created) {
          const n = make(ch);
          node.kids.set(ch, n.id);
          id = n.id;
          t.count("writes");
        }
        t.count("accesses");
        const parentId = node.id;
        node = nodes.get(id!)!;
        path.push(node.id);
        yield snap("ins-step", `insert("${word}"): '${ch}' — ${created ? "no such edge yet, create it" : "the edge already exists (shared prefix), follow it"}.`, node.id, [...hl("path", ...path.map(tn)), ...hl(created ? "active" : "path", te(parentId, node.id))]);
      }
      const already = node.end;
      node.end = true;
      yield snap("ins-end", already ? `"${word}" was already stored.` : `Mark the last node as a word end: "${word}" is stored.`, node.id, hl("current", tn(node.id)));
      continue;
    }
    if (op === "search" || op === "prefix") {
      let node: TNode | null = root;
      const path = [root.id];
      for (const ch of word) {
        t.count("accesses");
        const id: number | undefined = node!.kids.get(ch);
        if (id === undefined) {
          node = null;
          yield snap("walk-miss", `${op}("${word}"): no '${ch}' edge below "${word.slice(0, path.length - 1)}" — the path breaks.`, path[path.length - 1], [...hl("path", ...path.map(tn)), ...hl("mismatch", tn(path[path.length - 1]))]);
          break;
        }
        node = nodes.get(id)!;
        path.push(id);
        yield snap("walk-step", `${op}("${word}"): follow '${ch}'.`, id, hl("path", ...path.map(tn)));
      }
      const ok = op === "search" ? node !== null && node.end : node !== null;
      out.push(ok ? "T" : "F");
      yield snap(
        op === "search" ? "search" : "prefix",
        op === "search"
          ? node === null
            ? `search("${word}") = False — the path doesn't exist.`
            : node.end
              ? `search("${word}") = True — the path exists and ends at a word marker.`
              : `search("${word}") = False — the path exists, but "${word}" is only a prefix (no end marker).`
          : `startsWith("${word}") = ${ok ? "True — the path exists" : "False"}.`,
        node?.id ?? null,
        [...hl("path", ...path.map(tn)), ...hl(ok ? "match" : "mismatch", ai(out.length - 1))],
      );
      continue;
    }
    // delete (validated: the word is stored)
    const path: [TNode, string][] = [];
    let node = root;
    for (const ch of word) {
      path.push([node, ch]);
      node = nodes.get(node.kids.get(ch)!)!;
      yield snap("del-walk", `delete("${word}"): walk to '${ch}'.`, node.id, hl("path", tn(node.id)));
    }
    node.end = false;
    yield snap("del-unmark", `Remove the end marker from "${word}".`, node.id, hl("removed", tn(node.id)));
    for (const [parent, ch] of path.reverse()) {
      const child = nodes.get(parent.kids.get(ch)!)!;
      if (child.end || child.kids.size > 0) {
        yield snap("del-check", `'${ch}' is still needed (${child.end ? "it ends another word" : "other words continue below it"}) — stop pruning.`, child.id, hl("match", tn(child.id)));
        break;
      }
      yield snap("del-check", `'${ch}' has no children and no marker — nothing uses it any more.`, child.id, hl("removed", tn(child.id)));
      parent.kids.delete(ch);
      nodes.delete(child.id);
      t.count("writes");
      yield snap("del-prune", `Prune it.`, parent.id);
    }
  }
}

const OP_RE = /^(insert|search|prefix|delete):[a-z]{1,8}$/;

function checkOps(ops: string[]): string | null {
  const stored = new Set<string>();
  let nodes = 0;
  for (const tok of ops) {
    const { op, word } = parseTrieOp(tok);
    if (op === "insert") {
      stored.add(word);
      nodes = [...stored].reduce((a, w) => a + w.length, 0);
      if (nodes > 30) return "Keep the trie small: at most 30 characters stored in total.";
    }
    if (op === "delete" && !stored.has(word)) return `delete:${word} — "${word}" is not stored at that point.`;
    if (op === "delete") stored.delete(word);
  }
  return null;
}

const algorithm: AlgorithmModule<Input, TreeState> = {
  ...meta,
  renderer: "tree",
  inputSchema: {
    fields: [{ key: "ops", label: "operations", kind: "words", maxLength: 12, pattern: OP_RE, patternHint: "must be insert:word, search:word, prefix:word or delete:word (lowercase, ≤ 8 letters)" }],
    validate: ({ ops }) => checkOps(ops),
  },
  presets: [
    { name: "Shared prefixes (LeetCode-style)", input: { ops: ["insert:apple", "search:apple", "search:app", "prefix:app", "insert:app", "search:app"] } },
    { name: "Car, cart, cat", input: { ops: ["insert:car", "insert:cart", "insert:cat", "search:ca", "prefix:ca", "search:cart"] } },
    { name: "Delete keeps shared nodes", input: { ops: ["insert:tea", "insert:ten", "insert:te", "delete:tea", "search:tea", "search:te", "delete:te", "prefix:te"] } },
    { name: "Edge case: searching an empty trie", input: { ops: ["search:a", "prefix:a"] } },
  ],
  randomInput: (size, rng = Math.random) => {
    const pool = ["a", "ab", "abc", "abd", "b", "ba", "bad", "bat", "cab", "cat"];
    const ops: string[] = [];
    const stored = new Set<string>();
    for (let i = 0; i < Math.max(1, Math.min(10, size + 2)); i++) {
      const op = stored.size && rng() < 0.15 ? "delete" : pick(rng, ["insert", "insert", "search", "prefix"]);
      const word = op === "delete" ? pick(rng, [...stored]) : op === "prefix" ? pick(rng, pool).slice(0, randInt(rng, 1, 2)) : pick(rng, pool);
      if (op === "insert") stored.add(word);
      if (op === "delete") stored.delete(word);
      ops.push(`${op}:${word}`);
    }
    return { ops };
  },
  code: { python, javascript },
  generate,
  reference: ({ ops }) => {
    const stored = new Set<string>();
    const answers: string[] = [];
    for (const tok of ops) {
      const { op, word } = parseTrieOp(tok);
      if (op === "insert") stored.add(word);
      else if (op === "delete") stored.delete(word);
      else if (op === "search") answers.push(stored.has(word) ? "T" : "F");
      else answers.push([...stored].some((w) => w.startsWith(word)) ? "T" : "F");
    }
    return { answers, words: [...stored].sort() };
  },
  outputOf: (s) => s.result,
  info,
  legendLabels: { found: "Word end", path: "Path followed", active: "New edge", current: "Just marked", match: "True / still needed", mismatch: "Missing / False", removed: "Unmarked / pruned" },
};

export default algorithm;
