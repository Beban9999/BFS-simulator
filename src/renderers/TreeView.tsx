import { useId } from "react";
import { hierarchy, tree as d3tree } from "d3-hierarchy";
import type { HighlightKind, RendererProps } from "../engine/types";
import { te, tl, tn, type TreeId, type TreeState, type TreeView } from "../algorithms/_shared/tree";
import { ArrayRenderer, KIND_GLYPH } from "./ArrayView";

const NODE_W = 50; // horizontal spacing between neighbouring nodes
const LEVEL_H = 78;
const R = 18;
const PAD = 26;
const LINE = 12;

interface Datum {
  id: TreeId | null;
  kids: Datum[];
}

function build(id: TreeId, children: TreeView["children"], seen: Set<TreeId>): Datum {
  seen.add(id);
  const kids = (children[id] ?? []).filter((c) => c === null || !seen.has(c));
  // Keep null placeholders only when a sibling exists, so a lone right child still sits on the right.
  const real = kids.some((c) => c !== null);
  return { id, kids: real ? kids.map((c) => (c === null ? { id: null, kids: [] } : build(c, children, seen))) : [] };
}

function OneTree({ t, highlights }: { t: TreeView; highlights: Map<string, HighlightKind> }) {
  const uid = useId().replace(/:/g, "");
  if (t.root === null) {
    return (
      <div className="tv-empty">
        empty
        {t.pointers?.some((p) => p.node === null) && <p className="ll-nulls">{t.pointers.filter((p) => p.node === null).map((p) => <span key={p.name}><b>{p.name}</b> = null</span>)}</p>}
      </div>
    );
  }
  const root = d3tree<Datum>().nodeSize([NODE_W, LEVEL_H])(hierarchy(build(t.root, t.children, new Set()), (d) => d.kids));
  const all = root.descendants();
  const xs = all.map((d) => d.x);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const depth = Math.max(...all.map((d) => d.depth));
  const width = maxX - minX + 2 * PAD + 2 * R;
  const ptrLines = Math.max(1, ...countPtrs(t).values());
  const height = depth * LEVEL_H + 2 * R + PAD + 18 + ptrLines * LINE;
  const pos = (d: { x: number; y: number }) => [d.x - minX + PAD + R, d.y + R + 8] as const;
  const byId = new Map(t.nodes.map((n) => [n.id, n]));
  const place = new Map<TreeId, readonly [number, number]>();
  for (const d of all) if (d.data.id !== null) place.set(d.data.id, pos(d));

  const stack = new Map<TreeId, number>();
  const ptrs: { name: string; x: number; y: number; first: boolean }[] = [];
  const nulls: string[] = [];
  for (const p of t.pointers ?? []) {
    const at = p.node === null ? undefined : place.get(p.node);
    if (!at) {
      nulls.push(p.name);
      continue;
    }
    const k = stack.get(p.node!) ?? 0;
    stack.set(p.node!, k + 1);
    ptrs.push({ name: p.name, x: at[0], y: at[1] + R + 14 + (byId.get(p.node!)?.sub ? 9 : 0) + k * LINE, first: k === 0 });
  }

  return (
    <div className="tv-one">
      <svg className="tv" viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", maxWidth: Math.round(width * 1.25) }} role="img" aria-label={t.name ?? "Tree"}>
        {t.links?.length ? (
          <defs>
            <marker id={`${uid}-arrow`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" markerUnits="userSpaceOnUse" orient="auto">
              <path d="M0,0 L8,4 L0,8 z" className="tv-link-head" />
            </marker>
          </defs>
        ) : null}
        {all.map((d) => {
          if (!d.parent || d.data.id === null || d.parent.data.id === null) return null;
          const [x1, y1] = pos(d.parent);
          const [x2, y2] = pos(d);
          const k = highlights.get(te(d.parent.data.id, d.data.id));
          const path = `M ${x1} ${y1} L ${x2} ${y2}`;
          return <path key={`${d.parent.data.id}-${d.data.id}`} className="tv-edge" data-k={k} d={path} />;
        })}
        {(t.links ?? []).map(({ from, to }) => {
          const a = place.get(from);
          const b = place.get(to);
          if (!a || !b) return null;
          // Bow the curve sideways so it doesn't run along the tree edges.
          const mx = (a[0] + b[0]) / 2 + (b[1] - a[1]) * 0.45;
          const my = (a[1] + b[1]) / 2 - (b[0] - a[0]) * 0.2;
          // Trim both ends to the circle edges so the arrowhead stays visible.
          const trim = (p: readonly [number, number], q: readonly [number, number], by: number) => {
            const dx = q[0] - p[0];
            const dy = q[1] - p[1];
            const len = Math.hypot(dx, dy) || 1;
            return [p[0] + (dx / len) * by, p[1] + (dy / len) * by] as const;
          };
          const s0 = trim(a, [mx, my], R + 2);
          const e0 = trim(b, [mx, my], R + 3);
          return (
            <path key={`l${from}-${to}`} className="tv-link" data-k={highlights.get(tl(from, to))} d={`M ${s0[0]} ${s0[1]} Q ${mx} ${my} ${e0[0]} ${e0[1]}`} markerEnd={`url(#${uid}-arrow)`} />
          );
        })}
        {all.map((d) => {
          if (d.data.id === null) return null;
          const n = byId.get(d.data.id);
          if (!n) return null;
          const [x, y] = pos(d);
          const k = highlights.get(tn(n.id));
          return (
            <g key={n.id} className="tv-node" data-k={k} style={{ transform: `translate(${x}px, ${y}px)` }}>
              <circle r={R} />
              <text className="tv-label" y={5} style={{ fontSize: n.label.length > 3 ? 10 : n.label.length > 2 ? 12 : 14 }}>
                {n.label}
              </text>
              {n.sub && (
                <text className="tv-sub" y={R + 11}>
                  {n.sub}
                </text>
              )}
              {k && KIND_GLYPH[k] && (
                <text className="tv-glyph" x={R - 2} y={-R + 6}>
                  {KIND_GLYPH[k]}
                </text>
              )}
            </g>
          );
        })}
        {ptrs.map((p) => (
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

function countPtrs(t: TreeView): Map<TreeId, number> {
  const m = new Map<TreeId, number>();
  for (const p of t.pointers ?? []) if (p.node !== null) m.set(p.node, (m.get(p.node) ?? 0) + 1);
  return m;
}

export function TreeRenderer({ step, highlights }: RendererProps<TreeState>) {
  const { trees, array, caption } = step.state;
  return (
    <div className="tv-wrap">
      {caption && <p className="arr-caption">{caption}</p>}
      <div className="tv-trees">
        {trees.map((t, i) => (
          <section key={i} className="tv-box" aria-label={t.name ?? "Tree"}>
            {t.name && <h3 className="sub-label">{t.name}</h3>}
            <OneTree t={t} highlights={highlights} />
            {t.note && <p className="sq-note">{t.note}</p>}
          </section>
        ))}
      </div>
      {array && <ArrayRenderer step={{ ...step, state: array }} highlights={highlights} />}
    </div>
  );
}
