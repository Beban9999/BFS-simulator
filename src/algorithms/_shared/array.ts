import type { HighlightKind, NumbersField, Rng } from "../../engine/types";
import { randInt } from "../../engine/random";

export type CellValue = number | string | null;

export interface ArrayRow {
  label?: string;
  values: CellValue[];
  /** Stable identities so the renderer can animate items moving between indexes. */
  ids?: number[];
  /** Hide the index header above this row. */
  hideIndex?: boolean;
  /** Draw as bars (height ∝ value) instead of cells. */
  bars?: boolean;
}

export interface Pointer {
  name: string;
  index: number;
  row?: number;
}

export interface Range {
  from: number;
  to: number;
  row?: number;
  kind: HighlightKind;
  label?: string;
}

export interface ArrayState {
  rows: ArrayRow[];
  pointers?: Pointer[];
  ranges?: Range[];
  /** Short line shown above the arrays, e.g. "target = 9". */
  caption?: string;
  /** Answer carried in the state for tests / final display. */
  result?: unknown;
}

/** Highlight id of a cell: row 0 by default. */
export const ai = (i: number, row = 0) => `${row}:${i}`;

export const range = (n: number) => Array.from({ length: n }, (_, i) => i);

export function numbersField(key: string, label: string, opts: Partial<NumbersField> = {}): NumbersField {
  return { key, label, kind: "numbers", integer: true, min: -99, max: 99, minLength: 0, maxLength: 16, ...opts };
}

export function randomNumbers(rng: Rng, size: number, lo = 0, hi = 30, maxLen = 16): number[] {
  const n = Math.max(1, Math.min(maxLen, size));
  return Array.from({ length: n }, () => randInt(rng, lo, hi));
}

export function sortedNumbers(rng: Rng, size: number, lo = 0, hi = 40, maxLen = 16): number[] {
  return randomNumbers(rng, size, lo, hi, maxLen).sort((a, b) => a - b);
}
