import type { ArrayState, CellValue } from "./array";
import type { DTreeView } from "./decision";

export type RC = [number, number];

/** A DP table. 1D DP is a table too: e.g. a row with the input and a row with dp[i]. */
export interface DPTable {
  rows: CellValue[][];
  rowLabels?: string[];
  colLabels?: string[];
  /** Thicker left border before these columns (e.g. to separate the "empty prefix" column). */
  caption?: string;
}

export interface DPState {
  /** Recurrence shown above the table, e.g. "dp[i] = max(dp[i-1], dp[i-2] + nums[i])". */
  formula?: string;
  table?: DPTable;
  /** Dependency arrows: from a cell that is read to the cell being computed (table coordinates). */
  arrows?: { from: RC; to: RC }[];
  /** Optional recursion tree (drawn with the decision-tree renderer's tree), ids `dn` / `de`. */
  tree?: DTreeView;
  treeTitle?: string;
  /** Extra arrays under the table, ids `ai(i, row)`. */
  array?: ArrayState;
  caption?: string;
  result?: unknown;
}

/** Highlight id of a DP table cell. */
export const tc = (r: number, c: number) => `t:${r},${c}`;

/** Show ∞ / -∞ / null nicely in tables. */
export const cell = (v: number | null | undefined): CellValue => (v === null || v === undefined ? null : v === Infinity ? "∞" : v === -Infinity ? "-∞" : v);
