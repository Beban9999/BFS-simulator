import type { AlgorithmModule, Highlight } from "../../../engine/types";
import { Tracer, hl } from "../../../engine/trace";
import { randInt } from "../../../engine/random";
import { ListModel, arrowList, eid, listField, nid, type ListState, type NodeId } from "../../_shared/list";
import meta from "./meta";
import python from "./code.py.txt?raw";
import javascript from "./code.js.txt?raw";
import info from "./info.md?raw";

interface Input {
  l1: number[];
  l2: number[];
}

/** Digits are least significant first, so the number reads right to left. */
const asNumber = (digits: (number | string)[]) => digits.slice().reverse().join("") || "0";

function* generate({ l1: a, l2: b }: Input) {
  const t = new Tracer<ListState>();
  const m = new ListModel(3, ["l1", "l2", "sum"]);
  m.rows[0].push(null);
  m.rows[1].push(null);
  let l1 = m.chain(a, 0);
  let l2 = m.chain(b, 1);
  const dummy = m.add("·", 2, { ghost: true, label: "dummy" });
  let tail = dummy;
  let carry = 0;
  let col = 0;
  const v = (id: NodeId | null) => (id === null ? "null" : id === dummy ? "dummy" : m.val(id));

  const snap = (extra: Highlight[] = [], vars: Record<string, unknown> = {}, result?: unknown) => ({
    state: m.state({
      pointers: [
        { name: "l1", node: l1 },
        { name: "l2", node: l2 },
        { name: "tail", node: tail },
      ],
      caption: `${asNumber(a)} + ${asNumber(b)} (digits are stored ones-first, so each list reads right to left)`,
      result,
    }),
    vars: { carry, ...vars },
    highlights: [...hl("sorted", ...m.ids(m.next[dummy]).map(nid)), ...extra],
  });

  yield t.step("init", `Create a dummy head for the result; carry = 0. Column 1 is the ones digit — the heads of both lists.`, snap());

  while (true) {
    t.count("comparisons");
    if (l1 === null && l2 === null && carry === 0) {
      yield t.step("loop", "Both lists are finished and there is no carry left — stop.", snap());
      break;
    }
    col++;
    const why = l1 !== null || l2 !== null ? `${[l1 !== null && "l1", l2 !== null && "l2"].filter(Boolean).join(" and ")} still ha${l1 !== null && l2 !== null ? "ve" : "s"} digits` : `only the carry (${carry}) is left`;
    yield t.step("loop", `Column ${col}: ${why}, so keep going.`, snap(hl("active", l1 !== null && nid(l1), l2 !== null && nid(l2))));
    const x = l1 === null ? 0 : (m.val(l1) as number);
    const y = l2 === null ? 0 : (m.val(l2) as number);
    const total = x + y + carry;
    t.count("accesses", 2);
    const colHl = hl("active", l1 !== null && nid(l1), l2 !== null && nid(l2));
    yield t.step(
      "sum",
      `total = ${x}${l1 === null ? " (l1 is done)" : ""} + ${y}${l2 === null ? " (l2 is done)" : ""} + carry ${carry} = ${total}.`,
      snap(colHl, { x, y, total }),
    );
    const prevCarry = carry;
    carry = Math.floor(total / 10);
    const digit = total % 10;
    yield t.step(
      "digit",
      total >= 10 ? `${total} ≥ 10: write digit ${digit} and carry ${carry} into the next column.` : `${total} < 10: write digit ${digit}, carry 0.`,
      snap(colHl, { x, y, total, digit, "old carry": prevCarry }),
    );
    const node = m.add(digit, null);
    m.place(node, 2, col);
    m.next[tail] = node;
    t.count("writes");
    yield t.step("append", `Append a new node ${digit} to the result and move tail to it.`, snap([...colHl, ...hl("current", nid(node)), ...hl("swap", eid(tail, node))], { digit }));
    tail = node;
    l1 = l1 === null ? null : m.next[l1];
    l2 = l2 === null ? null : m.next[l2];
    yield t.step("advance", `Move both lists to the next column: l1 → ${v(l1)}, l2 → ${v(l2)}.`, snap());
  }

  const result = m.values(m.next[dummy]);
  yield t.step("done", `Return dummy.next: ${arrowList(result)}, i.e. ${asNumber(a)} + ${asNumber(b)} = ${asNumber(result)}.`, snap([], {}, result));
}

const digitsField = (key: "l1" | "l2") => listField(key, key, { min: 0, max: 9, minLength: 1, maxLength: 7, help: "Digits 0–9, ones digit first (342 is 2, 4, 3)." });

const noLeadingZero = (d: number[]) => d.length === 1 || d[d.length - 1] !== 0;

const algorithm: AlgorithmModule<Input, ListState> = {
  ...meta,
  renderer: "linkedlist",
  inputSchema: {
    fields: [digitsField("l1"), digitsField("l2")],
    validate: ({ l1, l2 }) => (noLeadingZero(l1) && noLeadingZero(l2) ? null : "The last digit (the most significant one) cannot be 0 unless the number is just 0."),
  },
  presets: [
    { name: "LeetCode example: 342 + 465", input: { l1: [2, 4, 3], l2: [5, 6, 4] } },
    { name: "Edge case: 0 + 0", input: { l1: [0], l2: [0] } },
    { name: "Different lengths: 9999999 + 9999", input: { l1: [9, 9, 9, 9, 9, 9, 9], l2: [9, 9, 9, 9] } },
    { name: "Final carry makes a new node: 99 + 1", input: { l1: [9, 9], l2: [1] } },
  ],
  randomInput: (size, rng = Math.random) => {
    const digits = () => {
      const len = randInt(rng, 1, Math.max(1, Math.min(7, size)));
      const d = Array.from({ length: len }, () => randInt(rng, 0, 9));
      if (len > 1 && d[len - 1] === 0) d[len - 1] = randInt(rng, 1, 9);
      return d;
    };
    return { l1: digits(), l2: digits() };
  },
  code: { python, javascript },
  generate,
  reference: ({ l1, l2 }) => {
    const out: number[] = [];
    let carry = 0;
    for (let i = 0; i < Math.max(l1.length, l2.length) || carry; i++) {
      const s = (l1[i] ?? 0) + (l2[i] ?? 0) + carry;
      out.push(s % 10);
      carry = s >= 10 ? 1 : 0;
    }
    return out;
  },
  outputOf: (s) => s.result,
  info,
  legendLabels: { active: "Digits in this column", current: "New digit node", swap: "New link", sorted: "Result so far" },
};

export default algorithm;
