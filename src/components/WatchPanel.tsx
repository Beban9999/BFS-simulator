import type { AuxStructure, Counters, HighlightKind, Step } from "../engine/types";

export function formatValue(v: unknown): string {
  if (v === null) return "None";
  if (v === undefined) return "—";
  if (typeof v === "string") return v;
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : v > 0 ? "∞" : "-∞";
  if (typeof v === "boolean") return v ? "True" : "False";
  if (Array.isArray(v)) {
    const inner = v.slice(0, 30).map(formatValue).join(", ");
    return `[${inner}${v.length > 30 ? `, … +${v.length - 30}` : ""}]`;
  }
  if (typeof v === "object") {
    const entries = Object.entries(v as Record<string, unknown>);
    return `{${entries
      .slice(0, 20)
      .map(([k, x]) => `${k}: ${formatValue(x)}`)
      .join(", ")}${entries.length > 20 ? ", …" : ""}}`;
  }
  return String(v);
}

export function WatchPanel({ step, prev }: { step: Step<unknown>; prev?: Step<unknown> }) {
  const vars = Object.entries(step.vars);
  return (
    <section className="panel" aria-label="Variables">
      <div className="panel-head">
        <h2 className="panel-title">Watch</h2>
      </div>
      <div className="panel-body">
        {vars.length === 0 ? (
          <p className="empty-note">No variables yet.</p>
        ) : (
          <table className="watch-table">
            <tbody>
              {vars.map(([k, v]) => {
                const text = formatValue(v);
                const changed = prev !== undefined && formatValue(prev.vars[k]) !== text;
                return (
                  <tr key={k}>
                    <th scope="row">{k}</th>
                    <td className={changed ? "changed" : undefined}>{text}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {step.callStack && (
          <>
            <h3 className="sub-label">Call stack (top first)</h3>
            {step.callStack.length === 0 ? (
              <p className="empty-note">Empty — every call has returned.</p>
            ) : (
              <ol className="call-stack">
                {[...step.callStack].reverse().map((f, i) => (
                  <li key={step.callStack!.length - i}>
                    {f.call}
                    {f.locals && Object.keys(f.locals).length > 0 && (
                      <span className="locals">
                        {Object.entries(f.locals)
                          .map(([k, v]) => `${k}=${formatValue(v)}`)
                          .join("  ")}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </>
        )}

        {step.aux?.map((a) => <AuxView key={a.label} aux={a} />)}
      </div>
    </section>
  );
}

const MAX_ITEMS = 40;

function AuxView({ aux }: { aux: AuxStructure }) {
  const hot = new Set(aux.highlight ?? []);
  const body = () => {
    if (aux.items.length === 0) return <p className="empty-note">empty</p>;
    if (aux.kind === "map") {
      const items = aux.items as [unknown, unknown][];
      return (
        <div className="aux-map">
          {items.slice(0, MAX_ITEMS).map(([k, v], i) => (
            <div key={i} style={{ display: "contents" }}>
              <span className={`k${hot.has(i) ? " hot" : ""}`}>{formatValue(k)}</span>
              <span className={hot.has(i) ? "hot" : undefined}>{formatValue(v)}</span>
            </div>
          ))}
          {items.length > MAX_ITEMS && <span className="aux-more">+{items.length - MAX_ITEMS} more</span>}
        </div>
      );
    }
    if (aux.kind === "stack") {
      // items are bottom → top; show the top first.
      const n = aux.items.length;
      const shown = aux.items.map((v, i) => [v, i] as const).reverse().slice(0, MAX_ITEMS);
      return (
        <div className="aux-items vertical">
          <span className="aux-end">top</span>
          {shown.map(([v, i]) => (
            <span key={i} className={`aux-item${hot.has(i) ? " hot" : ""}`}>
              {formatValue(v)}
            </span>
          ))}
          {n > MAX_ITEMS && <span className="aux-more">+{n - MAX_ITEMS} more below</span>}
        </div>
      );
    }
    const n = aux.items.length;
    const ends = aux.kind === "queue" || aux.kind === "deque";
    return (
      <div className="aux-items">
        {ends && <span className="aux-end">front</span>}
        {aux.items.slice(0, MAX_ITEMS).map((v, i) => (
          <span key={i} className={`aux-item${hot.has(i) ? " hot" : ""}`}>
            {formatValue(v)}
          </span>
        ))}
        {n > MAX_ITEMS && <span className="aux-more">+{n - MAX_ITEMS} more</span>}
        {ends && <span className="aux-end">back</span>}
      </div>
    );
  };
  return (
    <div className="aux">
      <h3 className="sub-label">
        {aux.label} <span style={{ fontWeight: 500 }}>· {aux.items.length}</span>
      </h3>
      {body()}
    </div>
  );
}

const COUNTER_LABEL: Record<string, string> = {
  comparisons: "Comparisons",
  swaps: "Swaps",
  accesses: "Array reads",
  writes: "Writes",
  expanded: "Expanded",
  filled: "Cells filled",
  calls: "Calls",
  hashes: "Hashes",
  collisions: "Collisions",
  probes: "Probes",
  pushes: "Pushes",
  pops: "Pops",
};

export function CountersPanel({ counters }: { counters?: Counters }) {
  const entries = Object.entries(counters ?? {});
  if (!entries.length) return null;
  return (
    <section className="panel" aria-label="Operation counters">
      <div className="panel-head">
        <h2 className="panel-title">Counters</h2>
      </div>
      <div className="panel-body">
        <div className="counters">
          {entries.map(([k, v]) => (
            <div key={k} className="counter">
              <b>{v}</b>
              <span>{COUNTER_LABEL[k] ?? k}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export const DEFAULT_LEGEND: Record<HighlightKind, string> = {
  current: "Current",
  visited: "Visited",
  frontier: "Frontier",
  path: "Path / answer",
  compare: "Comparing",
  swap: "Swapping",
  sorted: "Sorted / final",
  found: "Found",
  pruned: "Pruned / skipped",
  active: "Active range",
  window: "Window",
  removed: "Removed",
  match: "Match",
  mismatch: "Mismatch",
  pivot: "Pivot",
  start: "Start",
  end: "End",
  wall: "Wall",
};

export function Legend({ kinds, labels }: { kinds: HighlightKind[]; labels?: Partial<Record<HighlightKind, string>> }) {
  if (!kinds.length) return null;
  return (
    <section className="panel" aria-label="Legend">
      <div className="panel-head">
        <h2 className="panel-title">Legend</h2>
      </div>
      <div className="panel-body">
        <ul className="legend">
          {kinds.map((k) => (
            <li key={k}>
              <span className={`swatch k-${k}`} aria-hidden="true" />
              {labels?.[k] ?? DEFAULT_LEGEND[k]}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
