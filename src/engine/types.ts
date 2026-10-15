import type { ComponentType } from "react";

/* ---------- Catalog ---------- */

export type CategoryId =
  | "fundamentals"
  | "arrays-hashing"
  | "two-pointers"
  | "searching"
  | "sorting"
  | "linked-lists"
  | "stacks-queues"
  | "heaps"
  | "trees"
  | "graphs"
  | "backtracking"
  | "dp"
  | "greedy"
  | "strings"
  | "bits"
  | "math"
  | "design"
  | "cheatsheet";

export type Difficulty = "core" | "intermediate" | "advanced";

export interface Problem {
  /** LeetCode problem number. */
  id: number;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  /** URL slug, e.g. "two-sum". */
  slug: string;
  /** One line, in our own words, on which pattern the problem uses. */
  note: string;
}

/** Light metadata, loaded eagerly so menus and search never wait for an algorithm chunk. */
export interface AlgorithmMeta {
  id: string;
  title: string;
  category: CategoryId;
  subcategory: string;
  difficulty: Difficulty;
  /** One sentence shown in lists and search. */
  summary: string;
  /** Sort order inside the subcategory (lower first). */
  order?: number;
  /** Extra search terms. */
  keywords?: string[];
  problems?: Problem[];
}

/* ---------- Steps ---------- */

export type HighlightKind =
  | "current"
  | "visited"
  | "frontier"
  | "path"
  | "compare"
  | "swap"
  | "sorted"
  | "found"
  | "pruned"
  | "active"
  | "window"
  | "removed"
  | "match"
  | "mismatch"
  | "pivot"
  | "start"
  | "end"
  | "wall";

export interface Highlight {
  /** Renderer-specific target id, e.g. "cell:3,4", "i:2", "node:7", "edge:1-2". */
  id: string;
  kind: HighlightKind;
}

export interface Frame {
  /** e.g. "dfs(2, 3)" */
  call: string;
  /** Optional local variables shown under the frame. */
  locals?: Record<string, unknown>;
}

export type AuxKind = "queue" | "stack" | "deque" | "set" | "map" | "heap" | "list";

export interface AuxStructure {
  label: string;
  kind: AuxKind;
  /** For map: [key, value] pairs. Otherwise a list of items (front/top first is decided by kind). */
  items: unknown[];
  /** Indexes of items to emphasise (e.g. just pushed). */
  highlight?: number[];
}

export type Counters = Partial<Record<CounterId, number>>;
export type CounterId =
  | "comparisons"
  | "swaps"
  | "accesses"
  | "writes"
  | "expanded"
  | "filled"
  | "calls"
  | "hashes"
  | "collisions"
  | "probes"
  | "pushes"
  | "pops";

export interface Step<S> {
  /** Semantic line marker; mapped to a line number per language via `@mark` comments. */
  line: string;
  state: S;
  vars: Record<string, unknown>;
  callStack?: Frame[];
  aux?: AuxStructure[];
  highlights: Highlight[];
  /** Plain-English narration of what this step does. */
  message: string;
  /** Cumulative counters up to and including this step. */
  counters?: Counters;
}

/* ---------- Inputs ---------- */

interface FieldBase {
  key: string;
  label: string;
  help?: string;
}

export interface NumbersField extends FieldBase {
  kind: "numbers";
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  integer?: boolean;
  /** Require a non-decreasing array. */
  sorted?: boolean;
}

export interface NumberField extends FieldBase {
  kind: "number";
  min?: number;
  max?: number;
  integer?: boolean;
}

export interface TextField extends FieldBase {
  kind: "text";
  minLength?: number;
  maxLength?: number;
  /** Allowed characters, e.g. /^[a-z]*$/ */
  pattern?: RegExp;
  patternHint?: string;
}

export interface WordsField extends FieldBase {
  kind: "words";
  maxLength?: number;
  pattern?: RegExp;
  patternHint?: string;
}

export interface SelectField extends FieldBase {
  kind: "select";
  options: { value: string; label: string }[];
}

/**
 * A grid as an array of equal-length row strings.
 * '.' open, '#' wall, 'S' start, 'E' end, '1'-'9' weights / land, depending on `alphabet`.
 */
export interface GridField extends FieldBase {
  kind: "grid";
  maxRows: number;
  maxCols: number;
  /** Allowed characters. */
  alphabet: string;
  /** Characters that must appear exactly once (e.g. "SE"). */
  unique?: string;
  /** Character of an unpainted cell (default "."). */
  empty?: string;
  /** Paint tools offered when drawing on the grid: char -> label. */
  tools?: { char: string; label: string }[];
}

/** Rows of numbers. */
export interface MatrixField extends FieldBase {
  kind: "matrix";
  maxRows: number;
  maxCols: number;
  min?: number;
  max?: number;
  /** All rows must have the same length (default true). */
  rectangular?: boolean;
}

/** Binary tree in level order, `null` for missing children. */
export interface TreeField extends FieldBase {
  kind: "tree";
  maxNodes: number;
  min?: number;
  max?: number;
}

/**
 * A graph on nodes 0..n-1: `{ n, edges: [[u, v, w?], ...], directed, pos?, labels? }` (see `_shared/graph.ts`).
 * Text form: `n=6 directed` on the first line, then edges like `0-1:4, 1>2`.
 */
export interface GraphField extends FieldBase {
  kind: "graph";
  maxNodes: number;
  /** Force every value to be directed (true) or undirected (false); leave undefined to allow both. */
  directed?: boolean;
  /** Edges carry integer weights (default weight 1 when omitted in the text form). */
  weighted?: boolean;
  minWeight?: number;
  maxWeight?: number;
  /** Reject inputs without at least this many nodes (default 1). */
  minNodes?: number;
}

/** Free JSON validated by the module's `validate`. */
export interface JsonField extends FieldBase {
  kind: "json";
}

export type InputField =
  | NumbersField
  | NumberField
  | TextField
  | WordsField
  | SelectField
  | GridField
  | MatrixField
  | TreeField
  | GraphField
  | JsonField;

export interface InputSchema<I> {
  fields: InputField[];
  /** Cross-field validation. Return an error message or null. */
  validate?: (input: I) => string | null;
}

/* ---------- Modules ---------- */

export type RendererId =
  | "grid"
  | "array"
  | "bars"
  | "stackqueue"
  | "hashtable"
  | "linkedlist"
  | "tree"
  | "graph"
  | "decisiontree"
  | "dptable"
  | "matrix";

export interface CodeSet {
  python: string;
  javascript: string;
  java?: string;
  cpp?: string;
}

export type Language = keyof CodeSet;

export interface Preset<I> {
  name: string;
  input: I;
}

export type Rng = () => number;

export interface AlgorithmModule<I = any, S = any> extends AlgorithmMeta {
  renderer: RendererId;
  inputSchema: InputSchema<I>;
  presets: Preset<I>[];
  randomInput: (size: number, rng?: Rng) => I;
  code: CodeSet;
  generate: (input: I) => Generator<Step<S>, void, unknown>;
  /** Plain implementation used by tests. */
  reference: (input: I) => unknown;
  /** Extracts the algorithm's answer from the final state, compared against `reference` in tests. */
  outputOf: (finalState: S, finalStep: Step<S>) => unknown;
  /** Markdown with `## ` sections: Explanation, Complexity, When to use, Pitfalls, Template. */
  info: string;
  /** Optional per-module renderer options. */
  rendererOptions?: Record<string, unknown>;
  /** Override legend wording for a highlight kind, e.g. { wall: "Water" }. */
  legendLabels?: Partial<Record<HighlightKind, string>>;
  /** Kinds always shown in the legend even if no step uses them (e.g. start/end/wall drawn from the input). */
  legendExtra?: HighlightKind[];
}

export interface RendererProps<S = any> {
  step: Step<S>;
  highlights: Map<string, HighlightKind>;
  options?: Record<string, unknown>;
  /** Present when the renderer may edit an input field directly (e.g. drawing on a grid). */
  edit?: {
    /** Current value of the editable field. */
    value: any;
    onChange: (next: any) => void;
    /** Active paint tool, e.g. "#" for walls. */
    tool?: string;
    /** Grid: the character a cell gets when a painted cell is toggled off (default "."). */
    empty?: string;
    /** Graph: weight given to new edges. */
    weight?: number;
  };
}

export type Renderer = ComponentType<RendererProps>;
