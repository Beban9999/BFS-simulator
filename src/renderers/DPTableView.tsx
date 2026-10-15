import { useLayoutEffect, useRef, useState } from "react";
import type { RendererProps } from "../engine/types";
import { tc, type DPState, type DPTable } from "../algorithms/_shared/dp";
import { ArrayRenderer, KIND_GLYPH } from "./ArrayView";
import { TreeSvg } from "./DecisionTreeView";

type Box = { x: number; y: number; w: number; h: number };

function Table({ table, arrows, highlights }: { table: DPTable; arrows: DPState["arrows"]; highlights: RendererProps["highlights"] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [boxes, setBoxes] = useState<Record<string, Box>>({});
  const [size, setSize] = useState({ w: 0, h: 0 });
  const cols = Math.max(1, ...table.rows.map((r) => r.length));
  const cellPx = cols > 12 ? 32 : cols > 9 ? 40 : 50;

  // Measure the cells that arrows touch so the SVG overlay can connect them.
  const want = (arrows ?? []).flatMap((a) => [a.from, a.to]).map(([r, c]) => `${r},${c}`);
  const wantKey = want.join("|");
  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const measure = () => {
      const base = wrap.getBoundingClientRect();
      const next: Record<string, Box> = {};
      for (const k of new Set(want)) {
        const el = wrap.querySelector<HTMLElement>(`[data-rc="${k}"]`);
        if (!el) continue;
        const b = el.getBoundingClientRect();
        next[k] = { x: b.left - base.left, y: b.top - base.top, w: b.width, h: b.height };
      }
      setBoxes(next);
      setSize({ w: wrap.scrollWidth, h: wrap.scrollHeight });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [wantKey, table.rows.length, cols]); // eslint-disable-line react-hooks/exhaustive-deps

  const arrowPaths = (arrows ?? []).flatMap(({ from, to }, i) => {
    const a = boxes[`${from[0]},${from[1]}`];
    const b = boxes[`${to[0]},${to[1]}`];
    if (!a || !b) return [];
    const ax = a.x + a.w / 2;
    const ay = a.y + a.h / 2;
    const bx = b.x + b.w / 2;
    const by = b.y + b.h / 2;
    let d: string;
    if (Math.abs(by - ay) < 2) {
      // Same row: arc around the row (under it for the last row, over it otherwise), edge to edge.
      const lift = Math.min(30, 14 + Math.abs(bx - ax) * 0.15);
      const below = from[0] === table.rows.length - 1;
      const ya = below ? a.y + a.h - 3 : a.y + 3;
      const yb = below ? b.y + b.h - 1 : b.y + 1;
      const yc = below ? Math.max(ya, yb) + lift : Math.min(ya, yb) - lift;
      d = `M ${ax} ${ya} Q ${(ax + bx) / 2} ${yc} ${bx} ${yb}`;
    } else {
      // Otherwise border to border with a slight bend.
      const dx = bx - ax;
      const dy = by - ay;
      const len = Math.hypot(dx, dy) || 1;
      const sx = ax + (dx / len) * a.w * 0.45;
      const sy = ay + (dy / len) * a.h * 0.45;
      const ex = bx - (dx / len) * b.w * 0.5;
      const ey = by - (dy / len) * b.h * 0.5;
      d = `M ${sx} ${sy} Q ${(sx + ex) / 2 - dy * 0.12} ${(sy + ey) / 2 + dx * 0.12} ${ex} ${ey}`;
    }
    return [<path key={i} className="dp-arrow" d={d} markerEnd="url(#dp-arrowhead)" />];
  });

  return (
    <div className="dp-table-wrap" ref={wrapRef} style={{ "--cell": `${cellPx}px`, "--fs": cellPx < 40 ? "11px" : "14px" } as React.CSSProperties}>
      {table.caption && <p className="arr-caption">{table.caption}</p>}
      <table className="mx-table dp-table" role="grid" aria-label="DP table">
        {table.colLabels && (
          <thead>
            <tr>
              {table.rowLabels && <th />}
              {table.colLabels.map((l, c) => (
                <th key={c} scope="col">
                  {l}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {table.rows.map((row, r) => (
            <tr key={r}>
              {table.rowLabels && (
                <th scope="row" className="dp-rowlabel">
                  {table.rowLabels[r]}
                </th>
              )}
              {row.map((v, c) => {
                const kind = highlights.get(tc(r, c));
                return (
                  <td key={c} data-rc={`${r},${c}`} data-k={kind} className={v === "" ? "gap" : v === null ? "empty" : undefined}>
                    {v === null ? "·" : String(v)}
                    {kind && KIND_GLYPH[kind] && <span className="glyph">{KIND_GLYPH[kind]}</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {arrowPaths.length > 0 && (
        <svg className="dp-arrows" width={size.w} height={size.h} aria-hidden="true">
          <defs>
            <marker id="dp-arrowhead" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" markerUnits="userSpaceOnUse" orient="auto">
              <path d="M0,0 L8,4 L0,8 z" className="dp-arrowhead" />
            </marker>
          </defs>
          {arrowPaths}
        </svg>
      )}
    </div>
  );
}

export function DPTableRenderer({ step, highlights }: RendererProps<DPState>) {
  const { formula, table, arrows, tree, treeTitle, array, caption } = step.state;
  return (
    <div className="dp-wrap">
      {caption && <p className="arr-caption">{caption}</p>}
      {formula && <p className="dp-formula">{formula}</p>}
      <div className="dp-row">
        {tree && (
          <section className="dt-box" aria-label={treeTitle ?? "Recursion tree"}>
            <h3 className="sub-label">{treeTitle ?? "Recursion tree"}</h3>
            <TreeSvg t={tree} highlights={highlights} />
          </section>
        )}
        {table && <Table table={table} arrows={arrows} highlights={highlights} />}
      </div>
      {array && <ArrayRenderer step={{ ...step, state: array }} highlights={highlights} />}
    </div>
  );
}
