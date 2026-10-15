import type {
  AlgorithmModule,
  AuxStructure,
  CounterId,
  Counters,
  Frame,
  Highlight,
  HighlightKind,
  Step,
} from "./types";

export const MAX_STEPS = 10_000;

export interface Trace<S = any> {
  steps: Step<S>[];
  /** True when generation stopped at MAX_STEPS. */
  truncated: boolean;
  error?: string;
}

export function buildTrace<I, S>(module: AlgorithmModule<I, S>, input: I): Trace<S> {
  const steps: Step<S>[] = [];
  try {
    for (const step of module.generate(input)) {
      steps.push(step);
      if (steps.length >= MAX_STEPS) return { steps, truncated: true };
    }
  } catch (err) {
    return { steps, truncated: false, error: err instanceof Error ? err.message : String(err) };
  }
  return { steps, truncated: false };
}

export interface StepParts<S> {
  state: S;
  vars?: Record<string, unknown>;
  aux?: AuxStructure[];
  highlights?: Highlight[];
  callStack?: Frame[];
}

/**
 * Helper used inside generators: keeps cumulative counters and deep-copies
 * everything it records so a snapshot can never be mutated by later steps.
 */
export class Tracer<S> {
  counters: Counters = {};

  count(id: CounterId, n = 1): void {
    this.counters[id] = (this.counters[id] ?? 0) + n;
  }

  step(line: string, message: string, parts: StepParts<S>): Step<S> {
    return deepFreeze({
      line,
      message,
      state: structuredClone(parts.state),
      vars: structuredClone(parts.vars ?? {}),
      aux: parts.aux ? structuredClone(parts.aux) : undefined,
      highlights: parts.highlights ? parts.highlights.slice() : [],
      callStack: parts.callStack ? structuredClone(parts.callStack) : undefined,
      counters: { ...this.counters },
    });
  }
}

/** Build highlights of one kind for several ids. */
export function hl(kind: HighlightKind, ...ids: (string | false | null | undefined)[]): Highlight[] {
  return ids.filter((id): id is string => typeof id === "string").map((id) => ({ id, kind }));
}

// Read once: under Vitest `import.meta.env` is rebuilt on every access, which made deepFreeze very slow.
const PROD = !!import.meta.env?.PROD;

function deepFreeze<T>(value: T): T {
  if (PROD) return value; // freezing is a dev-time guard only
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.keys(value)) deepFreeze((value as Record<string, unknown>)[key]);
  }
  return value;
}

/** Grid cell mark characters (see GridState.marks) and the highlight kind each one draws as. */
export const GRID_MARK_KINDS: Record<string, HighlightKind> = {
  v: "visited",
  f: "frontier",
  p: "path",
  x: "pruned",
  a: "active",
  m: "match",
};

/** Collect every highlight kind used in a trace (for the legend). */
export function kindsInTrace(steps: Step<unknown>[]): HighlightKind[] {
  const kinds = new Set<HighlightKind>();
  for (const s of steps) {
    for (const h of s.highlights) kinds.add(h.kind);
    const st = s.state as { marks?: unknown; ranges?: { kind: HighlightKind }[]; arrays?: { ranges?: { kind: HighlightKind }[] } } | null;
    if (typeof st?.marks === "string") for (const ch of new Set(st.marks)) if (GRID_MARK_KINDS[ch]) kinds.add(GRID_MARK_KINDS[ch]);
    for (const r of [...(st?.ranges ?? []), ...(st?.arrays?.ranges ?? [])]) kinds.add(r.kind);
  }
  return [...kinds];
}
