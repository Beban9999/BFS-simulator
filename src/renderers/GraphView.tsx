import { useEffect, useMemo, useRef, useState } from "react";
import type { HighlightKind, RendererProps } from "../engine/types";
import type { Edge, GraphValue } from "../engine/graph";
import { GROUP_COUNT, ge, gn, type GraphState, type GraphView } from "../algorithms/_shared/graph";
import { ArrayRenderer, KIND_GLYPH } from "./ArrayView";
import { MatrixRenderer } from "./MatrixView";
import { TreeRenderer } from "./TreeView";

const W = 640;
const H = 380;
const PAD = 30;
const R = 17;
const BEND = 22;

type Pt = [number, number];

/** Where an edge runs: path, weight-label point and (directed) arrowhead polygon. */
function geometry(a: Pt, b: Pt, bend: number, directed: boolean) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const c: Pt = [(a[0] + b[0]) / 2 + nx * bend, (a[1] + b[1]) / 2 + ny * bend];
  const unit = (p: Pt, q: Pt): Pt => {
    const l = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
    return [(q[0] - p[0]) / l, (q[1] - p[1]) / l];
  };
  const us = unit(a, c);
  const ue = unit(c, b);
  const s: Pt = [a[0] + us[0] * R, a[1] + us[1] * R];
  const tip: Pt = [b[0] - ue[0] * (R + 1), b[1] - ue[1] * (R + 1)];
  const e: Pt = directed ? [tip[0] - ue[0] * 7, tip[1] - ue[1] * 7] : [b[0] - ue[0] * R, b[1] - ue[1] * R];
  const d = bend ? `M ${s[0]} ${s[1]} Q ${c[0]} ${c[1]} ${e[0]} ${e[1]}` : `M ${s[0]} ${s[1]} L ${e[0]} ${e[1]}`;
  const mid: Pt = bend ? [0.25 * s[0] + 0.5 * c[0] + 0.25 * e[0], 0.25 * s[1] + 0.5 * c[1] + 0.25 * e[1]] : [(s[0] + e[0]) / 2, (s[1] + e[1]) / 2];
  let head: string | undefined;
  if (directed) {
    const base: Pt = [tip[0] - ue[0] * 10, tip[1] - ue[1] * 10];
    head = `${tip[0]},${tip[1]} ${base[0] - ue[1] * 5.5},${base[1] + ue[0] * 5.5} ${base[0] + ue[1] * 5.5},${base[1] - ue[0] * 5.5}`;
  }
  return { d, mid, head };
}

const sameEdges = (a: Edge[], b: Edge[]) => JSON.stringify(a) === JSON.stringify(b);

function GraphSvg({ g, highlights, order, edit }: { g: GraphView; highlights: Map<string, HighlightKind>; order: Map<string, number>; edit?: RendererProps["edit"] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const sig = `${g.n}|${JSON.stringify(g.edges)}|${JSON.stringify(g.pos)}`;
  // Dragged positions live here (viewing aid only), reset whenever the graph itself changes.
  const [moved, setMoved] = useState<{ sig: string; pos: Record<number, Pt> }>({ sig, pos: {} });
  const [picked, setPicked] = useState<number | null>(null);
  const drag = useRef<{ node: number; moved: boolean } | null>(null);
  const overrides = moved.sig === sig ? moved.pos : {};

  useEffect(() => setPicked(null), [edit?.tool, sig]);

  const toSvg = (p: Pt): Pt => [PAD + p[0] * (W - 2 * PAD), PAD + p[1] * (H - 2 * PAD)];
  const fromSvg = (p: Pt): Pt => [
    Math.min(1, Math.max(0, (p[0] - PAD) / (W - 2 * PAD))),
    Math.min(1, Math.max(0, (p[1] - PAD) / (H - 2 * PAD))),
  ];
  const unitPos = (i: number): Pt => overrides[i] ?? g.pos[i];
  const at = (i: number) => toSvg(unitPos(i));

  const hidden = useMemo(() => new Set(g.hidden ?? []), [g.hidden]);
  const edgeKeys = useMemo(() => new Set(g.edges.map(([u, v]) => `${u}>${v}`)), [g.edges]);
  const weights = g.showWeights ?? g.edges.some((e) => e.length === 3);

  const eventPoint = (e: React.PointerEvent): Pt | null => {
    const svg = svgRef.current;
    const m = svg?.getScreenCTM();
    if (!svg || !m) return null;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return [p.x, p.y];
  };

  const value = edit?.value as GraphValue | undefined;
  const editable = !!value && value.n === g.n && sameEdges(value.edges, g.edges);
  const tool = editable ? edit?.tool ?? "move" : "move";
  const currentPos = () => Array.from({ length: g.n }, (_, i) => unitPos(i).map((x) => Math.round(x * 1000) / 1000) as Pt);
  const commit = (next: Partial<GraphValue>) => {
    if (!edit || !value) return;
    edit.onChange({ ...value, pos: currentPos(), ...next });
  };

  const removeNode = (i: number) => {
    if (!value) return;
    const shift = (x: number) => (x > i ? x - 1 : x);
    commit({
      n: value.n - 1,
      edges: value.edges.filter(([u, v]) => u !== i && v !== i).map((e) => [shift(e[0]), shift(e[1]), ...e.slice(2)] as Edge),
      pos: currentPos().filter((_, k) => k !== i),
      ...(value.labels ? { labels: value.labels.filter((_, k) => k !== i) } : {}),
    });
  };

  const onNodeDown = (i: number) => (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    if (tool === "delete") {
      removeNode(i);
      return;
    }
    if (tool === "edge" && value) {
      if (picked === null) setPicked(i);
      else if (picked === i) setPicked(null);
      else {
        const [u, v] = [picked, i];
        const dup = value.edges.some(([a, b]) => (a === u && b === v) || (!value.directed && a === v && b === u));
        setPicked(null);
        if (!dup) commit({ edges: [...value.edges, edit?.weight !== undefined ? [u, v, edit.weight] : [u, v]] });
      }
      return;
    }
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    drag.current = { node: i, moved: false };
  };

  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const p = eventPoint(e);
    if (!p) return;
    d.moved = true;
    setMoved((m) => ({ sig, pos: { ...(m.sig === sig ? m.pos : {}), [d.node]: fromSvg(p) } }));
  };

  const onUp = () => {
    drag.current = null;
  };

  const onBackgroundDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || tool !== "node" || !value) return;
    const p = eventPoint(e);
    if (!p) return;
    commit({
      n: value.n + 1,
      pos: [...currentPos(), fromSvg(p).map((x) => Math.round(x * 1000) / 1000) as Pt],
      ...(value.labels ? { labels: [...value.labels, String(value.n)] } : {}),
    });
  };

  const removeEdge = (k: number) => {
    if (!value || tool !== "delete") return;
    commit({ edges: value.edges.filter((_, j) => j !== k) });
  };

  // Undirected edges answer to both ge(u, v) and ge(v, u); when both are highlighted the later one wins.
  const kindOfEdge = (u: number, v: number) => {
    const a = ge(u, v);
    if (g.directed) return highlights.get(a);
    const b = ge(v, u);
    return (order.get(b) ?? -1) > (order.get(a) ?? -1) ? highlights.get(b) : highlights.get(a);
  };

  return (
    <svg
      ref={svgRef}
      className={`gv mode-${tool}`}
      viewBox={`0 0 ${W} ${H}`}
      style={{ maxWidth: 760 }}
      role="img"
      aria-label={`${g.directed ? "Directed" : "Undirected"} graph with ${g.n} nodes and ${g.edges.length} edges`}
      onPointerDown={onBackgroundDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      <rect x={0} y={0} width={W} height={H} fill="transparent" />
      {g.edges.map(([u, v, w], k) => {
        if (hidden.has(u) || hidden.has(v)) return null;
        const twoWay = g.directed && edgeKeys.has(`${v}>${u}`);
        const geo = geometry(at(u), at(v), twoWay ? BEND : 0, g.directed);
        const kind = kindOfEdge(u, v);
        return (
          <g key={`${u}-${v}-${k}`} className="gv-e" data-k={kind}>
            <path className="gv-edge" d={geo.d} />
            {geo.head && <polygon className="gv-head" points={geo.head} />}
            {weights && w !== undefined && (
              <text className="gv-w" x={geo.mid[0]} y={geo.mid[1] + 4}>
                {w}
              </text>
            )}
            {tool === "delete" && <path className="gv-hit" d={geo.d} onPointerDown={(e) => (e.stopPropagation(), removeEdge(k))} />}
          </g>
        );
      })}
      {Array.from({ length: g.n }, (_, i) => {
        if (hidden.has(i)) return null;
        const [x, y] = at(i);
        const label = g.labels?.[i] ?? String(i);
        const kind = highlights.get(gn(i));
        const group = g.groups?.[i];
        const sub = g.sub?.[i];
        return (
          <g
            key={i}
            className={`gv-node${picked === i ? " picked" : ""}`}
            data-k={kind}
            data-g={group === null || group === undefined ? undefined : group % GROUP_COUNT}
            transform={`translate(${x} ${y})`}
            onPointerDown={onNodeDown(i)}
          >
            <circle className="gv-c" r={R} />
            <text className="gv-label" y={5} style={{ fontSize: label.length > 3 ? 10 : label.length > 2 ? 12 : 14 }}>
              {label}
            </text>
            {sub !== null && sub !== undefined && (
              <text className="gv-sub" x={R * 0.55} y={R + 12}>
                {sub}
              </text>
            )}
            {kind && KIND_GLYPH[kind] && (
              <text className="gv-glyph" x={R - 1} y={-R + 5}>
                {KIND_GLYPH[kind]}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function GraphRenderer({ step, highlights, options, edit }: RendererProps<GraphState>) {
  const { graph, trees, array, matrix, caption } = step.state;
  const canEdit = edit && !(options as { noEdit?: boolean } | undefined)?.noEdit ? edit : undefined;
  const order = useMemo(() => new Map(step.highlights.map((h, i) => [h.id, i])), [step.highlights]);
  return (
    <div className="gv-wrap">
      {caption && <p className="arr-caption">{caption}</p>}
      <div className="gv-row">
        {graph && (
          <section className="gv-box" aria-label={graph.name ?? "Graph"}>
            {graph.name && <h3 className="sub-label">{graph.name}</h3>}
            {graph.n === 0 ? <p className="gv-empty">empty graph</p> : <GraphSvg g={graph} highlights={highlights} order={order} edit={canEdit} />}
          </section>
        )}
        {trees && trees.length > 0 && (
          <div className="gv-side">
            <TreeRenderer step={{ ...step, state: { trees } }} highlights={highlights} />
          </div>
        )}
        {matrix && (
          <div className="gv-side">
            <MatrixRenderer step={{ ...step, state: matrix }} highlights={highlights} />
          </div>
        )}
      </div>
      {array && <ArrayRenderer step={{ ...step, state: array }} highlights={highlights} />}
    </div>
  );
}
