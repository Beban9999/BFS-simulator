/** Small record sorts used by the stability note. Each sorts a copy by `key` (ascending) and never looks at anything else. */

export interface Rec {
  /** Original position, shown as a subscript. */
  pos: number;
  label: string;
  key: number;
  keyText: string;
}

export type SortName = "insertion" | "merge" | "selection" | "heap" | "quick";

export const STABLE: Record<SortName, boolean> = { insertion: true, merge: true, selection: false, heap: false, quick: false };

export const SORT_LABEL: Record<SortName, string> = {
  insertion: "Insertion sort",
  merge: "Merge sort",
  selection: "Selection sort",
  heap: "Heap sort",
  quick: "Quick sort (Lomuto)",
};

function insertion(a: Rec[]): void {
  for (let i = 1; i < a.length; i++) {
    const x = a[i];
    let j = i - 1;
    // Strict > : an equal key never jumps over an earlier one.
    while (j >= 0 && a[j].key > x.key) {
      a[j + 1] = a[j];
      j--;
    }
    a[j + 1] = x;
  }
}

function merge(a: Rec[]): Rec[] {
  if (a.length <= 1) return a;
  const mid = a.length >> 1;
  const l = merge(a.slice(0, mid));
  const r = merge(a.slice(mid));
  const out: Rec[] = [];
  let i = 0;
  let j = 0;
  // <= takes the left element on ties, which keeps equal keys in order.
  while (i < l.length && j < r.length) out.push(l[i].key <= r[j].key ? l[i++] : r[j++]);
  return out.concat(l.slice(i), r.slice(j));
}

function selection(a: Rec[]): void {
  for (let i = 0; i < a.length - 1; i++) {
    let m = i;
    for (let j = i + 1; j < a.length; j++) if (a[j].key < a[m].key) m = j;
    // The long-distance swap can jump a[i] over records with its own key.
    [a[i], a[m]] = [a[m], a[i]];
  }
}

function heap(a: Rec[]): void {
  const n = a.length;
  const sift = (i: number, size: number) => {
    for (;;) {
      let big = i;
      const l = 2 * i + 1;
      const r = l + 1;
      if (l < size && a[l].key > a[big].key) big = l;
      if (r < size && a[r].key > a[big].key) big = r;
      if (big === i) return;
      [a[i], a[big]] = [a[big], a[i]];
      i = big;
    }
  };
  for (let i = (n >> 1) - 1; i >= 0; i--) sift(i, n);
  for (let end = n - 1; end > 0; end--) {
    [a[0], a[end]] = [a[end], a[0]];
    sift(0, end);
  }
}

function quick(a: Rec[], lo = 0, hi = a.length - 1): void {
  if (lo >= hi) return;
  const p = a[hi].key;
  let i = lo;
  for (let j = lo; j < hi; j++) {
    if (a[j].key < p) {
      [a[i], a[j]] = [a[j], a[i]];
      i++;
    }
  }
  [a[i], a[hi]] = [a[hi], a[i]];
  quick(a, lo, i - 1);
  quick(a, i + 1, hi);
}

export function sortRecords(recs: Rec[], name: SortName): Rec[] {
  const a = recs.slice();
  if (name === "merge") return merge(a);
  if (name === "insertion") insertion(a);
  else if (name === "selection") selection(a);
  else if (name === "heap") heap(a);
  else quick(a);
  return a;
}

/** Keys whose records came out in a different relative order than they went in. */
export function brokenKeys(sorted: Rec[]): Set<number> {
  const last = new Map<number, number>();
  const broken = new Set<number>();
  for (const r of sorted) {
    const prev = last.get(r.key);
    if (prev !== undefined && prev > r.pos) broken.add(r.key);
    last.set(r.key, r.pos);
  }
  return broken;
}
