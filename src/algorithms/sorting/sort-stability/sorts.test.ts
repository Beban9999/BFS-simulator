import { describe, expect, it } from "vitest";
import { seeded, randInt } from "../../../engine/random";
import { brokenKeys, sortRecords, STABLE, type Rec, type SortName } from "./sorts";
import { DATASETS } from "./data";

const names = Object.keys(STABLE) as SortName[];

describe("sort-stability record sorts", () => {
  it("sort by key, and the stable ones never reorder equal keys", () => {
    for (let s = 0; s < 300; s++) {
      const rng = seeded(s);
      const recs: Rec[] = Array.from({ length: 1 + (s % 14) }, (_, pos) => {
        const key = randInt(rng, 0, 3);
        return { pos, label: `r${pos}`, key, keyText: String(key) };
      });
      const expected = recs.slice().sort((a, b) => a.key - b.key || a.pos - b.pos);
      for (const n of names) {
        const out = sortRecords(recs, n);
        expect(out.map((r) => r.key), n).toEqual(expected.map((r) => r.key));
        if (STABLE[n]) expect(out, n).toEqual(expected);
      }
    }
  });

  it("every preset dataset shows each unstable sort breaking the order", () => {
    for (const d of DATASETS) {
      for (const n of names) {
        if (!STABLE[n]) expect(brokenKeys(sortRecords(d.records, n)).size, `${d.name} / ${n}`).toBeGreaterThan(0);
      }
    }
  });
});
