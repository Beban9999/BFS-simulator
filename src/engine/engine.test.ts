import { describe, expect, it } from "vitest";
import { parseCode } from "./markers";
import { checkField, parseField } from "./input";

describe("parseCode", () => {
  it("strips markers and maps them to 1-based lines", () => {
    const src = "def f():\n    x = 1  # @mark init\n    return x  # @mark ret, done\n";
    const parsed = parseCode(src);
    expect(parsed.text).toBe("def f():\n    x = 1\n    return x");
    expect(parsed.marks).toEqual({ init: 2, ret: 3, done: 3 });
  });

  it("handles JavaScript comments", () => {
    expect(parseCode("let a = 1; // @mark a").marks).toEqual({ a: 1 });
  });
});

describe("input parsing", () => {
  it("parses number lists in several formats", () => {
    const field = { key: "a", label: "Array", kind: "numbers" as const };
    expect(parseField(field, "[1, 2,3]").value).toEqual([1, 2, 3]);
    expect(parseField(field, "1 2 3").value).toEqual([1, 2, 3]);
    expect(parseField(field, "1, x").error).toBeTruthy();
  });

  it("validates grids", () => {
    const field = { key: "g", label: "Grid", kind: "grid" as const, maxRows: 5, maxCols: 5, alphabet: ".#SE", unique: "SE" };
    expect(checkField(field, ["S.", ".E"]).error).toBeUndefined();
    expect(checkField(field, ["S.", "."]).error).toMatch(/same length/);
    expect(checkField(field, ["S.", ".."]).error).toMatch(/exactly one "E"/);
  });

  it("parses level-order trees", () => {
    const field = { key: "t", label: "Tree", kind: "tree" as const, maxNodes: 10 };
    expect(parseField(field, "[1, null, 2]").value).toEqual([1, null, 2]);
  });
});
