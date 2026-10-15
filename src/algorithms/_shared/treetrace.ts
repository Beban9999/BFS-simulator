import type { Frame, Highlight, HighlightKind, Step } from "../../engine/types";
import { Tracer, hl } from "../../engine/trace";
import type { ArrayState } from "./array";
import type { BTree } from "./bintree";
import { te, tn, type TreeState, type TreeView } from "./tree";

/**
 * Step helper for recursive binary-tree pages: keeps the call frames, the root→current path,
 * per-node sub-labels (e.g. "h=2") and persistent node marks, and turns them into TreeState steps.
 */
export class TreeTrace {
  t = new Tracer<TreeState>();
  frames: Frame[] = [];
  path: number[] = [];
  /** Text under a node, e.g. the value its call returned. */
  sub = new Map<number, string>();
  /** Persistent highlight per node (e.g. "sorted" once finished). */
  mark = new Map<number, HighlightKind>();
  array?: ArrayState;
  caption?: string;
  links?: TreeView["links"];

  constructor(
    public tree: BTree,
    public name: string,
  ) {}

  enter(id: number, call: string, locals?: Record<string, unknown>): void {
    this.frames.push({ call, locals });
    this.path.push(id);
    this.t.count("calls");
  }

  leave(): void {
    this.frames.pop();
    this.path.pop();
  }

  /** A call on None: pushed and popped around a single step. */
  nullFrame(call: string): void {
    this.frames.push({ call });
    this.t.count("calls");
  }

  get current(): number | null {
    return this.path.length ? this.path[this.path.length - 1] : null;
  }

  step(line: string, message: string, extra: Highlight[] = [], vars: Record<string, unknown> = {}, result?: unknown, pointers?: { name: string; node: number | null }[]): Step<TreeState> {
    const cur = this.current;
    const state: TreeState = {
      trees: [
        {
          ...this.tree.view({ name: this.name, sub: (n) => this.sub.get(n.id), pointers: pointers ?? (cur === null ? [] : [{ name: "node", node: cur }]) }),
          links: this.links,
        },
      ],
      array: this.array,
      caption: this.caption,
      result,
    };
    const marks: Highlight[] = [...this.mark].map(([id, kind]) => ({ id: tn(id), kind }));
    const onPath: Highlight[] = [...hl("active", ...this.path.map(tn)), ...this.path.slice(1).map((id, k) => ({ id: te(this.path[k], id), kind: "active" as const }))];
    return this.t.step(line, message, {
      state,
      vars,
      callStack: this.frames.map((f) => ({ ...f, locals: f.locals ? { ...f.locals } : undefined })),
      highlights: [...marks, ...onPath, ...(cur !== null ? hl("current", tn(cur)) : []), ...extra],
    });
  }
}
