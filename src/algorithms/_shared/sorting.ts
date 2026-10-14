import type { Highlight, NumbersField, Preset, Rng } from "../../engine/types";
import { hl } from "../../engine/trace";
import { randInt, shuffle } from "../../engine/random";
import { ai, range, type ArrayRow, type ArrayState, type Pointer, type Range } from "./array";

export interface SortInput {
  nums: number[];
}

/** Working array for sorting generators: values plus stable ids so the renderer can animate moves. */
export class Sortable {
  a: number[];
  ids: number[];
  done = new Set<number>();

  constructor(nums: number[]) {
    this.a = nums.slice();
    this.ids = range(nums.length);
  }

  swap(i: number, j: number): void {
    [this.a[i], this.a[j]] = [this.a[j], this.a[i]];
    [this.ids[i], this.ids[j]] = [this.ids[j], this.ids[i]];
  }

  row(label?: string): ArrayRow {
    return { label, values: this.a.slice(), ids: this.ids.slice(), bars: true };
  }

  state(pointers: Pointer[] = [], ranges: Range[] = [], extraRows: ArrayRow[] = [], result?: number[]): ArrayState {
    return { rows: [this.row(), ...extraRows], pointers, ranges, result };
  }

  /** Highlights for indexes already in their final position. */
  sortedHl(): Highlight[] {
    return hl("sorted", ...[...this.done].map((k) => ai(k)));
  }

  markAll(): void {
    for (let k = 0; k < this.a.length; k++) this.done.add(k);
  }
}

export function sortField(opts: Partial<NumbersField> = {}): NumbersField {
  return { key: "nums", label: "nums", kind: "numbers", integer: true, min: 0, max: 99, minLength: 1, maxLength: 24, ...opts };
}

export function sortPresets(extra: Preset<SortInput>[] = []): Preset<SortInput>[] {
  return [
    { name: "Random 10", input: { nums: [38, 27, 43, 3, 9, 82, 10, 55, 19, 64] } },
    ...extra,
    { name: "Edge case: already sorted", input: { nums: [1, 2, 3, 4, 5, 6, 7, 8] } },
    { name: "Worst case: reversed", input: { nums: [9, 8, 7, 6, 5, 4, 3, 2, 1] } },
    { name: "Duplicates", input: { nums: [5, 1, 4, 5, 2, 1, 5, 3, 2] } },
  ];
}

export function randomSortInput(size: number, rng: Rng = Math.random, max = 99): SortInput {
  const n = Math.max(1, Math.min(24, size + 2));
  if (rng() < 0.15) return { nums: shuffle(rng, range(n).map((k) => k + 1)) };
  return { nums: Array.from({ length: n }, () => randInt(rng, 0, max)) };
}

export const sortedCopy = ({ nums }: SortInput) => nums.slice().sort((x, y) => x - y);
