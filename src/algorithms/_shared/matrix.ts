import type { MatrixField, Rng } from "../../engine/types";
import { randInt } from "../../engine/random";
import type { ArrayState, CellValue } from "./array";

export function matrixField(key: string, label: string, opts: Partial<MatrixField> = {}): MatrixField {
  return { key, label, kind: "matrix", maxRows: 8, maxCols: 8, min: -99, max: 99, ...opts };
}

export function randomMatrix(rng: Rng, rows: number, cols: number, lo = 0, hi = 9): number[][] {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => randInt(rng, lo, hi)));
}

/** n×n matrix 1..n² in reading order — easy to follow in rotation demos. */
export function countingMatrix(rows: number, cols = rows): number[][] {
  return Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => r * cols + c + 1));
}

export interface MatrixState {
  matrix: CellValue[][];
  rowLabels?: string[];
  colLabels?: string[];
  caption?: string;
  /** Optional 1-D arrays shown under the matrix (highlight ids as in the array renderer). */
  arrays?: ArrayState;
  result?: unknown;
}

/** Highlight id of a matrix cell. */
export const mi = (r: number, c: number) => `m:${r},${c}`;

