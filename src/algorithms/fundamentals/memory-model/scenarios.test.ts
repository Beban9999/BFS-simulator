import { describe, expect, it } from "vitest";
import { SCENARIOS } from "./scenarios";

describe("memory-model scenarios", () => {
  it("every reference points to an object of the same snapshot and every line exists", () => {
    for (const sc of SCENARIOS) {
      expect(sc.steps.length, sc.id).toBeGreaterThan(1);
      for (const [k, s] of sc.steps.entries()) {
        const where = `${sc.id} step ${k}`;
        const ids = new Set(s.objects.map((o) => o.id));
        expect(ids.size, `${where}: duplicate object ids`).toBe(s.objects.length);
        for (const [name, id] of s.names) expect(ids.has(id), `${where}: ${name} -> ${id}`).toBe(true);
        for (const o of s.objects) {
          if (o.kind === "list") for (const c of o.value as unknown[]) if (typeof c === "object" && c) expect(ids.has((c as { ref: string }).ref), `${where}: ${o.id} cell`).toBe(true);
        }
        expect(s.py, where).toBeLessThan(sc.python.length);
        expect(s.js, where).toBeLessThan(sc.javascript.length);
        expect(sc.python[s.py].trim().length, `${where}: python line is blank`).toBeGreaterThan(0);
        expect(sc.javascript[s.js].trim().length, `${where}: js line is blank`).toBeGreaterThan(0);
      }
    }
  });
});
