import type { HighlightKind, RendererProps } from "../engine/types";
import { bi, ei, type HashState } from "../algorithms/_shared/hash";
import { KIND_GLYPH } from "./ArrayView";

function Table({
  buckets,
  mode,
  highlights,
  old,
}: {
  buckets: string[][];
  mode: HashState["mode"];
  highlights: Map<string, HighlightKind>;
  old?: boolean;
}) {
  return (
    <ol className={`ht${old ? " ht-old" : ""}`} aria-label={old ? "Old table" : "Hash table"}>
      {buckets.map((chain, i) => {
        const bk = highlights.get(bi(i, old));
        return (
          <li key={i} className="ht-row">
            <span className="ht-index" data-k={bk}>
              {i}
            </span>
            <span className="ht-chain">
              {chain.length === 0 && <span className="ht-empty">{mode === "chaining" ? "∅" : "empty"}</span>}
              {chain.map((key, j) => {
                const k = old ? undefined : highlights.get(ei(i, j));
                return (
                  <span key={`${key}-${j}`} className="ht-entry-wrap">
                    {j > 0 && <span className="ht-arrow" aria-hidden="true">→</span>}
                    <span className="ht-entry" data-k={k}>
                      {key}
                      {k && KIND_GLYPH[k] && <span className="glyph">{KIND_GLYPH[k]}</span>}
                    </span>
                  </span>
                );
              })}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function HashTableRenderer({ step, highlights }: RendererProps<HashState>) {
  const { buckets, mode, hashLine, old, size } = step.state;
  const load = buckets.length ? size / buckets.length : 0;
  return (
    <div className="ht-wrap">
      <p className="arr-caption">
        {mode === "chaining" ? "Separate chaining" : "Open addressing (linear probing)"} · size {size} / capacity {buckets.length} · load{" "}
        {load.toFixed(2)}
      </p>
      {hashLine && <p className="ht-hash">{hashLine}</p>}
      <div className="ht-tables">
        {old && (
          <div>
            <h3 className="sub-label">Old table</h3>
            <Table buckets={old} mode={mode} highlights={highlights} old />
          </div>
        )}
        <div>
          {old && <h3 className="sub-label">New table</h3>}
          <Table buckets={buckets} mode={mode} highlights={highlights} />
        </div>
      </div>
    </div>
  );
}
