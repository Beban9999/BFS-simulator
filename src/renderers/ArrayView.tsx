import { useLayoutEffect, useRef, useState } from "react";
import type { HighlightKind, RendererProps } from "../engine/types";
import type { ArrayRow, ArrayState, Pointer, Range } from "../algorithms/_shared/array";

const GAP = 4;
const BAR_HEIGHT = 170;

/** Small glyph per kind so highlights don't rely on colour alone. */
export const KIND_GLYPH: Partial<Record<HighlightKind, string>> = {
  current: "●",
  compare: "?",
  swap: "⇄",
  sorted: "✓",
  found: "★",
  pivot: "P",
  pruned: "×",
  removed: "×",
  match: "=",
  mismatch: "≠",
  path: "◆",
  frontier: "□",
  visited: "·",
};

export function useWidth<T extends HTMLElement>(): [React.RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(600);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.clientWidth);
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
}

export function ArrayRenderer({ step, highlights }: RendererProps<ArrayState>) {
  const { rows, pointers = [], ranges = [], caption } = step.state;
  const [ref, width] = useWidth<HTMLDivElement>();
  const hasLabels = rows.some((r) => r.label);
  const labelW = hasLabels ? 84 : 0;
  const maxLen = Math.max(
    1,
    ...rows.map((r) => r.values.length),
    ...pointers.map((p) => p.index + 1),
    ...ranges.map((r) => r.to + 1),
  );
  const cell = Math.max(18, Math.min(48, Math.floor((width - labelW) / maxLen) - GAP));

  return (
    <div className="arr" ref={ref} style={{ "--cell": `${cell}px`, "--gap": `${GAP}px` } as React.CSSProperties}>
      {caption && <p className="arr-caption">{caption}</p>}
      {rows.map((row, ri) => (
        <RowView
          key={ri}
          row={row}
          ri={ri}
          cell={cell}
          labelW={labelW}
          highlights={highlights}
          pointers={pointers.filter((p) => (p.row ?? 0) === ri)}
          ranges={ranges.filter((r) => (r.row ?? 0) === ri)}
        />
      ))}
    </div>
  );
}

function RowView({
  row,
  ri,
  cell,
  labelW,
  highlights,
  pointers,
  ranges,
}: {
  row: ArrayRow;
  ri: number;
  cell: number;
  labelW: number;
  highlights: Map<string, HighlightKind>;
  pointers: Pointer[];
  ranges: Range[];
}) {
  const n = row.values.length;
  const span = Math.max(n, ...pointers.map((p) => p.index + 1), ...ranges.map((r) => r.to + 1));
  const x = (i: number) => i * (cell + GAP);
  const totalW = Math.max(0, span * (cell + GAP) - GAP);
  const nums = row.values.filter((v): v is number => typeof v === "number");
  const max = Math.max(1, ...nums);
  const min = Math.min(0, ...nums);
  const height = row.bars ? BAR_HEIGHT : cell;

  // Group pointers that share an index; also allow index -1 (drawn left of the row).
  const byIndex = new Map<number, string[]>();
  for (const p of pointers) byIndex.set(p.index, [...(byIndex.get(p.index) ?? []), p.name]);
  const offset = pointers.some((p) => p.index < 0) ? cell + GAP : 0;

  return (
    <div className="arr-row">
      <div className="arr-label" style={{ width: labelW }}>
        {row.label}
      </div>
      <div className="arr-body" style={{ width: totalW, marginLeft: offset }}>
        {ranges.length > 0 && (
          <div className="arr-ranges" style={{ height: 12 + ranges.length * 16 }}>
            {ranges.map((r, k) => (
              <span
                key={k}
                className={`arr-range rk-${r.kind}`}
                style={{ left: x(r.from), width: Math.max(cell, x(r.to) - x(r.from) + cell), top: 12 + k * 16 }}
              >
                {r.label && <em>{r.label}</em>}
              </span>
            ))}
          </div>
        )}
        {!row.hideIndex && (
          <div className="arr-index" style={{ height: 16 }}>
            {row.values.map((_, i) => (
              <span key={i} style={{ left: x(i), width: cell }}>
                {i}
              </span>
            ))}
          </div>
        )}
        <div className={`arr-cells${row.bars ? " bars" : ""}`} style={{ height }}>
          {row.values.map((v, i) => {
            const kind = highlights.get(`${ri}:${i}`);
            const key = row.ids ? row.ids[i] : i;
            const style: React.CSSProperties = { transform: `translateX(${x(i)}px)`, width: cell };
            if (row.bars) {
              const num = typeof v === "number" ? v : 0;
              const h = Math.max(4, ((num - min) / (max - min || 1)) * (BAR_HEIGHT - 18));
              return (
                <div key={key} className="arr-bar" data-k={kind} style={style}>
                  <div className="bar-fill" style={{ height: h }} />
                  {cell >= 20 && <span className="bar-val">{v}</span>}
                  {kind && KIND_GLYPH[kind] && <span className="glyph">{KIND_GLYPH[kind]}</span>}
                </div>
              );
            }
            return (
              <div
                key={key}
                className={`arr-cell${v === null || v === "" ? " empty" : ""}`}
                data-k={kind}
                style={{ ...style, height: cell, fontSize: cell < 28 ? 11 : cell < 36 ? 13 : 15 }}
              >
                {v === null ? "" : String(v)}
                {kind && KIND_GLYPH[kind] && <span className="glyph">{KIND_GLYPH[kind]}</span>}
              </div>
            );
          })}
        </div>
        {byIndex.size > 0 && (
          <div className="arr-pointers">
            {[...byIndex.entries()].map(([i, names]) => (
              <span key={i} className="arr-pointer" style={{ left: x(i), width: cell }}>
                <b aria-hidden="true">▲</b>
                {names.join(" ")}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
