import { memo, useEffect, useRef } from "react";
import type { HighlightKind, RendererProps } from "../engine/types";
import { GRID_MARK_KINDS } from "../engine/trace";

export interface GridOptions {
  /** Which input characters draw as which kind. Default: '#' wall, 'S' start, 'E' end. */
  charKinds?: Record<string, HighlightKind>;
  /** Print these input characters inside their cells (e.g. weights). */
  showChars?: string;
}

interface GridState {
  grid: string[];
  marks?: string;
  labels?: Record<string, string>;
}

const DEFAULT_CHAR_KINDS: Record<string, HighlightKind> = { "#": "wall", S: "start", E: "end" };

/**
 * Grid of cells (ported from the original BFS/DFS simulator).
 * When `edit` is given, click/drag toggles walls and the start/end can be dragged around.
 */
export function GridRenderer({ step, highlights, options, edit }: RendererProps<GridState>) {
  const opts = (options ?? {}) as GridOptions;
  const charKinds = opts.charKinds ?? DEFAULT_CHAR_KINDS;
  const { grid, marks, labels } = step.state;
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const boxRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ mode: "paint" | "move"; ch: string } | null>(null);
  const editRef = useRef(edit);
  editRef.current = edit;

  useEffect(() => {
    const stop = () => {
      dragRef.current = null;
    };
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    window.addEventListener("blur", stop);
    return () => {
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
      window.removeEventListener("blur", stop);
    };
  }, []);

  const cellFromEvent = (e: React.PointerEvent | PointerEvent): [number, number] | null => {
    const node = (e.target as HTMLElement).closest<HTMLElement>("[data-r]");
    return node ? [Number(node.dataset.r), Number(node.dataset.c)] : null;
  };

  const apply = (r: number, c: number) => {
    const ed = editRef.current;
    const drag = dragRef.current;
    if (!ed || !drag) return;
    const g: string[] = ed.value;
    const ch = g[r][c];
    if (drag.mode === "paint") {
      if (ch === "S" || ch === "E" || ch === drag.ch) return;
      ed.onChange(setCell(g, r, c, drag.ch));
    } else {
      // Moving an endpoint: never onto the other endpoint; it replaces walls.
      if (ch === "S" || ch === "E") return;
      const from = findChar(g, drag.ch);
      let next = g;
      if (from) next = setCell(next, from[0], from[1], ".");
      ed.onChange(setCell(next, r, c, drag.ch));
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!edit || e.button !== 0) return;
    const cell = cellFromEvent(e);
    if (!cell) return;
    e.preventDefault();
    // Pen/touch capture the pointer implicitly; release it so other cells get pointerover.
    const target = e.target as HTMLElement;
    if (target.hasPointerCapture?.(e.pointerId)) target.releasePointerCapture(e.pointerId);
    const [r, c] = cell;
    const ch = (edit.value as string[])[r][c];
    const tool = edit.tool ?? "#";
    if (ch === "S" || ch === "E") {
      dragRef.current = { mode: "move", ch };
      return;
    }
    if (tool === "S" || tool === "E") {
      dragRef.current = { mode: "move", ch: tool };
      apply(r, c);
      return;
    }
    dragRef.current = { mode: "paint", ch: ch === tool ? "." : tool };
    apply(r, c);
  };

  const onPointerOver = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const cell = cellFromEvent(e);
    if (cell) apply(cell[0], cell[1]);
  };

  // Touch: pointerover doesn't fire while a finger moves, so hit-test manually.
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current || e.pointerType === "mouse") return;
    const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    const node = el?.closest<HTMLElement>("[data-r]");
    if (node && boxRef.current?.contains(node)) apply(Number(node.dataset.r), Number(node.dataset.c));
  };

  const maxW = Math.min(640, cols * 44);
  const labelSize = cols > 22 ? 8 : cols > 14 ? 10 : 12;

  return (
    <div
      ref={boxRef}
      className={`grid${edit ? " editable" : ""}`}
      style={{ "--cols": cols, "--max-w": `min(${maxW}px, max(300px, calc((100vh - 400px) * ${cols / Math.max(1, rows)})))`, "--label-size": `${labelSize}px`, touchAction: edit ? "none" : undefined } as React.CSSProperties}
      onPointerDown={onPointerDown}
      onPointerOver={onPointerOver}
      onPointerMove={onPointerMove}
      role="img"
      aria-label={`Grid with ${rows} rows and ${cols} columns`}
    >
      {grid.map((row, r) =>
        Array.from(row).map((ch, c) => (
          <GridCell
            key={`${r},${c}`}
            r={r}
            c={c}
            ch={ch}
            charKind={charKinds[ch]}
            mark={marks ? GRID_MARK_KINDS[marks[r * cols + c]] : undefined}
            hl={highlights.get(`cell:${r},${c}`)}
            label={labels?.[`${r},${c}`] ?? (opts.showChars?.includes(ch) ? ch : undefined)}
          />
        )),
      )}
    </div>
  );
}

const GridCell = memo(function GridCell({
  r,
  c,
  charKind,
  mark,
  hl,
  label,
}: {
  r: number;
  c: number;
  ch: string;
  charKind?: HighlightKind;
  mark?: HighlightKind;
  hl?: HighlightKind;
  label?: string;
}) {
  const endpoint = charKind === "start" || charKind === "end";
  let kind: HighlightKind | undefined;
  if (endpoint) kind = charKind;
  else if (hl) kind = hl;
  else if (mark) kind = mark;
  else kind = charKind;
  const outline = endpoint && (hl === "current" || hl === "path" || mark === "path");
  return (
    <div
      className={`cell${kind ? ` k-${kind}` : ""}${outline ? " ring" : ""}`}
      data-r={r}
      data-c={c}
    >
      {label}
    </div>
  );
});

function setCell(grid: string[], r: number, c: number, ch: string): string[] {
  return grid.map((row, i) => (i === r ? row.slice(0, c) + ch + row.slice(c + 1) : row));
}

function findChar(grid: string[], ch: string): [number, number] | null {
  for (let r = 0; r < grid.length; r++) {
    const c = grid[r].indexOf(ch);
    if (c >= 0) return [r, c];
  }
  return null;
}
