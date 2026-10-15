import { useLayoutEffect, useMemo } from "react";
import { hierarchy, tree as d3tree } from "d3-hierarchy";
import type { HighlightKind, RendererProps } from "../engine/types";
import { de, dn, type DecisionState, type DTreeView } from "../algorithms/_shared/decision";
import { ArrayRenderer, KIND_GLYPH, useWidth } from "./ArrayView";
import { MatrixRenderer } from "./MatrixView";

const DX = 30; // horizontal spacing between neighbouring nodes
const DY = 48; // level height
const R = 11;
const PAD = 16;
const MIN_SCALE = 0.55;

interface Datum {
  id: number;
  kids: Datum[];
}

function build(t: DTreeView): Datum {
  const make = (id: number): Datum => ({ id, kids: (t.children[id] ?? []).map(make) });
  return make(t.root);
}

export function TreeSvg({ t, highlights }: { t: DTreeView; highlights: Map<string, HighlightKind> }) {
  const [boxRef, boxW] = useWidth<HTMLDivElement>();
  const layout = useMemo(() => {
    const root = d3tree<Datum>()
      .nodeSize([DX, DY])
      .separation((a, b) => (a.parent === b.parent ? 1 : 1.3))(hierarchy(build(t), (d) => d.kids));
    const all = root.descendants();
    const minX = Math.min(...all.map((d) => d.x));
    const maxX = Math.max(...all.map((d) => d.x));
    const depth = Math.max(...all.map((d) => d.depth));
    return { all, minX, width: maxX - minX + 2 * (PAD + R), height: depth * DY + 2 * (PAD + R) };
  }, [t]);
  const byId = useMemo(() => new Map(t.nodes.map((n) => [n.id, n])), [t]);
  const scale = Math.max(MIN_SCALE, Math.min(1.7, (boxW - 4) / layout.width, 430 / layout.height));
  const pos = (d: { x: number; y: number }) => [d.x - layout.minX + PAD + R, d.y + PAD + R] as const;

  // Keep the current node visible when the drawing is bigger than its box.
  useLayoutEffect(() => {
    const box = boxRef.current;
    const cur = layout.all.find((d) => d.data.id === t.current);
    if (!box || !cur) return;
    const [x, y] = pos(cur);
    const sx = x * scale - box.clientWidth / 2;
    const sy = y * scale - box.clientHeight / 2;
    if (Math.abs(box.scrollLeft - sx) > box.clientWidth / 3) box.scrollLeft = sx;
    if (Math.abs(box.scrollTop - sy) > box.clientHeight / 3) box.scrollTop = sy;
  });

  return (
    <div className="dt-scroll" ref={boxRef}>
      <svg
        className="dt"
        width={layout.width * scale}
        height={layout.height * scale}
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        role="img"
        aria-label={`Decision tree with ${t.nodes.length} nodes shown`}
      >
        {layout.all.map((d) => {
          if (!d.parent) return null;
          const [x1, y1] = pos(d.parent);
          const [x2, y2] = pos(d);
          const k = highlights.get(de(d.parent.data.id, d.data.id));
          return <path key={`e${d.data.id}`} className="dt-edge" data-k={k} d={`M ${x1} ${y1 + R} C ${x1} ${(y1 + y2) / 2}, ${x2} ${(y1 + y2) / 2}, ${x2} ${y2 - R}`} />;
        })}
        {layout.all.map((d) => {
          const n = byId.get(d.data.id);
          if (!n) return null;
          const [x, y] = pos(d);
          const k = highlights.get(dn(n.id));
          const label = n.collapsed ? `+${n.collapsed}` : n.label;
          return (
            <g key={n.id} className={`dt-node${n.collapsed ? " folded" : ""}`} data-k={k} transform={`translate(${x} ${y})`}>
              <title>{n.collapsed ? `${n.title ?? n.label} — ${n.collapsed} finished nodes below are folded` : (n.title ?? n.label)}</title>
              <circle r={R} />
              <text className="dt-label" y={4} style={{ fontSize: label.length > 3 ? 7 : label.length > 2 ? 8.5 : 10.5 }}>
                {label}
              </text>
              {k && KIND_GLYPH[k] && (
                <text className="dt-glyph" x={R} y={-R + 3}>
                  {KIND_GLYPH[k]}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function DecisionTreeRenderer({ step, highlights }: RendererProps<DecisionState>) {
  const { tree, array, matrix, caption, treeTitle = "Decision tree" } = step.state;
  return (
    <div className="dt-wrap">
      {caption && <p className="arr-caption">{caption}</p>}
      <div className="dt-row">
        {(array || matrix) && (
          <div className="dt-concrete">
            {matrix && <MatrixRenderer step={{ ...step, state: matrix }} highlights={highlights} />}
            {array && <ArrayRenderer step={{ ...step, state: array }} highlights={highlights} />}
          </div>
        )}
        <section className="dt-box" aria-label={treeTitle}>
          <h3 className="sub-label">{treeTitle}</h3>
          <TreeSvg t={tree} highlights={highlights} />
        </section>
      </div>
    </div>
  );
}
