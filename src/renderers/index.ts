import type { Renderer, RendererId } from "../engine/types";
import { GridRenderer } from "./Grid";
import { ArrayRenderer } from "./ArrayView";
import { MatrixRenderer } from "./MatrixView";
import { HashTableRenderer } from "./HashTableView";
import { LinkedListRenderer } from "./LinkedListView";
import { StackQueueRenderer } from "./StackQueueView";

/** Renderers are pure views of (state, highlights); algorithms pick one by id. */
export const RENDERERS: Partial<Record<RendererId, Renderer>> = {
  grid: GridRenderer as Renderer,
  array: ArrayRenderer as Renderer,
  bars: ArrayRenderer as Renderer,
  matrix: MatrixRenderer as Renderer,
  hashtable: HashTableRenderer as Renderer,
  linkedlist: LinkedListRenderer as Renderer,
  stackqueue: StackQueueRenderer as Renderer,
};
