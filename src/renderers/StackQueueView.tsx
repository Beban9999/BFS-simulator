import type { HighlightKind, RendererProps } from "../engine/types";
import { qid, slotId, type SQContainer, type SQItem, type SQState } from "../algorithms/_shared/stackqueue";
import { ArrayRenderer, KIND_GLYPH } from "./ArrayView";

const ITEM_H = 38;
const ITEM_W = 58;
const GAP = 4;
const MIN_SLOTS = 5;

function Item({ item, k, style }: { item: SQItem; k?: HighlightKind; style: React.CSSProperties }) {
  return (
    <div className="sq-pos" style={style}>
      <div className="sq-item" data-k={k}>
        <span className="sq-label" style={{ fontSize: item.label.length > 4 ? 11 : item.label.length > 2 ? 13 : 15 }}>
          {item.label}
        </span>
        {item.sub && <span className="sq-sub">{item.sub}</span>}
        {k && KIND_GLYPH[k] && <span className="glyph">{KIND_GLYPH[k]}</span>}
      </div>
    </div>
  );
}

function StackView({ c, ci, highlights }: { c: SQContainer; ci: number; highlights: Map<string, HighlightKind> }) {
  const slots = Math.max(MIN_SLOTS, c.items.length);
  const height = slots * (ITEM_H + GAP) + GAP;
  const w = c.itemWidth ?? ITEM_W;
  return (
    <div className="sq-stack" style={{ height, width: w + 2 * GAP + 4 }}>
      {c.items.length === 0 && <span className="sq-empty">empty</span>}
      {c.items.map((it, i) => (
        <Item key={it.id} item={it} k={highlights.get(qid(ci, it.id))} style={{ transform: `translateY(${-(i * (ITEM_H + GAP))}px)`, width: w }} />
      ))}
      {c.items.length > 0 && (
        <span className="sq-top" style={{ transform: `translateY(${-((c.items.length - 1) * (ITEM_H + GAP))}px)` }}>
          ◀ top
        </span>
      )}
    </div>
  );
}

function LineView({ c, ci, highlights }: { c: SQContainer; ci: number; highlights: Map<string, HighlightKind> }) {
  const slots = Math.max(MIN_SLOTS, c.items.length);
  const width = slots * (ITEM_W + GAP) + GAP;
  return (
    <div className="sq-line-wrap">
      <span className="sq-end">{c.kind === "deque" ? "front ⇄" : "front ←"}</span>
      <div className="sq-line" style={{ width, height: ITEM_H + 2 * GAP }}>
        {c.items.length === 0 && <span className="sq-empty">empty</span>}
        {c.items.map((it, i) => (
          <Item key={it.id} item={it} k={highlights.get(qid(ci, it.id))} style={{ transform: `translateX(${i * (ITEM_W + GAP)}px)`, width: ITEM_W }} />
        ))}
      </div>
      <span className="sq-end">{c.kind === "deque" ? "⇄ back" : "← back"}</span>
    </div>
  );
}

function RingView({ c, ci, highlights }: { c: SQContainer; ci: number; highlights: Map<string, HighlightKind> }) {
  const slots = c.slots ?? [];
  const n = Math.max(1, slots.length);
  const R = Math.max(70, (n * 52) / (2 * Math.PI));
  const size = 2 * R + 130;
  const mid = size / 2;
  const pos = (i: number, r: number) => {
    const a = (2 * Math.PI * i) / n - Math.PI / 2;
    return [mid + r * Math.cos(a), mid + r * Math.sin(a)];
  };
  const byIndex = new Map<number, string[]>();
  for (const p of c.pointers ?? []) byIndex.set(p.index, [...(byIndex.get(p.index) ?? []), p.name]);
  return (
    <svg className="sq-ring" viewBox={`0 0 ${size} ${size}`} style={{ width: "100%", maxWidth: size }} role="img" aria-label={`${c.name}: circular buffer`}>
      <circle cx={mid} cy={mid} r={R} className="sq-ring-track" />
      {slots.map((s, i) => {
        const [x, y] = pos(i, R);
        const k = highlights.get(slotId(ci, i)) ?? (s ? highlights.get(qid(ci, s.id)) : undefined);
        return (
          <g key={i} transform={`translate(${x}, ${y})`} className="sq-slot" data-k={k}>
            <rect x={-22} y={-17} width={44} height={34} rx={7} className={s ? "full" : "free"} />
            <text y={5} className="sq-slot-val">
              {s ? s.label : ""}
            </text>
            <text y={30} className="sq-slot-idx">
              {i}
            </text>
          </g>
        );
      })}
      {[...byIndex.entries()].map(([i, names]) => {
        const [x, y] = pos(i, R + 46);
        return (
          <text key={i} x={x} y={y + 4} className="sq-ring-ptr">
            {names.join(" ")}
          </text>
        );
      })}
    </svg>
  );
}

export function StackQueueRenderer({ step, highlights }: RendererProps<SQState>) {
  const { array, containers, caption } = step.state;
  return (
    <div className="sq-wrap">
      {caption && <p className="arr-caption">{caption}</p>}
      {array && <ArrayRenderer step={{ ...step, state: array }} highlights={highlights} />}
      <div className="sq-containers">
        {containers.map((c, ci) => (
          <section key={ci} className={`sq-box sq-box-${c.kind}`} aria-label={c.name}>
            <h3 className="sub-label">{c.name}</h3>
            {c.kind === "stack" ? (
              <StackView c={c} ci={ci} highlights={highlights} />
            ) : c.kind === "ring" ? (
              <RingView c={c} ci={ci} highlights={highlights} />
            ) : (
              <LineView c={c} ci={ci} highlights={highlights} />
            )}
            {c.note && <p className="sq-note">{c.note}</p>}
          </section>
        ))}
      </div>
    </div>
  );
}
