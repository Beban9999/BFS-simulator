import { useId } from "react";
import type { HighlightKind, RendererProps } from "../engine/types";
import { eid, nid, pid, rid, type ListState, type NodeId } from "../algorithms/_shared/list";
import { KIND_GLYPH } from "./ArrayView";

const H = 34; // node height
const VAL_W = 40; // value box
const PTR_W = 16; // next / prev box
const GAP = 34; // space for a straight arrow between neighbours
const ABOVE = 66; // room for arcs + labels above a row
const BELOW = 54; // room for pointer labels under a row
const PAD = 12;
const LINE = 13; // pointer label line height

const KINDS: HighlightKind[] = [
  "current", "visited", "frontier", "path", "compare", "swap", "sorted", "found", "pruned",
  "active", "window", "removed", "match", "mismatch", "pivot", "start", "end", "wall",
];

interface Pos {
  x: number;
  y: number;
  row: number;
  col: number;
}

/** Every edge is a single cubic segment so CSS can morph `d` when a pointer is re-wired. */
const cubic = (x1: number, y1: number, c1x: number, c1y: number, c2x: number, c2y: number, x2: number, y2: number) =>
  `M ${x1} ${y1} C ${c1x} ${c1y} ${c2x} ${c2y} ${x2} ${y2}`;
const line = (x1: number, y1: number, x2: number, y2: number) =>
  cubic(x1, y1, x1 + (x2 - x1) / 3, y1 + (y2 - y1) / 3, x1 + (2 * (x2 - x1)) / 3, y1 + (2 * (y2 - y1)) / 3, x2, y2);
const arc = (x1: number, y1: number, x2: number, y2: number, h: number) => cubic(x1, y1, x1, y1 + h, x2, y2 + h, x2, y2);

/**
 * Curve between nodes on different rows: leave from the bottom/top, enter the other node's top,
 * or its lower-right corner when coming from below (pointer labels sit under the centre).
 */
function crossRow(sx: number, a: Pos, b: Pos, w: number) {
  if (b.row > a.row) {
    const ex = b.x + w / 2;
    const sy = a.y + H;
    const ey = b.y - 2;
    const k = (ey - sy) / 2;
    return cubic(sx, sy, sx, sy + k, ex, ey - k, ex, ey);
  }
  const ex = b.x + w - 2;
  const sy = a.y;
  const ey = b.y + H + 2;
  const k = (sy - ey) / 2;
  return cubic(sx, sy, sx, sy - k, ex, ey + k, ex, ey);
}

export function LinkedListRenderer({ step, highlights }: RendererProps<ListState>) {
  const { nodes, next, prev, random, rows, rowLabels, pointers = [], caption } = step.state;
  const uid = useId().replace(/:/g, "");
  const doubly = !!prev;
  const W = VAL_W + PTR_W + (doubly ? PTR_W : 0);
  const COL = W + GAP;
  const valX = doubly ? PTR_W : 0; // left edge of the value box inside a node
  const nextCx = W - PTR_W / 2;
  const prevCx = PTR_W / 2;
  const labelW = rowLabels?.some(Boolean) ? 70 : 0;

  const pos = new Map<NodeId, Pos>();
  rows.forEach((r, ri) =>
    r.forEach((id, ci) => {
      if (id !== null) pos.set(id, { x: PAD + labelW + ci * COL, y: ABOVE + ri * (ABOVE + H + BELOW), row: ri, col: ci });
    }),
  );
  const maxCols = Math.max(1, ...rows.map((r) => r.length));
  const width = PAD * 2 + labelW + maxCols * COL - GAP;
  const height = rows.length * (ABOVE + H + BELOW);

  const marker = (k?: HighlightKind, rand = false) => `url(#${uid}-${rand && !k ? "rand" : (k ?? "base")})`;

  type Edge = { key: string; d: string; k?: HighlightKind; cls: string };
  const edges: Edge[] = [];
  for (const [id, a] of pos) {
    const t = next[id];
    if (t !== null && t !== undefined && pos.has(t)) {
      const b = pos.get(t)!;
      const off = doubly ? -6 : 0;
      let d: string;
      if (b.row !== a.row) d = crossRow(a.x + nextCx, a, b, W);
      else if (b.col === a.col + 1) d = line(a.x + nextCx, a.y + H / 2 + off, b.x - 1, b.y + H / 2 + off);
      else if (b.col === a.col) d = arc(a.x + nextCx, a.y, a.x + valX + VAL_W / 2, a.y - 1, -34);
      else d = arc(a.x + nextCx, a.y, b.x + valX + VAL_W / 2 + 4, b.y - 1, -Math.min(56, 22 + 10 * Math.abs(b.col - a.col)));
      edges.push({ key: `n${id}`, d, k: highlights.get(eid(id, t)), cls: "ll-edge" });
    }
    const p = prev?.[id];
    if (p !== null && p !== undefined && pos.has(p)) {
      const b = pos.get(p)!;
      let d: string;
      if (b.row !== a.row) d = crossRow(a.x + prevCx, a, b, W);
      else if (b.col === a.col - 1) d = line(a.x + prevCx, a.y + H / 2 + 6, b.x + W + 1, b.y + H / 2 + 6);
      // Above the row, nested inside the matching (taller) next arc, so pointer labels below stay clear.
      else d = arc(a.x + prevCx, a.y, b.x + W - 5, b.y - 1, -Math.min(40, 12 + 7 * Math.abs(b.col - a.col)));
      edges.push({ key: `p${id}`, d, k: highlights.get(pid(id, p)), cls: "ll-edge" });
    }
    const r = random?.[id];
    if (r !== null && r !== undefined && pos.has(r)) {
      const b = pos.get(r)!;
      const sx = a.x + valX + VAL_W / 2 - 6;
      let d: string;
      if (b.row !== a.row) d = crossRow(sx, a, b, W);
      else if (b.col === a.col) d = arc(sx, a.y, sx + 12, a.y - 1, -26);
      else d = arc(sx, a.y, b.x + valX + VAL_W / 2 - 2, b.y - 1, -Math.min(60, 24 + 12 * Math.abs(b.col - a.col)));
      edges.push({ key: `r${id}`, d, k: highlights.get(rid(id, r)), cls: "ll-edge rand" });
    }
  }

  // Pointer labels stacked under their node; null pointers are listed below the drawing.
  const stack = new Map<NodeId, number>();
  const placed: { name: string; x: number; y: number; first: boolean }[] = [];
  const nulls: string[] = [];
  for (const p of pointers) {
    const at = p.node === null ? undefined : pos.get(p.node);
    if (!at) {
      nulls.push(p.name);
      continue;
    }
    const k = stack.get(p.node!) ?? 0;
    stack.set(p.node!, k + 1);
    placed.push({ name: p.name, x: at.x + W / 2, y: at.y + H + 15 + k * LINE, first: k === 0 });
  }

  const byId = new Map(nodes.map((n) => [n.id, n]));

  return (
    <div className="ll-wrap">
      {caption && <p className="arr-caption">{caption}</p>}
      <svg
        className="ll"
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: "100%", maxWidth: Math.round(width * 1.3) }}
        role="img"
        aria-label="Linked list"
      >
        <defs>
          {[undefined, ...KINDS].map((k) => (
            <marker key={k ?? "base"} id={`${uid}-${k ?? "base"}`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" markerUnits="userSpaceOnUse" orient="auto">
              <path d="M0,0 L8,4 L0,8 z" className="ll-head" data-k={k} />
            </marker>
          ))}
          <marker id={`${uid}-rand`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" markerUnits="userSpaceOnUse" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" className="ll-head rand" />
          </marker>
        </defs>

        {rowLabels?.map((label, ri) =>
          label ? (
            <text key={ri} className="ll-rowlabel" x={PAD} y={ABOVE + ri * (ABOVE + H + BELOW) + H / 2 + 4}>
              {label}
            </text>
          ) : null,
        )}

        {edges.map((e) => (
          <path
            key={e.key}
            className={e.cls}
            data-k={e.k}
            d={e.d}
            style={{ d: `path("${e.d}")` } as React.CSSProperties}
            markerEnd={marker(e.k, e.cls.includes("rand"))}
          />
        ))}

        {[...pos.entries()].map(([id, p]) => {
          const n = byId.get(id);
          if (!n) return null;
          const k = highlights.get(nid(id));
          const nullNext = next[id] === null;
          const nullPrev = doubly && prev![id] === null;
          return (
            <g key={id} className={`ll-node${n.ghost ? " ghost" : ""}`} data-k={k} style={{ transform: `translate(${p.x}px, ${p.y}px)` }}>
              {n.label && (
                <text className="ll-label" x={W / 2} y={-6}>
                  {n.label}
                </text>
              )}
              <rect className="ll-box" width={W} height={H} rx={7} />
              {doubly && <line className="ll-div" x1={PTR_W} y1={0} x2={PTR_W} y2={H} />}
              <line className="ll-div" x1={W - PTR_W} y1={0} x2={W - PTR_W} y2={H} />
              <text className="ll-val" x={valX + VAL_W / 2} y={H / 2 + 5}>
                {String(n.val)}
              </text>
              {nullNext && <line className="ll-null" x1={W - PTR_W + 3} y1={H - 4} x2={W - 3} y2={4} />}
              {nullPrev && <line className="ll-null" x1={3} y1={H - 4} x2={PTR_W - 3} y2={4} />}
              {(next[id] ?? null) !== null && <circle className="ll-dot" cx={nextCx} cy={H / 2 + (doubly ? -6 : 0)} r={2.5} />}
              {doubly && prev![id] !== null && <circle className="ll-dot" cx={prevCx} cy={H / 2 + 6} r={2.5} />}
              {k && KIND_GLYPH[k] && (
                <text className="ll-glyph" x={valX + VAL_W - 4} y={10}>
                  {KIND_GLYPH[k]}
                </text>
              )}
            </g>
          );
        })}

        {placed.map((p) => (
          <text key={p.name} className="ll-ptr" style={{ transform: `translate(${p.x}px, ${p.y}px)` }}>
            {p.first ? `▲ ${p.name}` : p.name}
          </text>
        ))}
      </svg>
      {nulls.length > 0 && (
        <p className="ll-nulls">
          {nulls.map((n) => (
            <span key={n}>
              <b>{n}</b> = null
            </span>
          ))}
        </p>
      )}
    </div>
  );
}
