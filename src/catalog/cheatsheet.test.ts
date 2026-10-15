import { describe, expect, it } from "vitest";
import type { AlgorithmMeta } from "../engine/types";
import { COMPLEXITY, SIGNALS } from "./cheatsheet";

const metas = import.meta.glob<AlgorithmMeta>("../algorithms/*/*/meta.ts", { eager: true, import: "default" });
const ids = new Set(Object.values(metas).map((m) => m.id));

describe("cheat sheet", () => {
  it("every signal links to existing pages", () => {
    for (const s of SIGNALS) {
      expect(s.pages.length, s.signal).toBeGreaterThan(0);
      for (const id of s.pages) expect(ids.has(id), `${s.signal} -> ${id}`).toBe(true);
    }
  });

  it("signals are unique", () => {
    const names = SIGNALS.map((s) => s.signal);
    expect(new Set(names).size).toBe(names.length);
  });

  it("complexity rows match their columns and link to existing pages", () => {
    for (const t of COMPLEXITY) {
      for (const r of t.rows) {
        expect(r.cells.length, `${t.title} / ${r.name}`).toBe(t.columns.length);
        if (r.page) expect(ids.has(r.page), `${t.title} / ${r.name} -> ${r.page}`).toBe(true);
      }
    }
  });
});
