import type { AlgorithmModule, Highlight } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { ai, range, type Pointer, type Range } from "../../_shared/array";
import { Sortable, randomSortInput, sortField, sortPresets, sortedCopy, type SortInput } from "../../_shared/sorting";
import { heapView, tn, type TreeState } from "../../_shared/tree";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

function* generate({ nums }: SortInput) {
  const t = new Tracer<TreeState>();
  const s = new Sortable(nums);
  const n = nums.length;
  let size = n;
  let phase = "build";

  const snap = (pointers: Pointer[], highlights: Highlight[], vars: Record<string, unknown>) => {
    const ranges: Range[] = [
      ...(size > 0 ? [{ from: 0, to: size - 1, kind: "active" as const, label: phase === "build" ? "building heap" : "max-heap" }] : []),
      ...(size < n ? [{ from: size, to: n - 1, kind: "sorted" as const, label: "sorted" }] : []),
    ];
    // Tree view of the heap part (indexes 0..size-1); every bar highlight is mirrored onto its node.
    const items = range(size).map((k) => ({ id: s.ids[k], v: s.a[k] }));
    const all = [...s.sortedHl(), ...highlights];
    const mirrored = all.flatMap((h) => {
      const k = Number(h.id.split(":")[1]);
      return h.id.startsWith("0:") && k < size ? [{ id: tn(s.ids[k]), kind: h.kind }] : [];
    });
    const state: TreeState = {
      trees: [heapView(items, `max-heap (tree view of nums[0..${size - 1}])`, { pointers: pointers.filter((p) => p.index < size) })],
      array: s.state(pointers, ranges),
    };
    return { state, vars: { ...vars, "heap size": size }, highlights: [...all, ...mirrored] };
  };

  function* siftDown(start: number): Generator<ReturnType<typeof t.step>, void> {
    let i = start;
    for (;;) {
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      const kids = [l, r].filter((c) => c < size);
      if (!kids.length) {
        yield t.step("settled", `Index ${i} has no children inside the heap: it is a leaf, nothing to fix.`, snap([{ name: "i", index: i }], hl("current", ai(i)), { i }));
        return;
      }
      yield t.step("sift", `Sift down from index ${i} (${s.a[i]}): its children are ${kids.map((c) => `nums[${c}] = ${s.a[c]}`).join(" and ")}.`, snap([{ name: "i", index: i }, ...kids.map((c) => ({ name: c === l ? "l" : "r", index: c }))], [...hl("current", ai(i)), ...hl("compare", ...kids.map((c) => ai(c)))], { i, l, r }));
      let largest = i;
      if (l < size) {
        t.count("comparisons");
        if (s.a[l] > s.a[largest]) largest = l;
      }
      if (r < size) {
        t.count("comparisons");
        if (s.a[r] > s.a[largest]) largest = r;
      }
      yield t.step(r < size ? "compare-right" : "compare-left", largest === i ? `${s.a[i]} is ≥ its children.` : `The largest of the three is nums[${largest}] = ${s.a[largest]}.`, snap([{ name: "i", index: i }, { name: "largest", index: largest }], [...hl("current", ai(i)), ...hl("found", ai(largest))], { i, l, r, largest }));
      if (largest === i) {
        yield t.step("settled", `Heap property holds at index ${i}. Stop sifting.`, snap([{ name: "i", index: i }], hl("current", ai(i)), { i, largest }));
        return;
      }
      s.swap(i, largest);
      t.count("swaps");
      yield t.step("sift-swap", `Swap ${s.a[largest]} down to index ${largest} and ${s.a[i]} up to index ${i}; keep sifting from ${largest}.`, snap([{ name: "i", index: largest }], hl("swap", ai(i), ai(largest)), { i: largest }));
      i = largest;
    }
  }

  for (let i = (n >> 1) - 1; i >= 0; i--) {
    yield t.step("build", `Build phase: heapify the subtree rooted at index ${i} (indexes ${(n >> 1)}..${n - 1} are leaves and already heaps).`, snap([{ name: "i", index: i }], hl("current", ai(i)), { i }));
    yield* siftDown(i);
  }
  phase = "extract";

  for (let end = n - 1; end > 0; end--) {
    s.swap(0, end);
    t.count("swaps");
    size = end;
    s.done.add(end);
    yield t.step("extract", `The root is the maximum of the heap. Swap it to index ${end} — final — and shrink the heap to ${end} element${end === 1 ? "" : "s"}.`, snap([{ name: "end", index: end }], hl("swap", ai(0), ai(end)), { end }));
    if (end > 1) yield* siftDown(0);
  }

  size = 0;
  s.markAll();
  yield t.step("done", `Sorted: [${s.a.join(", ")}].`, {
    state: { trees: [heapView([], "max-heap (empty)")], array: s.state([], [], [], s.a.slice()), result: s.a.slice() },
    highlights: s.sortedHl(),
  });
}

const algorithm: AlgorithmModule<SortInput, TreeState> = {
  ...meta,
  renderer: "tree",
  inputSchema: { fields: [sortField({ maxLength: 16 })] },
  presets: sortPresets([{ name: "Already a max-heap", input: { nums: [9, 7, 8, 3, 6, 5, 4, 1, 2] } }]),
  randomInput: (size, rng) => randomSortInput(Math.min(size, 12), rng),
  code: { python, javascript },
  generate,
  reference: sortedCopy,
  outputOf: (s) => s.result,
  info,
  legendLabels: { active: "Heap part", current: "Sifting node", compare: "Its children", found: "Largest of the three", swap: "Swapped", sorted: "Final position" },
};

export default algorithm;
