import type { Highlight } from "../../engine/types";
import { hl } from "../../engine/trace";
import type { ArrayState } from "./array";
import type { MatrixState } from "./matrix";

/** One drawn node of a decision tree. */
export interface DTNodeView {
  id: number;
  /** Short text inside the node: the choice made on the way in (e.g. "3", "Q@2", "("). */
  label: string;
  /** Longer text shown on hover, e.g. the partial solution "[1, 3]". */
  title?: string;
  /** Set on a placeholder that stands for this many hidden finished nodes. */
  collapsed?: number;
}

export interface DTreeView {
  root: number;
  nodes: DTNodeView[];
  children: Record<number, number[]>;
  /** Node to keep scrolled into view. */
  current: number;
}

export interface DecisionState {
  tree: DTreeView;
  /** Concrete state beside the tree (path, candidates…), ids `ai(i, row)`. */
  array?: ArrayState;
  /** A board beside the tree (queens, sudoku, word grid), ids `mi(r, c)`. */
  matrix?: MatrixState;
  caption?: string;
  /** Heading above the tree (default "Decision tree"), e.g. "Recursion tree". */
  treeTitle?: string;
  result?: unknown;
}

/** Highlight ids: decision-tree node and the edge into it. */
export const dn = (id: number) => `dn:${id}`;
export const de = (parent: number, child: number) => `de:${parent}-${child}`;

type Status = "open" | "done" | "found" | "pruned";

interface Node {
  id: number;
  parent: number | null;
  label: string;
  title?: string;
  status: Status;
  kids: number[];
}

/**
 * Records the recursion of a backtracking search as a tree.
 * Generators call `child` (choose), `enter` (explore), `finish` (un-choose / return) and `prune` (a choice not taken),
 * then put `view()` in the state and `marks()` in the highlights of each step.
 */
export class DecisionTree {
  private nodes: Node[] = [];
  current = 0;

  /** `limit`: visible nodes before finished subtrees off the current path are folded into "+k" placeholders. */
  constructor(rootLabel: string, rootTitle?: string, private limit = 70) {
    this.nodes.push({ id: 0, parent: null, label: rootLabel, title: rootTitle, status: "open", kids: [] });
  }

  get size(): number {
    return this.nodes.length;
  }

  /** Create a child of `parent` (default: the current node) and return its id. */
  child(label: string, title?: string, parent = this.current): number {
    const id = this.nodes.length;
    this.nodes.push({ id, parent, label, title, status: "open", kids: [] });
    this.nodes[parent].kids.push(id);
    return id;
  }

  /** A branch that is cut off without being explored (drawn greyed out). */
  prune(label: string, title?: string, parent = this.current): number {
    const id = this.child(label, title, parent);
    this.nodes[id].status = "pruned";
    return id;
  }

  enter(id: number): void {
    this.current = id;
  }

  /** Close node `id` (default current) and move back to its parent. */
  finish(status: "done" | "found" | "pruned" = "done", id = this.current): void {
    // A solution stays a solution when its call returns.
    if (!(status === "done" && this.nodes[id].status === "found")) this.nodes[id].status = status;
    this.current = this.nodes[id].parent ?? id;
  }

  /** Mark a node as a solution without leaving it. */
  found(id = this.current): void {
    this.nodes[id].status = "found";
  }

  /** Change a node's text, e.g. to show the value a call returned. */
  relabel(id: number, label: string, title?: string): void {
    this.nodes[id].label = label;
    if (title !== undefined) this.nodes[id].title = title;
  }

  parentOf(id: number): number | null {
    return this.nodes[id].parent;
  }

  /** Root → current path. */
  path(id = this.current): number[] {
    const out: number[] = [];
    for (let x: number | null = id; x !== null; x = this.nodes[x].parent) out.unshift(x);
    return out;
  }

  view(): DTreeView {
    const onPath = new Set(this.path());
    const N = this.nodes.length;
    // Parents are always created before their children, so one backward pass gives subtree sizes
    // and one forward pass decides folding (a node is hidden when its parent is hidden or folded).
    const size = new Array<number>(N).fill(1);
    for (let i = N - 1; i > 0; i--) size[this.nodes[i].parent!] += size[i];
    const hidden = new Array<boolean>(N).fill(false);
    const folded = new Map<number, number>();
    let visible = N;
    // Creation order is preorder, so early finished subtrees (oldest, highest) fold first.
    for (const n of this.nodes) {
      if (n.parent === null) continue;
      if (hidden[n.parent] || folded.has(n.parent)) {
        hidden[n.id] = true;
        continue;
      }
      if (visible > this.limit && !onPath.has(n.id) && n.status !== "open" && n.kids.length) {
        folded.set(n.id, size[n.id] - 1);
        visible -= size[n.id] - 1;
      }
    }
    const nodes: DTNodeView[] = [];
    const children: Record<number, number[]> = {};
    for (const n of this.nodes) {
      if (hidden[n.id]) continue;
      const k = folded.get(n.id);
      nodes.push({ id: n.id, label: n.label, ...(n.title ? { title: n.title } : {}), ...(k ? { collapsed: k } : {}) });
      if (!k && n.kids.length) children[n.id] = n.kids.slice();
    }
    return { root: 0, nodes, children, current: this.current };
  }

  /** Standard colouring: solutions found, pruned branches, finished nodes, the current path and node. */
  marks(): Highlight[] {
    const path = this.path();
    const by = (s: Status) => this.nodes.filter((n) => n.status === s && n.parent !== null);
    return [
      ...hl("visited", ...by("done").map((n) => dn(n.id))),
      ...hl("pruned", ...by("pruned").flatMap((n) => [dn(n.id), de(n.parent!, n.id)])),
      ...hl("found", ...by("found").map((n) => dn(n.id))),
      ...hl("active", ...path.map(dn), ...path.slice(1).map((x, i) => de(path[i], x))),
      ...hl("current", dn(this.current)),
    ];
  }
}
