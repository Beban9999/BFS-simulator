import type { RendererProps } from "../engine/types";
import { mi, type MatrixState } from "../algorithms/_shared/matrix";
import { ArrayRenderer, KIND_GLYPH, useWidth } from "./ArrayView";

export function MatrixRenderer(props: RendererProps<MatrixState>) {
  const { step, highlights } = props;
  const { matrix, rowLabels, colLabels, caption, arrays } = step.state;
  const [ref, width] = useWidth<HTMLDivElement>();
  const cols = Math.max(1, ...matrix.map((r) => r.length));
  const cell = Math.max(24, Math.min(52, Math.floor((width - 40) / cols) - 4));
  const showHeaders = rowLabels || colLabels || cols > 1;

  return (
    <div className="mx" ref={ref} style={{ "--cell": `${cell}px`, "--fs": cell < 32 ? "11px" : "14px" } as React.CSSProperties}>
      {caption && <p className="arr-caption">{caption}</p>}
      {matrix.length > 0 && (
        <table className="mx-table" role="grid" aria-label="Matrix">
          {showHeaders && (
            <thead>
              <tr>
                <th />
                {Array.from({ length: cols }, (_, c) => (
                  <th key={c} scope="col">
                    {colLabels?.[c] ?? c}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {matrix.map((row, r) => (
              <tr key={r}>
                {showHeaders && <th scope="row">{rowLabels?.[r] ?? r}</th>}
                {row.map((v, c) => {
                  const kind = highlights.get(mi(r, c));
                  return (
                    <td key={c} data-k={kind} className={v === "" ? "gap" : v === null ? "empty" : undefined}>
                      {v === null ? "·" : String(v)}
                      {kind && KIND_GLYPH[kind] && <span className="glyph">{KIND_GLYPH[kind]}</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {arrays && <ArrayRenderer {...props} step={{ ...step, state: arrays }} />}
    </div>
  );
}
