import { describe, expect, it } from "vitest";
import { CLASSES, formatOps, formatTime, lnFactorial } from "./growth";

describe("big-o growth helpers", () => {
  it("lnFactorial matches the exact product and stays smooth across the switch", () => {
    expect(Math.exp(lnFactorial(5))).toBeCloseTo(120, 6);
    expect(Math.exp(lnFactorial(10))).toBeCloseTo(3628800, 0);
    expect(lnFactorial(200) - lnFactorial(199)).toBeCloseTo(Math.log(200), 6);
  });

  it("log10 agrees with f where f is finite, and classes are ordered at n = 20", () => {
    for (const c of CLASSES) {
      for (const n of [1, 2, 7, 20, 64]) expect(c.log10(n), `${c.label} at ${n}`).toBeCloseTo(Math.log10(c.f(n)), 6);
    }
    const at20 = CLASSES.map((c) => c.log10(20));
    expect([...at20].sort((a, b) => a - b)).toEqual(at20);
  });

  it("formats counts and times", () => {
    expect(formatOps(3)).toBe("1,000");
    expect(formatOps(9)).toBe("1.0 × 10⁹");
    expect(formatOps(Math.log10(9.99e7))).toBe("1.0 × 10⁸");
    expect(formatOps(1565.7)).toBe("≈ 10¹⁵⁶⁵");
    expect(formatTime(8)).toBe("1.0 s");
    expect(formatTime(2)).toBe("1.0 µs");
    expect(formatTime(1)).toBe("< 1 µs");
    expect(formatTime(11)).toBe("17 min");
    expect(formatTime(40)).toBe("longer than the universe has existed");
  });
});
