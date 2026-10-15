import type { ArrayState } from "./array";

export interface SQItem {
  /** Stable identity so items glide when the container shifts. */
  id: number;
  label: string;
  /** Small second line, e.g. the index an item came from. */
  sub?: string;
}

export interface SQContainer {
  name: string;
  /** stack: vertical, bottom → top · queue / deque: horizontal, front → back · ring: circular buffer. */
  kind: "stack" | "queue" | "deque" | "ring";
  /** stack: bottom first; queue / deque: front first. Unused for rings. */
  items: SQItem[];
  /** Ring only: raw slots (null = empty). */
  slots?: (SQItem | null)[];
  /** Ring only: labelled slot indexes, e.g. front / rear. */
  pointers?: { name: string; index: number }[];
  /** Short line under the container, e.g. "size 3 / 5". */
  note?: string;
}

export interface SQState {
  /** Input / output rows drawn above the containers with the array renderer (ids `ai(i, row)`). */
  array?: ArrayState;
  containers: SQContainer[];
  caption?: string;
  result?: unknown;
}

/** Highlight id of an item (by stable id) in container c, and of a ring slot. */
export const qid = (c: number, itemId: number) => `q:${c}:${itemId}`;
export const slotId = (c: number, slot: number) => `r:${c}:${slot}`;

/** Mutable container used inside generators; `view()` snapshots it for the renderer. */
export class Box {
  items: SQItem[] = [];
  private static nextId = 0;

  constructor(
    public name: string,
    public kind: "stack" | "queue" | "deque" = "stack",
  ) {}

  static resetIds(): void {
    Box.nextId = 0;
  }

  static item(label: string | number, sub?: string): SQItem {
    return { id: Box.nextId++, label: String(label), sub };
  }

  /** Add at the back (stack: top). Returns the new item. */
  push(label: string | number, sub?: string): SQItem {
    const it = Box.item(label, sub);
    this.items.push(it);
    return it;
  }

  pushFront(label: string | number, sub?: string): SQItem {
    const it = Box.item(label, sub);
    this.items.unshift(it);
    return it;
  }

  /** Remove from the back (stack: top). */
  pop(): SQItem {
    return this.items.pop()!;
  }

  /** Remove from the front (queue dequeue). */
  shift(): SQItem {
    return this.items.shift()!;
  }

  get top(): SQItem | undefined {
    return this.items[this.items.length - 1];
  }

  get front(): SQItem | undefined {
    return this.items[0];
  }

  get size(): number {
    return this.items.length;
  }

  labels(): string[] {
    return this.items.map((i) => i.label);
  }

  view(note?: string): SQContainer {
    return { name: this.name, kind: this.kind, items: this.items.slice(), note };
  }
}

/** Parse an operation token like "push:3" into [name, arg]. */
export function parseOp(token: string): [string, number | undefined] {
  const [name, arg] = token.split(":");
  return [name, arg === undefined ? undefined : Number(arg)];
}

/** Integer arithmetic for the calculator pages: division truncates toward zero; `|| 0` turns -0 into 0. */
export function applyOp(op: string, a: number, b: number): number {
  const r = op === "+" ? a + b : op === "-" ? a - b : op === "*" ? a * b : Math.trunc(a / b);
  return r || 0;
}
