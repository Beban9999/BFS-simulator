import { useMemo, useState } from "react";
import { Choice, NoteCard, NoteGrid, PageLink } from "../../../components/note/Note";
import { CLASSES, formatOps, formatTime } from "./growth";

const W = 720;
const H = 380;
const M = { top: 16, right: 96, bottom: 36, left: 64 };
const PW = W - M.left - M.right;
const PH = H - M.top - M.bottom;

type Scale = "linear" | "log";

/** log10 of a class at real x: integer-only classes (n!) interpolate in log space. */
function logAt(i: number, x: number): number {
  const c = CLASSES[i];
  if (c.id !== "nfact") return c.log10(x);
  const a = Math.floor(x);
  const t = x - a;
  return (1 - t) * c.log10(a) + t * c.log10(a + 1);
}

function niceTicks(max: number, count: number): number[] {
  const raw = max / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((k) => k * mag).find((s) => s >= raw)!;
  const out: number[] = [];
  for (let v = step; v <= max + 1e-9; v += step) out.push(Math.round(v * 1e6) / 1e6);
  return out;
}

const TABLE_NS: [string, number][] = [
  ["10", 10],
  ["100", 100],
  ["1,000", 1e3],
  ["10⁴", 1e4],
  ["10⁵", 1e5],
  ["10⁶", 1e6],
  ["10⁹", 1e9],
];

const RULES: [string, string][] = [
  ["Drop constants", "3n + 5 and n/2 are both O(n): Big-O describes how cost grows, not its exact size."],
  ["Keep the dominant term", "n² + 100n + 7 is O(n²): for large n the biggest term swamps the rest."],
  ["Sequential steps add", "a loop over n, then a loop over m → O(n + m)."],
  ["Nested loops multiply", "a loop over n inside a loop over m → O(n · m)."],
  ["Halving gives a log", "cutting the problem in half each step → O(log n) steps."],
  ["Recursion: count the calls", "calls × work per call. Two calls on n − 1 → O(2ⁿ); two calls on n/2 + O(n) merge → O(n log n)."],
];

export default function BigO() {
  const [xMax, setXMax] = useState(20);
  const [scale, setScale] = useState<Scale>("linear");
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [hover, setHover] = useState<number | null>(null);
  const [tableN, setTableN] = useState(1e3);

  // y axis in log10 units for "log", raw values for "linear".
  const yTop = scale === "linear" ? xMax * xMax * 1.08 : Math.max(2, xMax * Math.log10(2) * 1.15);
  const sx = (x: number) => M.left + ((x - 1) / (xMax - 1)) * PW;
  const sy = (v: number) => M.top + PH - (v / yTop) * PH;
  const valueOf = (i: number, x: number) => (scale === "linear" ? 10 ** logAt(i, x) : logAt(i, x));

  const curves = useMemo(() => {
    const samples = 240;
    return CLASSES.map((c, i) => {
      let d = "";
      let exit: { x: number; y: number } | null = null;
      for (let s = 0; s <= samples; s++) {
        const x = 1 + ((xMax - 1) * s) / samples;
        const v = valueOf(i, x);
        if (v > yTop) {
          // Finish the line exactly at the top edge, then stop.
          const px = 1 + ((xMax - 1) * (s - 1)) / samples;
          const pv = valueOf(i, px);
          const t = (yTop - pv) / (v - pv);
          const ex = px + t * (x - px);
          d += `L${sx(ex).toFixed(1)},${sy(yTop).toFixed(1)}`;
          exit = { x: sx(ex), y: sy(yTop) };
          break;
        }
        d += `${s ? "L" : "M"}${sx(x).toFixed(1)},${sy(v).toFixed(1)}`;
      }
      const end = exit ?? { x: sx(xMax), y: sy(valueOf(i, xMax)) };
      return { c, i, d, end, clipped: !!exit };
    });
  }, [xMax, scale]); // eslint-disable-line react-hooks/exhaustive-deps

  // Direct labels at each curve's end, nudged apart vertically so they don't overlap.
  const labels = useMemo(() => {
    const vis = curves.filter((k) => !hidden.has(k.c.id)).map((k) => ({ id: k.c.id, i: k.i, label: k.c.label, x: k.end.x, y: k.end.y, clipped: k.clipped }));
    const right = vis.filter((l) => !l.clipped).sort((a, b) => b.y - a.y);
    for (let j = 1; j < right.length; j++) if (right[j - 1].y - right[j].y < 15) right[j].y = right[j - 1].y - 15;
    return vis;
  }, [curves, hidden]);

  const xTicks = niceTicks(xMax, 6).filter((t) => t >= 1);
  const logStep = Math.max(1, Math.ceil(yTop / 7));
  const yTicks = scale === "linear" ? niceTicks(yTop / 1.08, 4) : Array.from({ length: Math.floor(yTop / logStep) + 1 }, (_, k) => k * logStep);
  const hn = hover ?? null;

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    const n = Math.round(1 + ((x - M.left) / PW) * (xMax - 1));
    setHover(n >= 1 && n <= xMax ? n : null);
  };

  const toggle = (id: string) =>
    setHidden((h) => {
      const next = new Set(h);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <>
      <NoteCard title="Growth curves">
        <div className="note-controls">
          <label>
            n up to
            <input type="range" min={4} max={64} value={xMax} onChange={(e) => setXMax(Number(e.target.value))} aria-label="Largest n on the chart" />
            <b>{xMax}</b>
          </label>
          <Choice
            label="Y axis"
            value={scale}
            onChange={setScale}
            options={[
              ["linear", "Linear y"],
              ["log", "Log y"],
            ]}
          />
          <span className="bigo-legend" role="group" aria-label="Show or hide a curve">
            {CLASSES.map((c, i) => (
              <button key={c.id} type="button" aria-pressed={!hidden.has(c.id)} onClick={() => toggle(c.id)}>
                <span className="bigo-swatch" style={{ background: `var(--viz-${i + 1})` }} />
                {c.label}
              </button>
            ))}
          </span>
        </div>
        <div className="bigo-chart">
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Operation counts of seven complexity classes for n from 1 to ${xMax}, ${scale} y axis`} onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
            {yTicks.map((t) => (
              <g key={t}>
                <line className="bigo-grid" x1={M.left} x2={M.left + PW} y1={sy(t)} y2={sy(t)} />
                <text className="bigo-tick" x={M.left - 8} y={sy(t)} textAnchor="end" dominantBaseline="middle">
                  {scale === "linear" ? formatOps(Math.log10(t)) : formatOps(t)}
                </text>
              </g>
            ))}
            <line className="bigo-axis" x1={M.left} x2={M.left + PW} y1={M.top + PH} y2={M.top + PH} />
            {xTicks.map((t) => (
              <text key={t} className="bigo-tick" x={sx(t)} y={M.top + PH + 18} textAnchor="middle">
                {t}
              </text>
            ))}
            <text className="bigo-tick" x={M.left + PW} y={H - 2} textAnchor="end">
              n →
            </text>
            <text className="bigo-tick" x={8} y={M.top + 4}>
              ops
            </text>
            {curves.map(({ c, i, d }) =>
              hidden.has(c.id) ? null : <path key={c.id} className="bigo-line" d={d} style={{ stroke: `var(--viz-${i + 1})` }} />,
            )}
            {labels.map((l) =>
              l.clipped ? (
                <text key={l.id} className="bigo-label" x={l.x} y={l.y - 4} textAnchor="middle">
                  {l.label} ↑
                </text>
              ) : (
                <g key={l.id}>
                  <circle cx={M.left + PW + 8} cy={l.y} r={4} style={{ fill: `var(--viz-${l.i + 1})` }} />
                  <text className="bigo-label" x={M.left + PW + 16} y={l.y} dominantBaseline="middle">
                    {l.label}
                  </text>
                </g>
              ),
            )}
            {hn !== null && (
              <g pointerEvents="none">
                <line className="bigo-cross" x1={sx(hn)} x2={sx(hn)} y1={M.top} y2={M.top + PH} />
                {CLASSES.map((c, i) => {
                  const v = valueOf(i, hn);
                  if (hidden.has(c.id) || v > yTop) return null;
                  return <circle key={c.id} className="bigo-dot" cx={sx(hn)} cy={sy(v)} r={4.5} style={{ fill: `var(--viz-${i + 1})` }} />;
                })}
              </g>
            )}
          </svg>
          {hn !== null && (
            <div className={`bigo-tip${sx(hn) > W / 2 ? " flip" : ""}`} style={{ left: `${(sx(hn) / W) * 100}%` }} role="status">
              <b>n = {hn}</b>
              {CLASSES.map((c, i) =>
                hidden.has(c.id) ? null : (
                  <span key={c.id}>
                    <span className="bigo-swatch" style={{ background: `var(--viz-${i + 1})` }} />
                    {c.label} <b>{formatOps(c.log10(hn))}</b>
                  </span>
                ),
              )}
            </div>
          )}
        </div>
        <p className="note-muted">
          Hover the chart to read every curve at one n. On a linear axis the exponential curves leave the chart almost
          immediately; switch to a log axis to compare them. Even there, O(n!) outruns O(2ⁿ).
        </p>
      </NoteCard>

      <NoteCard
        title="Operations at n (≈ 10⁸ simple steps per second)"
        actions={<Choice label="n" value={String(tableN)} onChange={(v) => setTableN(Number(v))} options={TABLE_NS.map(([t, v]) => [String(v), `n = ${t}`])} />}
      >
        <div className="note-table-wrap">
          <table className="note-table">
            <thead>
              <tr>
                <th>Class</th>
                <th className="num">Operations</th>
                <th className="num">Time</th>
                <th>Looks like</th>
              </tr>
            </thead>
            <tbody>
              {CLASSES.map((c, i) => {
                const lg = c.log10(tableN);
                const slow = lg - 8 > 0;
                return (
                  <tr key={c.id}>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <span className="bigo-swatch" style={{ background: `var(--viz-${i + 1})` }} /> {c.label}
                    </td>
                    <td className="num">{formatOps(lg)}</td>
                    <td className={`num${slow ? " tag-bad" : ""}`}>{formatTime(lg)}</td>
                    <td>{c.page ? <PageLink id={c.page}>{c.example}</PageLink> : c.example}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="note-muted" style={{ marginTop: 10 }}>
          Times are rough: a "step" in Python costs far more than one in C++, but the ranking — and the cliff — never changes.
          Red means more than a second.
        </p>
      </NoteCard>

      <NoteGrid>
        <NoteCard title="Rules for finding the Big-O">
          <ul className="bigo-rules">
            {RULES.map(([h, t]) => (
              <li key={h}>
                <b>{h}.</b> {t}
              </li>
            ))}
          </ul>
        </NoteCard>
        <NoteCard title="O, Θ, Ω and amortized">
          <p>
            <b>O(f)</b> is an upper bound, <b>Ω(f)</b> a lower bound, <b>Θ(f)</b> both. Interviews say "O" and mean the tight
            bound for the <b>worst case</b> unless they say "average" (quicksort, hash tables).
          </p>
          <p>
            <b>Amortized</b> cost is the average per operation over any long sequence: appending to a dynamic array is
            occasionally O(n) (copy into a bigger block) but O(1) amortized because the copies double in size —
            watch it on <PageLink id="dynamic-array" />.
          </p>
          <p>
            <b>Space</b> counts extra memory, including the recursion stack: a recursive DFS on a path of n nodes uses
            O(n) stack — see <PageLink id="call-stack" />.
          </p>
        </NoteCard>
      </NoteGrid>
    </>
  );
}
