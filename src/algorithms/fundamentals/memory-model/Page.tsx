import { useState } from "react";
import { Choice, NoteCard, NoteGrid, PageLink } from "../../../components/note/Note";
import { usePrefs } from "../../../store/prefs";
import { SCENARIOS, type Obj, type Snapshot } from "./scenarios";

/* ---------- Names → objects diagram ---------- */

const NAME_W = 118;
const ROW = 56;
const BOX_H = 30;
const OBJ_X = 230;
const CELL = 34;

function objWidth(o: Obj) {
  return o.kind === "int" ? 46 : Math.max(1, (o.value as unknown[]).length) * CELL;
}

function Diagram({ snap, prev }: { snap: Snapshot; prev?: Snapshot }) {
  // Objects named directly come first, in name order, so the name arrows don't cross.
  const rank = (id: string) => {
    const k = snap.names.findIndex(([, ref]) => ref === id);
    return k < 0 ? snap.names.length : k;
  };
  const ordered = snap.objects.map((o, j) => ({ o, j })).sort((p, q) => rank(p.o.id) - rank(q.o.id) || p.j - q.j);
  const objY = new Map(ordered.map(({ o }, j) => [o.id, 12 + j * ROW]));
  const height = Math.max(snap.names.length, snap.objects.length) * ROW + 16;
  const right = OBJ_X + Math.max(...snap.objects.map(objWidth));
  const width = right + 48;
  const changed = (o: Obj) => {
    const before = prev?.objects.find((p) => p.id === o.id);
    return !before || JSON.stringify(before.value) !== JSON.stringify(o.value);
  };
  const live = new Set(snap.names.map(([, id]) => id));
  for (const o of snap.objects) if (o.kind === "list") for (const c of o.value as unknown[]) if (typeof c === "object" && c) live.add((c as { ref: string }).ref);

  return (
    <svg className="mm-svg" viewBox={`0 0 ${width} ${height}`} style={{ maxWidth: width }} role="img" aria-label={snap.note}>
      <defs>
        <marker id="mm-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse" markerUnits="userSpaceOnUse">
          <path d="M0,0 L10,5 L0,10 z" className="mm-head" />
        </marker>
      </defs>
      <text className="mm-col" x={4} y={10}>
        names
      </text>
      <text className="mm-col" x={OBJ_X} y={10}>
        objects
      </text>
      {snap.names.map(([name, id], i) => {
        const y = 16 + i * ROW;
        const ty = (objY.get(id) ?? 0) + 4 + BOX_H / 2;
        const x1 = 4 + NAME_W;
        return (
          <g key={name}>
            <rect className="mm-name" x={4} y={y} width={NAME_W} height={BOX_H} rx={6} />
            <text className="mm-text" x={4 + NAME_W / 2} y={y + BOX_H / 2} textAnchor="middle" dominantBaseline="middle">
              {name}
            </text>
            <path className="mm-link" d={`M${x1},${y + BOX_H / 2} C${x1 + 50},${y + BOX_H / 2} ${OBJ_X - 50},${ty} ${OBJ_X - 2},${ty}`} markerEnd="url(#mm-arrow)" />
          </g>
        );
      })}
      {snap.objects.map((o) => {
        const y = (objY.get(o.id) ?? 0) + 4;
        const cls = `mm-obj${changed(o) ? " changed" : ""}${live.has(o.id) ? "" : " garbage"}`;
        if (o.kind === "int") {
          return (
            <g key={o.id} className={cls}>
              <rect x={OBJ_X} y={y} width={46} height={BOX_H} rx={15} />
              <text className="mm-text" x={OBJ_X + 23} y={y + BOX_H / 2} textAnchor="middle" dominantBaseline="middle">
                {o.value as number}
              </text>
            </g>
          );
        }
        const cells = o.value as (number | { ref: string })[];
        return (
          <g key={o.id} className={cls}>
            {cells.map((c, k) => {
              const x = OBJ_X + k * CELL;
              if (typeof c === "number") {
                return (
                  <g key={k}>
                    <rect x={x} y={y} width={CELL} height={BOX_H} />
                    <text className="mm-text" x={x + CELL / 2} y={y + BOX_H / 2} textAnchor="middle" dominantBaseline="middle">
                      {c}
                    </text>
                  </g>
                );
              }
              const top = (objY.get(c.ref) ?? 0) + 4;
              const target = snap.objects.find((t) => t.id === c.ref);
              const cx = x + CELL / 2;
              const cy = y + BOX_H / 2;
              // Enter the target from above or below, next to its first cell.
              const ey = top > y ? top - 1 : top + BOX_H + 1;
              const ex = OBJ_X + 12;
              const my = (cy + ey) / 2;
              return (
                <g key={k}>
                  <rect x={x} y={y} width={CELL} height={BOX_H} />
                  <circle className="mm-dot" cx={cx} cy={y + BOX_H / 2} r={3.5} />
                  <path
                    className="mm-link ref"
                    d={
                      Math.abs(top - y) <= ROW
                        ? `M${cx},${cy} C${cx},${my} ${ex},${my} ${ex},${ey}`
                        : `M${cx},${cy} C${right + 36},${cy} ${right + 36},${top + BOX_H / 2} ${OBJ_X + objWidth(target!) + 2},${top + BOX_H / 2}`
                    }
                    markerEnd="url(#mm-arrow)"
                  />
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

function ScenarioCard() {
  const [sid, setSid] = useState(SCENARIOS[0].id);
  const [i, setI] = useState(0);
  const language = usePrefs((s) => s.language);
  const setLanguage = usePrefs((s) => s.setLanguage);
  const sc = SCENARIOS.find((s) => s.id === sid)!;
  const step = Math.min(i, sc.steps.length - 1);
  const snap = sc.steps[step];
  const js = language === "javascript";
  const lines = js ? sc.javascript : sc.python;
  const current = js ? snap.js : snap.py;

  return (
    <NoteCard
      title="Names point to objects"
      actions={
        <Choice
          label="Language"
          value={js ? "javascript" : "python"}
          onChange={(l) => setLanguage(l)}
          options={[
            ["python", "Python"],
            ["javascript", "JavaScript"],
          ]}
        />
      }
    >
      <div className="note-controls">
        <Choice
          label="Scenario"
          value={sid}
          onChange={(v) => {
            setSid(v);
            setI(0);
          }}
          options={SCENARIOS.map((s) => [s.id, s.title])}
        />
      </div>
      <div className="mm-layout">
        <div>
          <pre className="note-pre mm-code">
            {lines.map((l, k) => (
              <div key={k} className={k === current ? "mm-line current" : "mm-line"}>
                {l || " "}
              </div>
            ))}
          </pre>
          <div className="mm-nav">
            <button type="button" className="btn btn-secondary small" disabled={step === 0} onClick={() => setI(step - 1)}>
              ← Back
            </button>
            <span className="note-muted">
              step {step + 1} / {sc.steps.length}
            </span>
            <button type="button" className="btn btn-primary small" disabled={step === sc.steps.length - 1} onClick={() => setI(step + 1)}>
              Next line →
            </button>
          </div>
          <p className="mm-note" aria-live="polite">
            {snap.note}
          </p>
        </div>
        <Diagram snap={snap} prev={step > 0 ? sc.steps[step - 1] : undefined} />
      </div>
    </NoteCard>
  );
}

/* ---------- Array vs linked list layout ---------- */

const VALUES = [7, 3, 9, 4, 1, 8];
/** Node addresses of the linked list, scattered like real heap allocations (hex, 16-byte nodes). */
const NODE_ADDR = [0x2a40, 0x1f10, 0x3c80, 0x2050, 0x34e0, 0x1b30];
const hex = (a: number) => `0x${a.toString(16)}`;

function LayoutCard() {
  const [idx, setIdx] = useState(3);
  const order = NODE_ADDR.map((a, k) => ({ a, k })).sort((p, q) => p.a - q.a);
  return (
    <NoteCard title="Array vs linked list in memory">
      <div className="note-controls">
        <label>
          read element i =
          <input type="range" min={0} max={VALUES.length - 1} value={idx} onChange={(e) => setIdx(Number(e.target.value))} aria-label="Index to read" />
          <b>{idx}</b>
        </label>
      </div>
      <h3 className="rec-title">Array: one contiguous block (4-byte ints from 0x1000)</h3>
      <div className="mm-strip">
        {VALUES.map((v, k) => (
          <div key={k} className={`mm-slot${k === idx ? " hit" : ""}`}>
            <span className="mm-addr">{hex(0x1000 + 4 * k)}</span>
            <b>{v}</b>
            <span className="mm-addr">[{k}]</span>
          </div>
        ))}
      </div>
      <p className="note-muted">
        address = 0x1000 + {idx} × 4 = <code>{hex(0x1000 + 4 * idx)}</code>: <b>1 read</b>, O(1). Neighbours share cache lines, so scanning is fast too.
      </p>
      <h3 className="rec-title" style={{ marginTop: 14 }}>
        Linked list: nodes wherever the allocator put them (sorted by address)
      </h3>
      <div className="mm-strip">
        {order.map(({ a, k }) => (
          <div key={a} className={`mm-slot node${k < idx ? " hop" : ""}${k === idx ? " hit" : ""}`}>
            <span className="mm-addr">{hex(a)}</span>
            <b>{VALUES[k]}</b>
            <span className="mm-addr">next → {k + 1 < NODE_ADDR.length ? hex(NODE_ADDR[k + 1]) : "null"}</span>
          </div>
        ))}
      </div>
      <p className="note-muted">
        Start at head = <code>{hex(NODE_ADDR[0])}</code> and follow {idx} next pointer{idx === 1 ? "" : "s"}: <b>{idx + 1} reads</b>, O(n), each jumping to an
        unrelated address. In exchange, inserting after a node you already hold is O(1) — no shifting.
      </p>
    </NoteCard>
  );
}

const LANGS: [string, string, string][] = [
  ["Python", "Every variable is a reference to an object. int, float, str, tuple are immutable; list, dict, set and your own objects are mutable.", "copy.copy / copy.deepcopy, list(a), a[:]"],
  ["JavaScript", "Primitives (number, string, boolean…) are copied by value; objects and arrays are shared by reference.", "[...a], structuredClone(obj)"],
  ["Java", "Primitives (int, double…) hold values; everything else is a reference to a heap object. Arguments are always passed by value — for objects that value is the reference.", "clone(), new ArrayList<>(list), Arrays.copyOf"],
  ["C++", "Variables hold values by default: assigning a vector copies it. Use & (reference) or pointers to share.", "copy by assignment; pass const T& to avoid copies"],
];

export default function MemoryModel() {
  return (
    <>
      <ScenarioCard />
      <LayoutCard />
      <NoteGrid>
        <NoteCard title="Value vs reference by language">
          <div className="note-table-wrap">
            <table className="note-table">
              <thead>
                <tr>
                  <th>Language</th>
                  <th>Model</th>
                  <th>Copying</th>
                </tr>
              </thead>
              <tbody>
                {LANGS.map(([l, model, copy]) => (
                  <tr key={l}>
                    <td>{l}</td>
                    <td>{model}</td>
                    <td>
                      <code>{copy}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </NoteCard>
        <NoteCard title="Where it bites in interviews">
          <ul className="bigo-rules">
            <li>
              Saving <code>path</code> instead of a copy in backtracking — every answer ends up the same list (
              <PageLink id="backtracking-template" />
              ).
            </li>
            <li>
              <code>[[0] * m] * n</code> for a DP table: all rows are one object (scenario 5 above).
            </li>
            <li>
              A mutable default argument <code>def f(x, seen=set())</code> is created once and shared by every call.
            </li>
            <li>
              Shallow copies of nested structures: <code>[...grid]</code> copies the outer array only; the rows are still shared.
            </li>
            <li>
              Mutating a list while iterating over it skips or repeats elements — iterate over a copy or build a new list.
            </li>
          </ul>
        </NoteCard>
      </NoteGrid>
    </>
  );
}
